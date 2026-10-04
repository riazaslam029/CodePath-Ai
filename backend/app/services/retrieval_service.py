"""
Repository Context Retrieval Pipeline for CodePath AI.
Finds relevant files, traverses dependency chains, and extracts focused code context for AI reasoning.
"""
import re
from typing import List, Dict, Any, Set, Tuple
from app.models.schemas import CodeGraph, FileNode

KEYWORD_SYNONYMS = {
    "auth": ["auth", "login", "register", "token", "jwt", "password", "session", "user", "credential"],
    "authentication": ["auth", "login", "register", "token", "jwt", "password", "session", "credential"],
    "payment": ["payment", "charge", "checkout", "transaction", "billing", "stripe", "invoice", "money"],
    "payments": ["payment", "charge", "checkout", "transaction", "billing", "stripe", "invoice"],
    "user": ["user", "account", "profile", "member", "customer", "identity"],
    "database": ["db", "database", "session", "query", "sql", "orm", "table", "connection", "migration"],
    "api": ["api", "route", "endpoint", "controller", "client", "request", "fetch", "http"],
    "architecture": ["main", "app", "router", "service", "model", "database", "entry"],
}

TIER_ORDER = {
    "component": 1,
    "api": 2,
    "auth": 3,
    "service": 4,
    "model": 5,
    "database": 6,
    "config": 7,
    "util": 8,
    "test": 9
}

