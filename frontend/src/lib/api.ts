export const API = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = localStorage.getItem('token');
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}${path}`,
    {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      ...options
    }
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Request failed');
  return data as T;
};
