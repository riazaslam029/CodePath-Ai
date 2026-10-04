"""
Repository API endpoints for CodePath AI.
"""
from fastapi import APIRouter, HTTPException
from typing import Dict
from app.models.schemas import RepoAnalysisRequest, CodeGraph
from app.services.github_service import github_service_instance

router = APIRouter(prefix="/repositories", tags=["repositories"])

# In-memory graph cache: session_key -> CodeGraph
GRAPH_CACHE: Dict[str, CodeGraph] = {}

def get_cached_graph(repo_key: str = "demo") -> CodeGraph:
    if repo_key in GRAPH_CACHE:
        return GRAPH_CACHE[repo_key]
    # Default to demo repo if empty
    graph = github_service_instance.analyze_demo_repo()
    GRAPH_CACHE["demo"] = graph
    return graph

@router.post("/analyze", response_model=CodeGraph)
async def analyze_repository(request: RepoAnalysisRequest):
    """Analyzes a GitHub repository or the bundled demo codebase."""
    try:
        if request.is_demo or not request.repo_url:
            graph = github_service_instance.analyze_demo_repo()
            GRAPH_CACHE["demo"] = graph
            GRAPH_CACHE["current"] = graph
            return graph

        # Remote GitHub repository
        graph = await github_service_instance.analyze_github_repo(request.repo_url, request.branch)
        cache_key = request.repo_url.strip().lower()
        GRAPH_CACHE[cache_key] = graph
        GRAPH_CACHE["current"] = graph
        return graph

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze repository: {str(e)}")

@router.get("/demo", response_model=CodeGraph)
def get_demo_graph():
    """Immediately returns the bundled demo codebase graph."""
    return get_cached_graph("demo")
