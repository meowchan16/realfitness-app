export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers,
    ...options
  });

  if (!response.ok) {
    let message = `Request failed for ${path}`;

    try {
      const data = await response.json();
      message = data?.message || data?.error || message;
    } catch (_error) {
      const errorText = await response.text();
      if (errorText) {
        message = errorText;
      }
    }

    throw new Error(message);
  }

  return response.json();
}

export async function getRequest(path) {
  return request(path);
}

export async function putRequest(path, body) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

export async function postRequest(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body)
  });
}
