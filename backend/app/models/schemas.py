from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class RepoAnalysisRequest(BaseModel):
    repo_url: Optional[str] = Field(None, description="GitHub repository URL")
    is_demo: bool = Field(False, description="Use bundled demo repository")
    branch: Optional[str] = Field("main", description="Git branch to inspect")


class FileNode(BaseModel):
    id: str = Field(..., description="Unique file identifier/relative path")
    label: str = Field(..., description="Short filename for display")
    path: str = Field(..., description="Relative file path")
    type: str = Field("util", description="Node type: component, api, service, model, database, config, util")
    language: str = Field("unknown", description="Programming language: Python, JavaScript, TypeScript, etc.")
    size: int = Field(0, description="File size in bytes")
    lines: int = Field(0, description="Number of lines of code")
    role: str = Field("", description="Inferred architectural role")
    functions: List[str] = Field(default_factory=list, description="Extracted function and method names")
    classes: List[str] = Field(default_factory=list, description="Extracted class names")
    imports: List[str] = Field(default_factory=list, description="Imported modules and paths")
    exports: List[str] = Field(default_factory=list, description="Exported symbols or endpoints")
    summary: str = Field("", description="Concise summary of file responsibilities")
    code_preview: Optional[str] = Field(None, description="Code snippet preview")


class GraphEdge(BaseModel):
    source: str = Field(..., description="Source node id")
    target: str = Field(..., description="Target node id")
    type: str = Field("imports", description="Edge relationship: imports, calls, depends_on")
    label: Optional[str] = Field(None, description="Relationship description")


class CodeGraph(BaseModel):
    repo_name: str
    repo_owner: str
    total_files: int
    languages: Dict[str, int]
    entry_points: List[str] = Field(default_factory=list)
    nodes: List[FileNode]
    edges: List[GraphEdge]


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class ChatQueryRequest(BaseModel):
    query: str
    repo_url: Optional[str] = None
    is_demo: bool = False
    history: List[ChatMessage] = Field(default_factory=list)
    selected_file: Optional[str] = None


class TraceStep(BaseModel):
    step: int
    file: str
    label: str
    role: str
    description: str


class ChatResponse(BaseModel):
    answer: str
    relevant_files: List[str]
    flow: List[str]
    trace_steps: List[TraceStep] = Field(default_factory=list)
    confidence: str = "high"


class ImpactAnalysisRequest(BaseModel):
    file_path: str


class ImpactAnalysisResponse(BaseModel):
    target_file: str
    direct_dependencies: List[str]
    dependents: List[str]
    potentially_affected_files: List[str]
    affected_routes: List[str]
    affected_components: List[str]
    impact_score: str
    summary: str
