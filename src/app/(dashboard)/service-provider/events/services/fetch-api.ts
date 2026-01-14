import { NextResponse } from "next/server";

interface ApiResponse<T = any> {
  earnings: any;
  _id: any;
  feedbacks(feedbacks: any): unknown;
  success: any;
  ok: any;
  events: any;
  status?: number;
  message?: string;
  data?: T;
  error?: string;
  response?: T;
}

// New: runtime-aware base URL
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // In the browser, use relative URL if calling same-origin,
    // or use NEXT_PUBLIC_BASEURL if explicitly set to another origin.
    return process.env.NEXT_PUBLIC_BASEURL || "";
  }
  // On the server, require an absolute origin for cross-origin calls.
  return process.env.BASE_URL || process.env.NEXT_PUBLIC_BASEURL || "http://localhost:3001";
};

// Keep navigate as-is
const navigate = (path: string): void | NextResponse => {
  try {
    if (typeof window !== "undefined") {
      window.location.href = path;
    } else {
      return NextResponse.redirect(new URL(path, getBaseURL()));
    }
  } catch (error) {
    console.error("🚀 ~ navigate ~ error:", error);
  }
};

const fetchWithAuth = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    // Remove unless the backend requires it (adds preflight)
    // "X-Requested-With": "XMLHttpRequest",
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const finalUrl = `${getBaseURL()}${url}`;

  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type") || "";

    if (response.ok) {
      // Handle 204 or non-JSON bodies safely
      if (response.status === 204) {
        return { status: 204, message: "No Content" } as ApiResponse<T>;
      }
      if (contentType.includes("application/json")) {
        return (await response.json()) as ApiResponse<T>;
      }
      const text = await response.text();
      return { status: response.status, message: text } as ApiResponse<T>;
    }

    if (response.status === 503) {
      navigate("/maintenance");
    }
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }

    // Try to extract error payload
    let errorBody: any = null;
    try {
      errorBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      // ignore parse failures
    }
    const errorResponse: ApiResponse = {
      status: response.status,
      message: response.statusText,
      error: typeof errorBody === "string" ? errorBody : JSON.stringify(errorBody),
      ok: undefined,
      events: function (events: any): unknown {
        throw new Error("Function not implemented.");
      },
      feedbacks: function (feedbacks: any): unknown {
        throw new Error("Function not implemented.");
      },
      success: undefined,
      _id: undefined,
      earnings: undefined
    };
    throw errorResponse;
  } catch (error) {
    // This is where CORS/network errors surface as TypeError: Failed to fetch
    console.error("API Error:", error);
    throw error;
  }
};

// API Service Functions
const api = {
  get: <T>(url: string, options?: { params?: Record<string, any> }): Promise<ApiResponse<T>> => {
    const queryString = options?.params
      ? "?" + new URLSearchParams(options.params).toString()
      : "";
    return fetchWithAuth<T>(`${url}${queryString}`, { method: "GET" });
  },
  post: <T>(url: string, body: unknown): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(url: string, body: unknown): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, { method: "PUT", body: JSON.stringify(body) }),
  postForm: <T>(url: string, formData: FormData): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, { method: "POST", body: formData }),
  putForm: <T>(url: string, formData: FormData): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, { method: "PUT", body: formData }),
  patch: <T>(url: string, body: unknown): Promise<ApiResponse<T>> =>
    fetchWithAuth<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
};

export default api;
