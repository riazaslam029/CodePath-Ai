"""
Chat and Feature Trace API endpoints for CodePath AI.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatQueryRequest, ChatResponse
from app.services.retrieval_service import retrieval_service_instance
from app.services.ai_service import ai_service_instance
from app.api.repositories import get_cached_graph

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/query", response_model=ChatResponse)
async def query_codebase(request: ChatQueryRequest):
    """
    Analyzes question against codebase graph context and returns structured explanation and visual flow.
    """
    graph_key = request.repo_url.strip().lower() if request.repo_url else "current"
    graph = get_cached_graph(graph_key)

    if not graph.nodes:
        raise HTTPException(status_code=400, detail="No active codebase has been analyzed yet.")

    # 1. Retrieve context & trace flow
    context = retrieval_service_instance.retrieve_context(
        query=request.query,
        graph=graph,
        selected_file=request.selected_file
    )

    # 2. Generate structured AI explanation with visual nodes
    response = await ai_service_instance.answer_query(
        query=request.query,
        context=context,
        graph=graph
    )

    return response
