"""
Demo Application Entry Point.
"""
from fastapi import FastAPI
from backend.routes.auth_routes import router as auth_router
from backend.routes.payment_routes import router as payment_router
from backend.database.db import db_instance

app = FastAPI(title="Demo Cloud App API", version="1.0.0")

# Mount routes
app.include_router(auth_router, prefix="/api/v1")
app.include_router(payment_router, prefix="/api/v1")

@app.on_event("startup")
def startup_event():
    db_instance.initialize_schema()

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "demo-backend"}
