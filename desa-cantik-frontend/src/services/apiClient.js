// Pembungkus fetch ringan untuk API Desa Cantik
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const TOKEN_KEY = "desaCantikToken";

let authToken = null;

const storedToken = (() => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
})();

if (storedToken) {
  authToken = storedToken;
}

const buildUrl = (path, params) => {
  const url = new URL(
    path.startsWith("http") ? path : `${API_BASE_URL}${path}`
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value);
      }
    });
  }

  return url.toString();
};

const request = async (method, path, { data, params, headers } = {}) => {
  const url = buildUrl(path, params);

  const requestHeaders = new Headers(headers || {});
  if (authToken) {
    requestHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  const isFormData = data instanceof FormData;
  if (data && !isFormData && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (!requestHeaders.has("Accept")) {
    requestHeaders.set("Accept", "application/json");
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: isFormData ? data : data ? JSON.stringify(data) : undefined,
  });

  const rawText = await response.text().catch(() => "");
  let json = {};

  if (rawText) {
    try {
      json = JSON.parse(rawText);
    } catch {
      json = {};
    }
  }

  if (!response.ok || json?.success === false) {
    const message =
      json?.message ||
      json?.errors?.[0] ||
      `Request failed with status ${response.status}`;

    if (response.status === 401) {
      setToken(null);
      try {
        localStorage.removeItem("desaCantikUser");
        localStorage.removeItem("desaCantikToken");
      } catch { }
      window.location.href = "/login";
      throw new Error("Sesi berakhir. Silakan masuk lagi.");
    }

    console.error("API Request Failed:", json);

    // Improve error message by appending validation errors if available
    let detailedMessage = message;
    if (json?.errors && typeof json.errors === 'object') {
      const errorMessages = Object.values(json.errors).flat().join(', ');
      if (errorMessages) {
        detailedMessage = `${message} (${errorMessages})`;
      }
    }

    const error = new Error(detailedMessage);
    error.status = response.status;
    error.data = json; // Attach full response data for custom handling
    throw error;
  }

  return json;
};

const setToken = (token) => {
  authToken = token;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* abaikan kesalahan penyimpanan */
  }
};

export const apiClient = {
  get: (path, options) => request("GET", path, options),
  post: (path, data, options = {}) =>
    request("POST", path, { ...options, data }),
  put: (path, data, options = {}) => request("PUT", path, { ...options, data }),
  patch: (path, data, options = {}) =>
    request("PATCH", path, { ...options, data }),
  delete: (path, options) => request("DELETE", path, options),
  request, // Expose the raw request function
  setToken,
  clearToken: () => setToken(null),
  getToken: () => authToken,
};
