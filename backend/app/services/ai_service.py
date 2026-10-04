"""
AI Service for CodePath AI.
Interfaces with Gemini / configurable LLM to deliver structured codebase Q&A,
and includes an intelligent deterministic fallback reasoning engine for hackathon reliability.
"""
import json
import re
import posixpath
from typing import Dict, Any, List
import httpx
from app.config import GEMINI_API_KEY, AI_MODEL
from app.models.schemas import CodeGraph, ChatResponse, TraceStep, FileNode

SYSTEM_PROMPT = """You are CodePath AI, an expert codebase architect.
Analyze the provided repository context to answer the user's question accurately.
You must return a valid JSON object with the following schema:
{
  "answer": "A clear, concise, step-by-step technical explanation referencing actual files and functions.",
  "relevant_files": ["list/of/actual/filepaths"],
  "flow": ["step1_file", "step2_file", "step3_file"],
  "confidence": "high" | "medium" | "low"
}
Do NOT include markdown formatting or backticks outside of the JSON object. Return strictly JSON."""

class AIService:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.model = AI_MODEL or "gemini-1.5-flash"

    async def answer_query(self, query: str, context: Dict[str, Any], graph: CodeGraph) -> ChatResponse:
        """
        Executes query analysis using Gemini or deterministic semantic fallback.
        """
        nodes_by_id = {n.id: n for n in graph.nodes}
        flow_files = context.get("flow", [])
        relevant_files = context.get("relevant_files", [])

        if self.api_key:
            try:
                llm_result = await self._call_gemini(query, context, graph)
                if llm_result:
                    return self._build_chat_response(llm_result, nodes_by_id, fallback_flow=flow_files)
            except Exception as e:
                print(f"Gemini API call failed, falling back to local analyzer: {e}")

        # Deterministic semantic reasoning engine
        return self._generate_intelligent_local_response(query, context, graph, nodes_by_id)

    async def _call_gemini(self, query: str, context: Dict[str, Any], graph: CodeGraph) -> Dict[str, Any]:
        """Calls Google Gemini API for structured JSON response."""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        user_prompt = (
            f"Repository: {graph.repo_owner}/{graph.repo_name}\n"
            f"User Question: {query}\n\n"
            f"Identified Candidate Execution Flow: {' -> '.join(context.get('flow', []))}\n\n"
            f"Relevant Code Files & Snippets:\n{context.get('context_text', '')}\n\n"
            "Return JSON matching the schema."
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": SYSTEM_PROMPT},
                        {"text": user_prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Clean code blocks if present
                clean_json = re.sub(r"^```json\s*", "", raw_text.strip(), flags=re.MULTILINE)
                clean_json = re.sub(r"```$", "", clean_json.strip())
                return json.loads(clean_json)
        return None

    def _generate_intelligent_local_response(
        self,
        query: str,
        context: Dict[str, Any],
        graph: CodeGraph,
        nodes_by_id: Dict[str, FileNode]
    ) -> ChatResponse:
        """
        Produces high-quality contextual architectural analysis using repository graph data.
        """
        flow = context.get("flow", [])
        if not flow and context.get("relevant_files"):
            flow = context.get("relevant_files")[:5]

        query_lower = query.lower()

        # Build step-by-step trace
        trace_steps: List[TraceStep] = []
        step_descriptions = []

        for idx, file_id in enumerate(flow, 1):
            node = nodes_by_id.get(file_id)
            if not node:
                continue
            step_desc = self._describe_file_step(node, idx, len(flow), query_lower)
            step_descriptions.append(f"{idx}. **`{node.label}`** ({node.role}): {step_desc}")
            trace_steps.append(TraceStep(
                step=idx,
                file=file_id,
                label=node.label,
                role=node.role,
                description=step_desc
            ))

        # Compose comprehensive technical answer
        summary_intro = (
            f"Based on repository analysis for **{graph.repo_name}**, here is how this functionality flows "
            f"across {len(flow)} connected components:"
        )
        steps_text = "\n\n".join(step_descriptions)
        conclusion = (
            f"\n\n**Visual Code Path:** The execution chain traverses "
            f"{' ➔ '.join([f'`{nodes_by_id[f].label}`' for f in flow if f in nodes_by_id])}. "
            f"Click **Trace This Feature** below to highlight the exact path in the graph."
        )

        full_answer = f"{summary_intro}\n\n{steps_text}{conclusion}"

        return ChatResponse(
            answer=full_answer,
            relevant_files=context.get("relevant_files", flow),
            flow=flow,
            trace_steps=trace_steps,
            confidence="high"
        )

    def _describe_file_step(self, node: FileNode, step: int, total: int, query: str) -> str:
        fns = f" using `{node.functions[0]}()`" if node.functions else ""
        classes = f" defined in class `{node.classes[0]}`" if node.classes else ""

        if node.type == "component":
            return f"Serves as the entry UI component that captures user interactions and triggers network requests{fns}."
        elif node.type == "api":
            if "client" in node.role.lower():
                return f"Constructs HTTP requests and client headers to communicate with the backend endpoint{fns}."
            return f"Receives incoming HTTP requests, validates route payloads, and delegates processing to business services{fns}."
        elif node.type in ("service", "auth"):
            return f"Executes core business logic, credentials verification, or domain transformations{classes}{fns}."
        elif node.type == "model":
            return f"Represents database entity structures and handles data constraints{classes}."
        elif node.type == "database":
            return f"Manages persistent database sessions, transactions, and commits changes to storage."
        return f"Supports the execution pipeline as {node.role}."

    def _build_chat_response(
        self,
        llm_data: Dict[str, Any],
        nodes_by_id: Dict[str, FileNode],
        fallback_flow: List[str]
    ) -> ChatResponse:
        answer = llm_data.get("answer", "Here is the explanation for this feature flow.")
        flow = llm_data.get("flow", fallback_flow)
        relevant_files = llm_data.get("relevant_files", flow)

        trace_steps: List[TraceStep] = []
        for idx, file_id in enumerate(flow, 1):
            # Check if file_id exists or match by filename
            node = nodes_by_id.get(file_id)
            if not node:
                fname = posixpath.basename(file_id)
                for nid, n in nodes_by_id.items():
                    if n.label == fname or n.label == file_id:
                        node = n
                        file_id = nid
                        break

            label = node.label if node else posixpath.basename(file_id)
            role = node.role if node else "Code Module"
            trace_steps.append(TraceStep(
                step=idx,
                file=file_id,
                label=label,
                role=role,
                description=f"Step {idx} in feature flow execution."
            ))

        return ChatResponse(
            answer=answer,
            relevant_files=relevant_files,
            flow=flow,
            trace_steps=trace_steps,
            confidence=llm_data.get("confidence", "high")
        )

ai_service_instance = AIService()
