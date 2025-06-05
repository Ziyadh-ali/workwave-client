import axios from "axios";

export const employeeAxiosInstance = axios.create({
    baseURL : import.meta.env.VITE_API_URL,
    withCredentials : true,
    headers: {
        "Content-Type": "application/json",
    },
})

let isRefreshing = false;

employeeAxiosInstance.interceptors.response.use(
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
                    await employeeAxiosInstance.post("/refresh-token/user");
                    isRefreshing = false;

                    return employeeAxiosInstance(originalRequest);
                } catch (refreshError) {
                    alert("refresh expired")

                    isRefreshing = false;
                    localStorage.removeItem("employeeSession");
                    window.location.href = "/login";
                    return Promise.reject(refreshError);
                }
            }
        }
        if (
            error.response?.status === 401 &&
            error.response?.data?.message === "Access token not provided" &&
            !originalRequest._retry
        ) {
            localStorage.removeItem("employeeSession");
            window.location.href = "/login";
            return Promise.reject(error);
        }
        return Promise.reject(error);
    }
);