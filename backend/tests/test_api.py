from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_demo_repository_endpoint():
    response = client.get("/api/repositories/demo")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
    assert len(data["nodes"]) > 0

def test_chat_query_endpoint():
    response = client.post("/api/chat/query", json={
        "query": "How does authentication work?",
        "is_demo": True
    })
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "flow" in data
    assert "relevant_files" in data
    assert len(data["flow"]) > 0

def test_impact_analysis_endpoint():
    # First make sure demo is loaded in session
    client.get("/api/repositories/demo")

    response = client.post("/api/analysis/impact", json={
        "file_path": "backend/services/auth_service.py"
    })
    assert response.status_code == 200
    data = response.json()
    assert "target_file" in data
    assert "dependents" in data
    assert "potentially_affected_files" in data
    assert data["impact_score"] in ["LOW", "MEDIUM", "HIGH"]
