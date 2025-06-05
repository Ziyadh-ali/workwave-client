import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

// Assume these are the services for fetching and updating user data
import { validationSchema } from "../../../utils/editValidation";
import { getManagers, getUserDetails, updateUserService } from "../../../services/admin/adminService";
import Sidebar from "../../../components/SidebarComponent";
import { Employee } from "../../../utils/Interfaces/interfaces";




const AdminEditUserPage = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { userId } = useParams<{ userId: string }>();
    const [Managers, setManagers] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    // Formik setup
    const formik = useFormik({
        initialValues: {
            fullName: "",
            email: "",
            department: "",
            role: "" as "hr" | "developer" | "projectManager",
            status: "",
            phone: "",
            address: "",
            salary: "",
            manager: "",
            joinedAt: "",
            profilePic: null as File | null,
        },
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const formData = new FormData();
                Object.entries(values).forEach(([key, value]) => {
                    if (value !== null && value !== undefined && value !== "") {
                        if (key === "joinedAt" && typeof value === "string") {
                            formData.append(key, new Date(value).toISOString());
                        } else if (value instanceof File) {
                            formData.append(key, value);
                        } else {
                            formData.append(key, value );
                        }
                    }
                });

                const response = await updateUserService(userId || "", formData);
                enqueueSnackbar(response.message, { variant: "success" });
                navigate("/admin/users");
            } catch (error) {
                console.error("Submission Error:", error);
                enqueueSnackbar("An error occurred during submission", { variant: "error" });
            } finally {
                setSubmitting(false);
            }
        },
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await getUserDetails(userId || "");
                if (response.user) {
                    formik.setValues({
                        fullName: response.user.fullName || "",
                        email: response.user.email || "",
                        department: response.user.department || "",
                        role: response.user.role || "",
                        status: response.user.status || "",
                        phone: response.user.phone ? response.user.phone.toString() : "",
                        address: response.user.address || "",
                        manager: response.user.manager || "",
                        salary : response.user.salary || "",
                        joinedAt: response.user.joinedAt
                            ? new Date(response.user.joinedAt).toISOString().split("T")[0]
                            : "",
                        profilePic: null,
                    });
                }
            } catch (error) {
                console.error(error);
                enqueueSnackbar("Failed to fetch user details", { variant: "error" });
            } finally {
                setLoading(false);
            }
        };
        const fetchManagers = async () => {
            try {
                const response = await getManagers();
                setManagers(response.managers);
            } catch (error) {
                console.error(error);
                enqueueSnackbar("Failed to fetch managers", { variant: "error" });
            }
        }
        fetchUserProfile();
        fetchManagers();

        //eslint-disable-next-line
    }, [userId]);

    return (
        <ErrorBoundary
            fallback={<div>Something went wrong</div>}
            onError={(error, info) => {
                console.error("Error caught by boundary:", error);
                console.error("Component stack:", info);
            }}
        >
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar role="admin" />
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-lg bg-white shadow-md rounded-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Edit User Profile</h2>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                formik.handleSubmit(e);
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <Input {...formik.getFieldProps("fullName")} placeholder="Enter full name" />
                                {formik.touched.fullName && formik.errors.fullName && (
                                    <div className="text-red-500 text-sm">{formik.errors.fullName}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Email</label>
                                <Input {...formik.getFieldProps("email")} type="email" placeholder="Enter email" />
                                {formik.touched.email && formik.errors.email && (
                                    <div className="text-red-500 text-sm">{formik.errors.email}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Department</label>
                                <Input {...formik.getFieldProps("department")} placeholder="Enter department" />
                                {formik.touched.department && formik.errors.department && (
                                    <div className="text-red-500 text-sm">{formik.errors.department}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Salary</label>
                                <Input {...formik.getFieldProps("salary")} placeholder="Enter Salary" />
                                {formik.touched.salary && formik.errors.salary && (
                                    <div className="text-red-500 text-sm">{formik.errors.salary}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Role</label>
                                <Select
                                    onValueChange={(value) => formik.setFieldValue("role", value)}
                                    value={formik.values.role}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hr">HR</SelectItem>
                                        <SelectItem value="developer">Developer</SelectItem>
                                        <SelectItem value="projectManager">Project Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.touched.role && formik.errors.role && (
                                    <div className="text-red-500 text-sm">{formik.errors.role}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <Select
                                    onValueChange={(value) => formik.setFieldValue("status", value)}
                                    value={formik.values.status}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                {formik.touched.status && formik.errors.status && (
                                    <div className="text-red-500 text-sm">{formik.errors.status}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Phone</label>
                                <Input {...formik.getFieldProps("phone")} placeholder="Enter phone number" />
                                {formik.touched.phone && formik.errors.phone && (
                                    <div className="text-red-500 text-sm">{formik.errors.phone}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <Input {...formik.getFieldProps("address")} placeholder="Enter address" />
                                {formik.touched.address && formik.errors.address && (
                                    <div className="text-red-500 text-sm">{formik.errors.address}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Manager</label>
                                <Select
                                    onValueChange={(value) => formik.setFieldValue("manager", value)}
                                    value={formik.values.manager}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Managers.map((manager) => (
                                            <SelectItem key={manager?.fullName} value={manager._id || ""}>
                                                {manager?.fullName} ({manager?.role === "hr" ? "HR" : "Project Manager"})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {formik.touched.manager && formik.errors.manager && (
                                    <div className="text-red-500 text-sm">{formik.errors.manager}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Joined At</label>
                                <Input
                                    {...formik.getFieldProps("joinedAt")}
                                    type="date"
                                    placeholder="Select joining date"
                                />
                                {formik.touched.joinedAt && formik.errors.joinedAt && (
                                    <div className="text-red-500 text-sm">{formik.errors.joinedAt}</div>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Profile Picture</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        formik.setFieldValue("profilePic", event.currentTarget.files?.[0])
                                    }
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {formik.touched.profilePic && formik.errors.profilePic && (
                                    <div className="text-red-500 text-sm">{formik.errors.profilePic}</div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/admin/users")}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={formik.isSubmitting || loading}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default AdminEditUserPage;