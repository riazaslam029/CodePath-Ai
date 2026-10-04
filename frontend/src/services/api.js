/**
 * CodePath AI API Service
 */

const API_BASE = '/api';

export async function analyzeRepository(repoUrl, isDemo = false, branch = 'main') {
  const response = await fetch(`${API_BASE}/repositories/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo_url: repoUrl || null,
      is_demo: isDemo,
      branch: branch || 'main'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'We couldn\'t analyze this repository. Make sure it is public and contains supported source files.');
  }

  return response.json();
}

export async function getDemoRepository() {
  const response = await fetch(`${API_BASE}/repositories/demo`);
  if (!response.ok) {
    throw new Error('Could not load demo repository');
  }
  return response.json();
}

export async function askQuestion(query, repoUrl = null, isDemo = false, selectedFile = null) {
  const response = await fetch(`${API_BASE}/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      repo_url: repoUrl,
      is_demo: isDemo,
      selected_file: selectedFile
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to process AI codebase query');
  }

  return response.json();
}

export async function analyzeImpact(filePath) {
  const response = await fetch(`${API_BASE}/analysis/impact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_path: filePath })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to compute file impact analysis');
  }

  return response.json();
}
