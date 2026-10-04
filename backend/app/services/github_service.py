"""
GitHub Ingestion and Repository Service for CodePath AI.
Fetches, filters, and analyzes public GitHub repositories and bundled demo repositories.
"""
import re
import os
import posixpath
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import httpx
from app.config import GITHUB_TOKEN, DEMO_REPO_DIR
from app.analyzers.python_analyzer import PythonFileAnalyzer
from app.analyzers.javascript_analyzer import JavaScriptFileAnalyzer
from app.analyzers.graph_builder import GraphBuilder
from app.models.schemas import CodeGraph

IGNORED_DIRS = {
    ".git", "node_modules", "venv", ".venv", "env", "__pycache__", 
    "dist", "build", ".next", "coverage", ".pytest_cache", ".idea", ".vscode"
}

SUPPORTED_EXTENSIONS = {
    ".py", ".js", ".jsx", ".ts", ".tsx", ".json", ".sql", ".md"
}

class GitHubService:
    def __init__(self):
        self.headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "CodePath-AI-Bot"}
        if GITHUB_TOKEN:
            self.headers["Authorization"] = f"token {GITHUB_TOKEN}"

    @staticmethod
    def parse_github_url(url: str) -> Optional[Tuple[str, str]]:
        """Extracts (owner, repo) from GitHub URL or shorthand."""
        if not url:
            return None
        cleaned = url.strip()
        cleaned = re.sub(r"\.git$", "", cleaned)
        cleaned = re.sub(r"^https?://github\.com/", "", cleaned)
        cleaned = re.sub(r"^github\.com/", "", cleaned)
        parts = cleaned.strip("/").split("/")
        if len(parts) >= 2 and parts[0] and parts[1]:
            return parts[0], parts[1]
        return None

    def analyze_demo_repo(self) -> CodeGraph:
        """Analyzes the bundled demo repository from local disk."""
        analyzed_files = []
        base_path = DEMO_REPO_DIR

        for root, dirs, files in os.walk(base_path):
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
            for file in files:
                ext = Path(file).suffix.lower()
                if ext not in SUPPORTED_EXTENSIONS:
                    continue
                full_path = Path(root) / file
                rel_path = full_path.relative_to(base_path).as_posix()

                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                    analyzed = self._analyze_file(rel_path, content)
                    if analyzed:
                        analyzed_files.append(analyzed)
                except Exception as e:
                    print(f"Error analyzing demo file {rel_path}: {e}")

        builder = GraphBuilder(analyzed_files, repo_name="demo-cloud-app", repo_owner="codepath-sample")
        return builder.build()

    async def analyze_github_repo(self, repo_url: str, branch: Optional[str] = "main") -> CodeGraph:
        """Fetches and analyzes a public GitHub repository."""
        parsed = self.parse_github_url(repo_url)
        if not parsed:
            raise ValueError("Invalid GitHub repository URL. Use format: https://github.com/owner/repository")
        owner, repo = parsed

        async with httpx.AsyncClient(headers=self.headers, timeout=20.0) as client:
            # 1. Fetch repo metadata
            repo_res = await client.get(f"https://api.github.com/repos/{owner}/{repo}")
            if repo_res.status_code == 404:
                raise ValueError(f"Repository '{owner}/{repo}' not found or is private. Make sure it is public.")
            if repo_res.status_code == 403:
                raise ValueError("GitHub API rate limit exceeded. Please try again shortly or configure GITHUB_TOKEN.")
            if repo_res.status_code != 200:
                raise ValueError(f"GitHub API error ({repo_res.status_code}): {repo_res.text[:120]}")

            repo_data = repo_res.json()
            default_branch = branch or repo_data.get("default_branch", "main")

            # 2. Fetch git tree recursively
            tree_res = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
            )
            if tree_res.status_code != 200:
                raise ValueError(f"Could not fetch file structure for branch '{default_branch}'.")

            tree_data = tree_res.json()
            items = tree_data.get("tree", [])

            # Filter valid source files
            candidate_files = []
            for item in items:
                if item.get("type") != "blob":
                    continue
                path = item.get("path", "")
                parts = path.split("/")
                if any(p in IGNORED_DIRS for p in parts):
                    continue
                ext = posixpath.splitext(path)[1].lower()
                if ext in SUPPORTED_EXTENSIONS:
                    size = item.get("size", 0)
                    if size < 250000:  # Skip files larger than 250KB
                        candidate_files.append((path, size))

            # Limit to most impactful 70 files for fast hackathon demo performance
            candidate_files.sort(key=lambda x: (
                0 if x[0].endswith((".py", ".jsx", ".tsx", ".js", ".ts")) else 1,
                x[1]
            ))
            selected_files = candidate_files[:70]

            if not selected_files:
                raise ValueError("No supported Python or JavaScript/TypeScript source files found in repository.")

            # 3. Fetch file contents and analyze
            analyzed_files = []
            for path, _ in selected_files:
                raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/{path}"
                try:
                    file_res = await client.get(raw_url)
                    if file_res.status_code == 200:
                        content = file_res.text
                        analyzed = self._analyze_file(path, content)
                        if analyzed:
                            analyzed_files.append(analyzed)
                except Exception:
                    continue

            builder = GraphBuilder(analyzed_files, repo_name=repo, repo_owner=owner)
            return builder.build()

    def _analyze_file(self, rel_path: str, content: str) -> Optional[Dict[str, Any]]:
        ext = posixpath.splitext(rel_path)[1].lower()
        if ext == ".py":
            return PythonFileAnalyzer(rel_path, content).analyze()
        elif ext in {".js", ".jsx", ".ts", ".tsx"}:
            return JavaScriptFileAnalyzer(rel_path, content).analyze()
        elif ext in {".json", ".sql", ".md"}:
            lines = content.splitlines()
            return {
                "id": rel_path,
                "label": posixpath.basename(rel_path),
                "path": rel_path,
                "language": "JSON" if ext == ".json" else ("SQL" if ext == ".sql" else "Markdown"),
                "type": "database" if ext == ".sql" else ("config" if ext == ".json" else "util"),
                "role": "Schema Definition" if ext == ".sql" else ("Configuration File" if ext == ".json" else "Documentation"),
                "size": len(content.encode("utf-8")),
                "lines": len(lines),
                "functions": [],
                "classes": [],
                "imports": [],
                "exports": [],
                "summary": f"{ext.upper()[1:]} project file.",
                "code_preview": "\n".join(lines[:20])
            }
        return None

github_service_instance = GitHubService()
