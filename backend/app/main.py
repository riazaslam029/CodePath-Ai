"""
CodePath AI - FastAPI Application Entry Point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.repositories import router as repos_router
from app.api.analysis import router as analysis_router
from app.api.chat import router as chat_router

app = FastAPI(
    title="CodePath AI API",
    description="AI-powered visual codebase explorer and architectural flow tracer.",
    version="1.0.0"
)

# Enable CORS for local Vite and production frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(repos_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(chat_router, prefix="/api")

@app.get("/")
def root():
    return {
        "name": "CodePath AI API",
        "tagline": "Understand any codebase. Visually.",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "codepath-backend"}
