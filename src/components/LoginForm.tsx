import {  useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux"
import { useEffect, useState } from "react";
import { Eye, EyeOff } from 'lucide-react';
import { adminLogin } from "../store/slices/adminSlice";
import { employeeLogin } from "../store/slices/employeeSlice";
import { loginSchema } from "../utils/login.validator";
import { adminLoginService } from "../services/admin/adminService";
import { employeeLoginService } from "../services/user/userService";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import ForgotPasswordModal from "../pages/employee/modals/forgetPasswordModal";


const LoginForm = ({ role }: { role: "admin" | "employee" }) => {
    const [showPassword, setShowPassword] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const dispatch = useDispatch()
    useEffect(() => {
        enqueueSnackbar("Please Login", { variant: "info" })
    }, []);

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: loginSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const axiosInstance = role === "admin" ? adminLoginService : employeeLoginService;
                const response = await axiosInstance(values);
                dispatch(role === "admin" ? adminLogin(response.loginData) : employeeLogin(response.loginData));
                enqueueSnackbar(response.message, { variant: "success" });
                navigate(role === "admin" ? "/admin/dashboard" : "/login");
            } catch (error) {
                if (error instanceof AxiosError) {
                    const errorData = error.response?.data;
                    if (errorData?.errors && Array.isArray(errorData.errors)) {
                        errorData.errors.forEach((err: { field: string; message: string }) => {
                            enqueueSnackbar(`${err.field}: ${err.message}`, { variant: "error" });
                        });
                    } else {
                        enqueueSnackbar(errorData?.message || "An unexpected error occurred", { variant: "error" });
                    }
                } else {
                    enqueueSnackbar("An unexpected error occurred", { variant: "error" });
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="flex flex-col items-center">
            <div className="mb-6">
                <img
                    src="https://res.cloudinary.com/dr0iflvfs/image/upload/v1741307136/logo-transparent_gra32p.png"
                    alt="HR Portal Logo"
                    className="h-25"
                />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Welcome back
            </h2>
            {/* Form with onSubmit handler to prevent default behavior */}
            <form
                className="w-full max-w-sm space-y-4"
                onSubmit={(e) => {
                    e.preventDefault();
                    formik.handleSubmit();
                }}
            >
                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="text"
                        placeholder="Enter your email"
                        className="w-full"
                        {...formik.getFieldProps("email")}
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                    )}
                </div>
                <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="w-full pr-10"
                            {...formik.getFieldProps("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    {formik.touched.password && formik.errors.password && (
                        <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
                    )}
                </div>

                {role === "employee" ? <div className="text-right">
                    <ForgotPasswordModal  />
                </div> : ""}
                <Button
                    type="submit"
                    disabled={formik.isSubmitting}
                    className="w-full bg-blue-600 text-white cursor-pointer"
                >
                    {formik.isSubmitting ? "Signing In..." : "Sign In"}
                </Button>
            </form>
        </div>
    );
};

export default LoginForm;