export async function apiPost<T>(url: string, body: unknown): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Request failed' };
    return { data: json.data };
  } catch {
    return { error: 'Network error' };
  }
}

export async function apiPatch<T>(url: string, body: unknown): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { error: json.error || 'Request failed' };
    return { data: json.data };
  } catch {
    return { error: 'Network error' };
  }
}
