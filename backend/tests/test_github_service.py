from app.services.github_service import GitHubService

def test_parse_github_url():
    service = GitHubService()
    
    assert service.parse_github_url("https://github.com/facebook/react") == ("facebook", "react")
    assert service.parse_github_url("https://github.com/fastapi/fastapi.git") == ("fastapi", "fastapi")
    assert service.parse_github_url("github.com/pallets/flask") == ("pallets", "flask")
    assert service.parse_github_url("invalid-url-here") is None
    assert service.parse_github_url("") is None

def test_demo_repo_analysis():
    service = GitHubService()
    graph = service.analyze_demo_repo()

    assert graph.total_files > 0
    assert len(graph.nodes) > 0
    assert len(graph.edges) > 0
    assert "demo-cloud-app" in graph.repo_name
    
    # Verify node types exist
    types = {n.type for n in graph.nodes}
    assert "component" in types or "api" in types
    assert "database" in types or "service" in types
