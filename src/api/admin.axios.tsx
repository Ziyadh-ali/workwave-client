import axios from "axios";

export const adminAxiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/admin`,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;

adminAxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 403 &&
            error.response?.data?.message === "Forbidden: Invalid or expired access token" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    await adminAxiosInstance.post("/refresh-token/admin");
                    isRefreshing = false;

                    return adminAxiosInstance(originalRequest);
                } catch (refreshError) {
                    alert("refresh expired")

                    isRefreshing = false;
                    localStorage.removeItem("adminSession");
                    window.location.href = "/admin/login";
                    return Promise.reject(refreshError);
                }
            }
        }
        if (
            error.response?.status === 401 &&
            error.response?.data?.message === "Access token not provided" &&
            !originalRequest._retry
        ) {
            localStorage.removeItem("adminSession");
            window.location.href = "/admin/login";
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);