class RetrievalService:
    def retrieve_context(self, query: str, graph: CodeGraph, selected_file: str = None) -> Dict[str, Any]:
        """
        Retrieves relevant files, builds dependency flow, and generates focused context prompt.
        """
        nodes_by_id: Dict[str, FileNode] = {n.id: n for n in graph.nodes}
        query_tokens = self._tokenize(query)

        # 1. Score every node in graph
        scored_nodes: List[Tuple[float, FileNode]] = []
        for node in graph.nodes:
            score = self._score_node(node, query_tokens, selected_file)
            if score > 0:
                scored_nodes.append((score, node))

        scored_nodes.sort(key=lambda x: x[0], reverse=True)
        top_seed_nodes = [node for _, node in scored_nodes[:5]]

        # If no direct keyword hit, pick major entry points
        if not top_seed_nodes:
            top_seed_nodes = [nodes_by_id[eid] for eid in graph.entry_points if eid in nodes_by_id][:3]
            if not top_seed_nodes and graph.nodes:
                top_seed_nodes = graph.nodes[:3]

        # 2. Graph Traversal: Traverse dependencies to uncover full end-to-end feature flow
        flow_chain = self._build_feature_flow(top_seed_nodes, graph, nodes_by_id)

        # Relevant files is the union of top seed nodes and the flow chain
        relevant_files_set = set(flow_chain)
        for n in top_seed_nodes:
            relevant_files_set.add(n.id)

        # Sort files in logical execution order (Frontend -> API -> Service -> Model -> Database)
        relevant_files = sorted(
            list(relevant_files_set),
            key=lambda fid: (
                TIER_ORDER.get(nodes_by_id.get(fid, FileNode(id=fid, label=fid, path=fid)).type, 5),
                fid
            )
        )

        # 3. Assemble code context for LLM prompt
        snippets = []
        for fid in relevant_files[:8]:
            node = nodes_by_id.get(fid)
            if not node:
                continue
            snip = (
                f"File: {node.path}\n"
                f"Type: {node.type} | Role: {node.role}\n"
                f"Functions: {', '.join(node.functions[:5]) or 'none'}\n"
                f"Classes: {', '.join(node.classes[:3]) or 'none'}\n"
                f"Imports: {', '.join(node.imports[:6]) or 'none'}\n"
                f"Code snippet preview:\n{node.code_preview or 'No preview'}\n"
            )
            snippets.append(snip)

        return {
            "query": query,
            "relevant_files": relevant_files,
            "flow": flow_chain,
            "context_text": "\n---\n".join(snippets),
            "top_nodes": [nodes_by_id[fid] for fid in relevant_files if fid in nodes_by_id]
        }

    def _tokenize(self, text: str) -> Set[str]:
        words = set(re.findall(r"[a-zA-Z0-9_]+", text.lower()))
        expanded = set(words)
        for w in words:
            if w in KEYWORD_SYNONYMS:
                expanded.update(KEYWORD_SYNONYMS[w])
        return expanded

    def _score_node(self, node: FileNode, tokens: Set[str], selected_file: str = None) -> float:
        score = 0.0
        if selected_file and node.id == selected_file:
            score += 10.0

        path_tokens = set(re.findall(r"[a-zA-Z0-9_]+", node.path.lower()))
        role_tokens = set(re.findall(r"[a-zA-Z0-9_]+", node.role.lower()))

        # Direct path match
        overlap_path = path_tokens.intersection(tokens)
        score += len(overlap_path) * 4.0

        # Role match
        overlap_role = role_tokens.intersection(tokens)
        score += len(overlap_role) * 3.0

        # Functions / Classes match
        for fn in node.functions:
            fn_tokens = set(re.findall(r"[a-zA-Z0-9_]+", fn.lower()))
            if fn_tokens.intersection(tokens):
                score += 2.5

        for cls in node.classes:
            cls_tokens = set(re.findall(r"[a-zA-Z0-9_]+", cls.lower()))
            if cls_tokens.intersection(tokens):
                score += 2.5

        # Summary text overlap
        summary_tokens = set(re.findall(r"[a-zA-Z0-9_]+", node.summary.lower()))
        score += len(summary_tokens.intersection(tokens)) * 1.0

        return score

    def _build_feature_flow(
        self,
        seed_nodes: List[FileNode],
        graph: CodeGraph,
        nodes_by_id: Dict[str, FileNode]
    ) -> List[str]:
        """
        Builds a coherent execution flow:
        Finds paths connecting frontend components through APIs to services and database.
        """
        # Adjacency map
        adj_out: Dict[str, List[str]] = {}
        adj_in: Dict[str, List[str]] = {}
        for edge in graph.edges:
            adj_out.setdefault(edge.source, []).append(edge.target)
            adj_in.setdefault(edge.target, []).append(edge.source)

        flow: List[str] = []
        visited = set()

        # Find starting point: preferably a component or api route
        start_node = None
        for seed in seed_nodes:
            if seed.type in ("component", "api"):
                start_node = seed
                break
        if not start_node and seed_nodes:
            start_node = seed_nodes[0]

        if not start_node:
            return []

        curr = start_node.id
        flow.append(curr)
        visited.add(curr)

        # Walk forwards along outgoing edges (who does it call / import)
        for _ in range(6):
            neighbors = adj_out.get(curr, [])
            unvisited = [n for n in neighbors if n not in visited and n in nodes_by_id]
            if not unvisited:
                break
            # prioritize next layer in tier order
            unvisited.sort(key=lambda n: TIER_ORDER.get(nodes_by_id[n].type, 5))
            next_node = unvisited[0]
            flow.append(next_node)
            visited.add(next_node)
            curr = next_node

        # If start node was in the middle (e.g. auth_service), walk backwards to find frontend callers
        curr = start_node.id
        backward_flow = []
        for _ in range(3):
            callers = adj_in.get(curr, [])
            unvisited_callers = [c for c in callers if c not in visited and c in nodes_by_id]
            if not unvisited_callers:
                break
            unvisited_callers.sort(key=lambda c: TIER_ORDER.get(nodes_by_id[c].type, 5))
            caller = unvisited_callers[0]
            backward_flow.insert(0, caller)
            visited.add(caller)
            curr = caller

        final_flow = backward_flow + flow
        # Deduplicate while preserving order
        deduped = []
        seen = set()
        for f in final_flow:
            if f not in seen:
                seen.add(f)
                deduped.append(f)

        return deduped

retrieval_service_instance = RetrievalService()
