"""
Codebase Analysis & Impact Analysis endpoints for CodePath AI.
"""
from fastapi import APIRouter, HTTPException
from collections import deque
from app.models.schemas import ImpactAnalysisRequest, ImpactAnalysisResponse
from app.api.repositories import get_cached_graph

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/impact", response_model=ImpactAnalysisResponse)
def analyze_impact(request: ImpactAnalysisRequest):
    """
    Computes blast radius and impact for changing a given file.
    Traces direct dependencies, dependents, and transitively affected files.
    """
    graph = get_cached_graph("current")
    nodes_map = {n.id: n for n in graph.nodes}

    target = request.file_path
    if target not in nodes_map:
        # Try matching by filename or suffix
        for nid in nodes_map:
            if nid.endswith(target) or nodes_map[nid].label == target:
                target = nid
                break

    if target not in nodes_map:
        raise HTTPException(status_code=404, detail=f"File '{request.file_path}' not found in active graph.")

    # 1. Direct dependencies: target -> others (out edges)
    direct_deps = [e.target for e in graph.edges if e.source == target]

    # 2. Direct dependents: others -> target (in edges)
    direct_dependents = [e.source for e in graph.edges if e.target == target]

    # 3. Transitive blast radius (BFS on reverse dependency edges)
    # files that depend on this file directly or indirectly
    affected_files = set()
    queue = deque(direct_dependents)
    while queue:
        curr = queue.popleft()
        if curr not in affected_files and curr != target:
            affected_files.add(curr)
            for e in graph.edges:
                if e.target == curr and e.source not in affected_files:
                    queue.append(e.source)

    affected_list = sorted(list(affected_files))

    # Categorize affected routes and components
    affected_routes = []
    affected_components = []
    for fid in affected_list:
        node = nodes_map.get(fid)
        if node:
            if node.type == "api":
                affected_routes.append(node.label)
            elif node.type == "component":
                affected_components.append(node.label)

    # Score calculation
    total_affected = len(affected_list) + len(direct_dependents)
    if total_affected >= 5 or len(affected_routes) >= 2:
        score = "HIGH"
    elif total_affected >= 2 or len(affected_routes) >= 1:
        score = "MEDIUM"
    else:
        score = "LOW"

    summary = (
        f"Modifying '{nodes_map[target].label}' impacts {len(direct_dependents)} direct caller(s) "
        f"and {len(affected_list)} downstream system file(s)."
    )

    return ImpactAnalysisResponse(
        target_file=target,
        direct_dependencies=direct_deps,
        dependents=direct_dependents,
        potentially_affected_files=affected_list,
        affected_routes=affected_routes,
        affected_components=affected_components,
        impact_score=score,
        summary=summary
    )
