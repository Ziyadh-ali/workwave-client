import axios, { AxiosInstance } from "axios";
import { AxiosSetupOptions } from "../utils/Interfaces/interfaces";

let isRefreshing = false;


export function createAxiosInstance(options: AxiosSetupOptions): AxiosInstance {
  const instance = axios.create({
    baseURL: options.baseURL,
    withCredentials: true,
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (
        error.response?.status === 403 &&
        error.response?.data?.message ===
          "Forbidden: Invalid or expired access token" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            await instance.post(options.refreshEndpoint);
            isRefreshing = false;

            return instance(originalRequest);
          } catch (refreshError) {
            alert("refresh expired");
            isRefreshing = false;
            localStorage.removeItem(options.sessionKey);
            window.location.href = options.loginRedirect;
            return Promise.reject(refreshError);
          }
        }
      }

      if (
        error.response?.status === 401 &&
        error.response?.data?.message === "Access token not provided" &&
        !originalRequest._retry
      ) {
        localStorage.removeItem(options.sessionKey);
        window.location.href = options.loginRedirect;
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
}

export const adminAxios = createAxiosInstance({
  baseURL: `${import.meta.env.VITE_API_URL}/admin`,
  refreshEndpoint: "/refresh-token/admin",
  sessionKey: "adminSession",
  loginRedirect: "/admin/login",
});

export const employeeAxios = createAxiosInstance({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  refreshEndpoint: "/refresh-token/user",
  sessionKey: "employeeSession",
  loginRedirect: "/login",
});