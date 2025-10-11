// Trigger hot-reload
import axios, { AxiosError, AxiosResponse } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Set default content type
    if (!(config.headers as any)["Content-Type"]) {
      (config.headers as any)["Content-Type"] = "application/json";
    }

    // Add authorization token
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    } else {
      console.warn("❌ API Interceptor - No token found in localStorage");
      if (typeof window !== "undefined") {
        try {
          console.log(
            "🔍 API Interceptor - All localStorage keys:",
            Object.keys(localStorage || {})
          );
        } catch {
          console.log("🔍 API Interceptor - Unable to read localStorage keys");
        }
      } else {
        console.log("🔍 API Interceptor - Running on server (no localStorage)");
      }
    }

    // Add request timestamp for debugging
    (config as any).requestTimestamp = Date.now();

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
let isRefreshing = false;
let pendingResolvers: Array<() => void> = [];

api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response time for debugging
    const requestTimestamp = (response.config as any).requestTimestamp;
    if (requestTimestamp) {
      const responseTime = Date.now() - requestTimestamp;
      console.log(
        `API Response time: ${responseTime}ms for ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
    }

    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as any;

    // Handle 401 errors with token refresh
    if (error?.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        await new Promise<void>((resolve) => pendingResolvers.push(resolve));
        original._retry = true;
        return api(original);
      }

      isRefreshing = true;
      original._retry = true;

      try {
        const ok = await refreshToken();
        pendingResolvers.forEach((r) => r());
        pendingResolvers = [];
        return ok ? api(original) : Promise.reject(error);
      } catch (refreshError) {
        // If refresh fails, clear token and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("screenlease_user");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const errorMessage =
        (error.response.data as any)?.message ||
        (error.response.data as any)?.error ||
        "An error occurred";
      console.error(`API Error ${error.response.status}:`, errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.message);
    } else {
      // Something else happened
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export async function http(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: any
) {
  const resp = await api.request({ method, url: path, data: body });
  return resp.data;
}

export async function loginAdmin(payload: { email: string; password: string }) {
  const res = await http("POST", "/auth/admin/login", payload);
  const token = (res as any)?.data?.accessToken;
  if (token && typeof window !== "undefined")
    localStorage.setItem("accessToken", token);
  return res as any;
}

export async function loginSuperAdmin(payload: {
  email: string;
  password: string;
}) {
  const res = await http("POST", "/auth/super-admin/login", payload);
  const token = (res as any)?.data?.accessToken;
  if (token && typeof window !== "undefined")
    localStorage.setItem("accessToken", token);
  return res as any;
}

export async function getMe() {
  return http("GET", "/auth/me");
}

export async function logoutApi() {
  await http("POST", "/auth/logout");
  if (typeof window !== "undefined") localStorage.removeItem("accessToken");
}

export async function refreshToken(): Promise<boolean> {
  try {
    const res = await http("POST", "/auth/refresh");
    const token = (res as any)?.data?.accessToken;
    if (token && typeof window !== "undefined") {
      localStorage.setItem("accessToken", token);
      (api.defaults.headers as any).common =
        (api.defaults.headers as any).common || {};
      (api.defaults.headers as any).common["Authorization"] = `Bearer ${token}`;
      return true;
    }
  } catch {}
  return false;
}

export async function requestCustomerOtp(payload: {
  email?: string;
  phone?: string;
  channel?: "email" | "sms";
  purpose?: "login" | "register" | "reset";
}) {
  return http("POST", "/auth/customer/request-otp", payload);
}

export async function verifyCustomerOtp(payload: {
  email?: string;
  phone?: string;
  code: string;
  channel?: "email" | "sms";
}) {
  const res = await http("POST", "/auth/customer/verify-otp", payload);
  const token = (res as any)?.data?.accessToken;
  if (token && typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
    (api.defaults.headers as any).common =
      (api.defaults.headers as any).common || {};
    (api.defaults.headers as any).common["Authorization"] = `Bearer ${token}`;
  }
  return res as any;
}

// ==============================
// BOOKING APIS
// ==============================

export async function getSeatMap(showId: string) {
  return http("GET", `/public/shows/${showId}/seats`);
}

export async function holdSeats(payload: {
  show_id: string;
  seat_ids: string[];
}) {
  return http("POST", "/customer/bookings/hold-seats", payload);
}

export async function confirmBooking(payload: {
  booking_id: string;
  payment_method: string;
  payment_details: any;
}) {
  return http("POST", "/customer/bookings/confirm", payload);
}

export async function confirmBookingManually(payload: {
  booking_id: string;
  seat_ids: string[];
}) {
  return http("POST", "/customer/bookings/confirm-manual", payload);
}

export async function releaseSeatHold(payload: { booking_id: string }) {
  return http("POST", "/customer/bookings/release-hold", payload);
}

// Payment Gateway Functions
// Payment functions removed - using simplified booking flow

// Simplified booking functions (no payment required)
export async function confirmSimpleBooking(payload: {
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
}) {
  return http("POST", "/customer/confirm-simple-booking", payload);
}

export async function getBookingDetails(bookingId: string) {
  return http("GET", `/customer/booking/${bookingId}`);
}

export default api;
