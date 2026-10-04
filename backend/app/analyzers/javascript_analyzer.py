"""
JavaScript and TypeScript Code Analyzer for CodePath AI.
Extracts imports, exports, functions, React components, API calls, and architectural roles.
"""
import re
from typing import Dict, Any, List

class JavaScriptFileAnalyzer:
    def __init__(self, relative_path: str, content: str):
        self.path = relative_path.replace("\\", "/")
        self.content = content
        self.filename = self.path.split("/")[-1]
        self.is_typescript = self.path.endswith((".ts", ".tsx"))
        self.is_react = self.path.endswith((".jsx", ".tsx")) or "react" in self.content.lower()

    def analyze(self) -> Dict[str, Any]:
        lines = self.content.splitlines()
        line_count = len(lines)
        size = len(self.content.encode("utf-8"))
        preview = "\n".join(lines[:35])

        imports = self._extract_imports()
        exports = self._extract_exports()
        functions = self._extract_functions()
        classes = self._extract_classes()
        api_calls = self._extract_api_calls()

        role, node_type = self._infer_role_and_type(functions, exports)
        summary = self._generate_summary(role, functions, exports)

        return {
            "id": self.path,
            "label": self.filename,
            "path": self.path,
            "language": "TypeScript" if self.is_typescript else "JavaScript",
            "type": node_type,
            "role": role,
            "size": size,
            "lines": line_count,
            "functions": sorted(list(set(functions))),
            "classes": sorted(list(set(classes))),
            "imports": sorted(list(set(imports))),
            "exports": sorted(list(set(exports))),
            "api_calls": sorted(list(set(api_calls))),
            "summary": summary,
            "code_preview": preview
        }

    def _extract_imports(self) -> List[str]:
        imports = []
        # ESM: import ... from '...'
        esm_patterns = [
            r'import\s+.*?\s+from\s+[\'"]([^\'"]+)[\'"]',
            r'import\s+[\'"]([^\'"]+)[\'"]',
            r'import\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)'
        ]
        for pattern in esm_patterns:
            matches = re.findall(pattern, self.content)
            imports.extend(matches)

        # CommonJS: require('...')
        cjs_matches = re.findall(r'require\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)', self.content)
        imports.extend(cjs_matches)

        return imports

    def _extract_exports(self) -> List[str]:
        exports = []
        # export default function Name / export default Name
        default_fn = re.findall(r'export\s+default\s+function\s+([a-zA-Z0-9_]+)', self.content)
        exports.extend(default_fn)

        default_ident = re.findall(r'export\s+default\s+([a-zA-Z0-9_]+)\s*;?', self.content)
        exports.extend([id_name for id_name in default_ident if id_name not in ("function", "class")])

        # export function name / export const name
        named_exports = re.findall(r'export\s+(?:async\s+)?function\s+([a-zA-Z0-9_]+)', self.content)
        exports.extend(named_exports)

        named_vars = re.findall(r'export\s+(?:const|let|var)\s+([a-zA-Z0-9_]+)', self.content)
        exports.extend(named_vars)

        # export { a, b }
        brace_exports = re.findall(r'export\s*\{([^}]+)\}', self.content)
        for group in brace_exports:
            items = [item.strip().split(" as ")[-1].strip() for item in group.split(",") if item.strip()]
            exports.extend(items)

        return exports

    def _extract_functions(self) -> List[str]:
        functions = []
        # function name()
        regular_fns = re.findall(r'(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(', self.content)
        functions.extend(regular_fns)

        # const name = () => / const name = async () =>
        arrow_fns = re.findall(r'(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>', self.content)
        functions.extend(arrow_fns)

        # const name = async function
        expr_fns = re.findall(r'(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?function', self.content)
        functions.extend(expr_fns)

        return functions

    def _extract_classes(self) -> List[str]:
        return re.findall(r'class\s+([a-zA-Z0-9_]+)', self.content)

    def _extract_api_calls(self) -> List[str]:
        calls = []
        # fetch(url)
        fetch_calls = re.findall(r'fetch\s*\(\s*[`\'"]([^`\'"]+)[`\'"]', self.content)
        calls.extend(fetch_calls)
        # axios.get/post(...)
        axios_calls = re.findall(r'axios\.(?:get|post|put|delete|patch)\s*\(\s*[`\'"]([^`\'"]+)[`\'"]', self.content)
        calls.extend(axios_calls)
        return calls

    def _infer_role_and_type(self, functions: List[str], exports: List[str]) -> tuple:
        path_lower = self.path.lower()

        if "component" in path_lower or self.path.endswith((".jsx", ".tsx")):
            if "login" in path_lower or "auth" in path_lower:
                return ("Authentication UI Component", "component")
            return ("React UI Component", "component")
        if "api" in path_lower or "client" in path_lower or "request" in path_lower:
            return ("Frontend API Client / Service", "api")
        if "hook" in path_lower or self.filename.startswith("use"):
            return ("Custom React Hook", "service")
        if "service" in path_lower:
            return ("Client Service / Logic", "service")
        if "store" in path_lower or "redux" in path_lower or "context" in path_lower:
            return ("State Management Store / Context", "service")
        if "config" in path_lower or self.filename.endswith(("config.js", "config.ts")):
            return ("Build / App Configuration", "config")
        if "app.jsx" in path_lower or "app.tsx" in path_lower or "index.jsx" in path_lower or "main.jsx" in path_lower:
            return ("Frontend Application Root Entry", "component")
        if "test" in path_lower or self.filename.endswith((".test.js", ".spec.js", ".test.ts", ".spec.ts")):
            return ("Frontend Test Suite", "test")

        return ("Frontend Utility / Helper", "util")

    def _generate_summary(self, role: str, functions: List[str], exports: List[str]) -> str:
        parts = [f"Serves as {role}."]
        notable = exports or functions
        if notable:
            parts.append(f"Provides: {', '.join(notable[:4])}.")
        return " ".join(parts)
