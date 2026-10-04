"""
Graph Builder Engine for CodePath AI.
Resolves imports, connects frontend API calls to backend routes, and constructs the complete dependency graph.
"""
import os
import posixpath
from typing import Dict, List, Any, Set, Tuple
from app.models.schemas import FileNode, GraphEdge, CodeGraph

class GraphBuilder:
    def __init__(self, analyzed_files: List[Dict[str, Any]], repo_name: str = "Repository", repo_owner: str = "CodePath"):
        self.analyzed_files = analyzed_files
        self.repo_name = repo_name
        self.repo_owner = repo_owner
        self.file_map = {f["id"]: f for f in analyzed_files}
        self.path_lookup = self._build_path_lookup()

    def _build_path_lookup(self) -> Dict[str, str]:
        """
        Creates flexible lookup keys for fast matching:
        - exact path: frontend/src/api/apiClient.js
        - without extension: frontend/src/api/apiClient
        - relative suffixes: src/api/apiClient, apiClient.js, apiClient
        """
        lookup = {}
        for file_id in self.file_map:
            normalized = file_id.replace("\\", "/").strip("/")
            lookup[normalized] = file_id

            # without extension
            base, _ = posixpath.splitext(normalized)
            lookup[base] = file_id

            # python module dot-notation (e.g. backend.services.auth_service)
            dot_notation = base.replace("/", ".")
            lookup[dot_notation] = file_id

            # filename only
            fname = posixpath.basename(normalized)
            if fname not in lookup:
                lookup[fname] = file_id
            fname_no_ext, _ = posixpath.splitext(fname)
            if fname_no_ext not in lookup:
                lookup[fname_no_ext] = file_id

        return lookup

    def build(self) -> CodeGraph:
        nodes: List[FileNode] = []
        edges: List[GraphEdge] = []
        edge_set: Set[Tuple[str, str, str]] = set()

        languages: Dict[str, int] = {}
        in_degrees: Dict[str, int] = {f_id: 0 for f_id in self.file_map}

        for file_data in self.analyzed_files:
            file_id = file_data["id"]
            lang = file_data.get("language", "unknown")
            languages[lang] = languages.get(lang, 0) + 1

            # Resolve module/file imports
            imports = file_data.get("imports", [])
            for imp in imports:
                target_id = self._resolve_import(file_id, imp)
                if target_id and target_id != file_id:
                    edge_key = (file_id, target_id, "imports")
                    if edge_key not in edge_set:
                        edge_set.add(edge_key)
                        edges.append(GraphEdge(
                            source=file_id,
                            target=target_id,
                            type="imports",
                            label="imports"
                        ))
                        in_degrees[target_id] = in_degrees.get(target_id, 0) + 1

            # Cross-tier bridging: Resolve API endpoint calls to backend route files
            api_calls = file_data.get("api_calls", [])
            for url in api_calls:
                target_route_id = self._resolve_api_url_to_route(url)
                if target_route_id and target_route_id != file_id:
                    edge_key = (file_id, target_route_id, "api_call")
                    if edge_key not in edge_set:
                        edge_set.add(edge_key)
                        edges.append(GraphEdge(
                            source=file_id,
                            target=target_route_id,
                            type="api_call",
                            label=f"calls HTTP {url}"
                        ))
                        in_degrees[target_route_id] = in_degrees.get(target_route_id, 0) + 1

            nodes.append(FileNode(**{
                "id": file_data["id"],
                "label": file_data["label"],
                "path": file_data["path"],
                "type": file_data["type"],
                "language": file_data["language"],
                "size": file_data["size"],
                "lines": file_data["lines"],
                "role": file_data["role"],
                "functions": file_data.get("functions", []),
                "classes": file_data.get("classes", []),
                "imports": file_data.get("imports", []),
                "exports": file_data.get("exports", []),
                "summary": file_data.get("summary", ""),
                "code_preview": file_data.get("code_preview")
            }))

        # Determine entry points (nodes with 0 in-degree or named main/app)
        entry_points = []
        for node in nodes:
            name_lower = node.label.lower()
            if in_degrees.get(node.id, 0) == 0 or "main" in name_lower or "app" in name_lower or "index" in name_lower:
                entry_points.append(node.id)

        return CodeGraph(
            repo_name=self.repo_name,
            repo_owner=self.repo_owner,
            total_files=len(nodes),
            languages=languages,
            entry_points=entry_points[:6],
            nodes=nodes,
            edges=edges
        )

    def _resolve_import(self, source_id: str, import_str: str) -> str:
        """Resolves relative and package imports to known repository files."""
        source_dir = posixpath.dirname(source_id)

        # Relative import (JS/TS or Python relative)
        if import_str.startswith("."):
            joined = posixpath.normpath(posixpath.join(source_dir, import_str))
            for ext in ["", ".js", ".jsx", ".ts", ".tsx", ".py", "/index.js", "/index.ts"]:
                candidate = joined + ext
                if candidate in self.file_map:
                    return candidate
            if joined in self.path_lookup:
                return self.path_lookup[joined]

        # Python dotted import: e.g. "backend.services.auth_service" or "models.user"
        cleaned_imp = import_str.strip()
        if cleaned_imp in self.path_lookup:
            return self.path_lookup[cleaned_imp]

        parts = cleaned_imp.split(".")
        if len(parts) > 1:
            for i in range(len(parts), 0, -1):
                sub_path = "/".join(parts[:i])
                for ext in ["", ".py", ".js", ".ts", ".jsx", ".tsx"]:
                    candidate = sub_path + ext
                    if candidate in self.file_map:
                        return candidate
                sub_dot = ".".join(parts[:i])
                if sub_dot in self.path_lookup:
                    return self.path_lookup[sub_dot]
                if parts[i - 1] in self.path_lookup:
                    return self.path_lookup[parts[i - 1]]

        # Direct filename match
        if cleaned_imp in self.path_lookup:
            return self.path_lookup[cleaned_imp]

        return None

    def _resolve_api_url_to_route(self, url: str) -> str:
        """Connects client API calls like /api/v1/auth/login or /auth/ to backend route files."""
        url_lower = url.lower()
        for f_id in self.file_map:
            f_lower = f_id.lower()
            if "route" in f_lower or "controller" in f_lower or "api" in f_lower:
                if "auth" in url_lower and "auth" in f_lower:
                    return f_id
                if "payment" in url_lower and "payment" in f_lower:
                    return f_id
                if "user" in url_lower and "user" in f_lower:
                    return f_id
        return None
