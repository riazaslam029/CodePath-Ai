from app.analyzers.graph_builder import GraphBuilder

def test_graph_builder_resolves_imports():
    mock_files = [
        {
            "id": "frontend/src/components/Login.jsx",
            "label": "Login.jsx",
            "path": "frontend/src/components/Login.jsx",
            "type": "component",
            "language": "JavaScript",
            "size": 200,
            "lines": 15,
            "role": "UI Component",
            "functions": ["Login"],
            "classes": [],
            "imports": ["../api/apiClient"],
            "exports": ["Login"],
            "api_calls": [],
            "summary": "Login page"
        },
        {
            "id": "frontend/src/api/apiClient.js",
            "label": "apiClient.js",
            "path": "frontend/src/api/apiClient.js",
            "type": "api",
            "language": "JavaScript",
            "size": 300,
            "lines": 20,
            "role": "API Client",
            "functions": ["loginUser"],
            "classes": [],
            "imports": [],
            "exports": ["loginUser"],
            "api_calls": ["/api/v1/auth/login"],
            "summary": "Client network calls"
        },
        {
            "id": "backend/routes/auth_routes.py",
            "label": "auth_routes.py",
            "path": "backend/routes/auth_routes.py",
            "type": "api",
            "language": "Python",
            "size": 400,
            "lines": 25,
            "role": "API Router",
            "functions": ["login"],
            "classes": [],
            "imports": ["backend.services.auth_service"],
            "exports": ["login"],
            "api_calls": [],
            "summary": "Auth routes"
        }
    ]

    builder = GraphBuilder(mock_files, "TestApp", "TestOwner")
    graph = builder.build()

    assert len(graph.nodes) == 3
    # Check that Login.jsx -> apiClient.js edge was built
    edges = [(e.source, e.target) for e in graph.edges]
    assert ("frontend/src/components/Login.jsx", "frontend/src/api/apiClient.js") in edges
    # Check that apiClient.js -> auth_routes.py API bridge was built
    assert ("frontend/src/api/apiClient.js", "backend/routes/auth_routes.py") in edges
