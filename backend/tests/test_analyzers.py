from app.analyzers.python_analyzer import PythonFileAnalyzer
from app.analyzers.javascript_analyzer import JavaScriptFileAnalyzer

def test_python_analyzer():
    py_code = """
import os
from app.services.auth import verify_token

class AuthHandler:
    def login(self, user):
        return verify_token(user)
"""
    analyzer = PythonFileAnalyzer("backend/routes/auth.py", py_code)
    result = analyzer.analyze()

    assert result["language"] == "Python"
    assert result["type"] == "api"
    assert "AuthHandler" in result["classes"]
    assert "login" in result["functions"]
    assert any("verify_token" in imp for imp in result["imports"])
    assert result["lines"] > 5

def test_javascript_analyzer():
    js_code = """
import React, { useState } from 'react';
import { loginUser } from '../api/apiClient';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    return <button onClick={() => loginUser(email)}>Sign in</button>;
}
"""
    analyzer = JavaScriptFileAnalyzer("frontend/src/components/LoginForm.jsx", js_code)
    result = analyzer.analyze()

    assert result["language"] == "JavaScript"
    assert result["type"] == "component"
    assert "LoginForm" in result["exports"] or "LoginForm" in result["functions"]
    assert any("apiClient" in imp for imp in result["imports"])
