"""
Python AST Code Analyzer for CodePath AI.
Extracts AST-level structure: imports, classes, functions, calls, and architectural roles.
"""
import ast
import re
from typing import Dict, Any, List

class PythonFileAnalyzer:
    def __init__(self, relative_path: str, content: str):
        self.path = relative_path.replace("\\", "/")
        self.content = content
        self.filename = self.path.split("/")[-1]

    def analyze(self) -> Dict[str, Any]:
        lines = self.content.splitlines()
        line_count = len(lines)
        size = len(self.content.encode("utf-8"))
        preview = "\n".join(lines[:35])

        imports = []
        classes = []
        functions = []
        calls = set()
        docstring = ""

        try:
            tree = ast.parse(self.content)
            docstring = ast.get_docstring(tree) or ""

            for node in ast.walk(tree):
                # Imports
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        imports.append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ""
                    level = node.level
                    prefix = "." * level
                    if module:
                        imports.append(f"{prefix}{module}".strip("."))
                    for alias in node.names:
                        full_import = f"{prefix}{module}.{alias.name}" if module else f"{prefix}{alias.name}"
                        imports.append(full_import.strip("."))

                # Classes
                elif isinstance(node, ast.ClassDef):
                    classes.append(node.name)

                # Functions & Methods
                elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    functions.append(node.name)

                # Function / Method calls
                elif isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name):
                        calls.add(node.func.id)
                    elif isinstance(node.func, ast.Attribute):
                        calls.add(node.func.attr)

        except SyntaxError:
            # Fallback regex extraction if file has python syntax error or template tags
            imports = self._regex_imports()
            functions = self._regex_functions()
            classes = self._regex_classes()

        role, node_type = self._infer_role_and_type(classes, functions)
        summary = self._generate_summary(role, classes, functions, docstring)

        return {
            "id": self.path,
            "label": self.filename,
            "path": self.path,
            "language": "Python",
            "type": node_type,
            "role": role,
            "size": size,
            "lines": line_count,
            "functions": sorted(list(set(functions))),
            "classes": sorted(list(set(classes))),
            "imports": sorted(list(set(imports))),
            "exports": sorted(list(set(classes + functions))),
            "calls": sorted(list(calls)),
            "summary": summary,
            "code_preview": preview
        }

    def _infer_role_and_type(self, classes: List[str], functions: List[str]) -> tuple:
        path_lower = self.path.lower()
        content_lower = self.content.lower()

        if "route" in path_lower or "api" in path_lower or "controller" in path_lower or "endpoint" in path_lower:
            return ("API Router / HTTP Controller", "api")
        if "auth" in path_lower or "token" in path_lower or "session" in path_lower:
            if "service" in path_lower:
                return ("Authentication & Security Service", "service")
            return ("Authentication Handler", "auth")
        if "service" in path_lower or "manager" in path_lower:
            return ("Business Logic Service", "service")
        if "model" in path_lower or "schema" in path_lower or "entity" in path_lower:
            return ("Data Model / ORM Entity", "model")
        if "db" in path_lower or "database" in path_lower or "repository" in path_lower or "migration" in path_lower:
            return ("Database Connection / Session Manager", "database")
        if "test" in path_lower or self.filename.startswith("test_"):
            return ("Automated Test Suite", "test")
        if "config" in path_lower or "setting" in path_lower:
            return ("Application Configuration", "config")
        if "main.py" in self.filename or "app.py" in self.filename or "wsgi.py" in self.filename or "asgi.py" in self.filename:
            return ("Server Application Entry Point", "api")

        # Inferred from content
        if "fastapi" in content_lower or "flask" in content_lower or "apirouter" in content_lower:
            return ("API Endpoint Controller", "api")
        if "sqlalchemy" in content_lower or "cursor" in content_lower or "sqlite3" in content_lower:
            return ("Database Persistence Layer", "database")

        return ("Utility / Core Module", "util")

    def _generate_summary(self, role: str, classes: List[str], functions: List[str], docstring: str) -> str:
        if docstring:
            first_line = docstring.strip().split("\n")[0]
            if len(first_line) > 10:
                return first_line

        parts = [f"Serves as {role}."]
        if classes:
            parts.append(f"Defines classes: {', '.join(classes[:3])}.")
        if functions:
            parts.append(f"Provides functions: {', '.join(functions[:4])}.")
        return " ".join(parts)

    def _regex_imports(self) -> List[str]:
        imports = []
        for line in self.content.splitlines():
            line = line.strip()
            if line.startswith("import "):
                imports.extend([m.strip() for m in line[7:].split(",")])
            elif line.startswith("from "):
                m = re.match(r"from\s+([^\s]+)\s+import\s+(.+)", line)
                if m:
                    mod = m.group(1)
                    imports.append(mod)
        return imports

    def _regex_functions(self) -> List[str]:
        return re.findall(r"def\s+([a-zA-Z0-9_]+)\s*\(", self.content)

    def _regex_classes(self) -> List[str]:
        return re.findall(r"class\s+([a-zA-Z0-9_]+)\s*[:\(]", self.content)
