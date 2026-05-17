const BASE_URL = "http://10.0.2.2:5000";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {

  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer DEV_TOKEN", // temp
      ...(options.headers || {}),
    },
  });
}
