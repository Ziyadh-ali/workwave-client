import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { changePasswordService, getProfileDetails } from "../../../services/user/userService";
import { AxiosError } from "axios";
import ChangePasswordModal from "../modals/ChangePasswordModal";
import { enqueueSnackbar } from "notistack";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import { Employee } from "../../../utils/Interfaces/interfaces";

// User interface
export interface User {
    _id?: string;
    fullName: string;
    email: string;
    department: string;
    role: "hr" | "developer" | "projectManager";
    status: string;
    password: string;
    phone?: number;
    address?: string;
    joinedAt?: Date;
    manager?: {
        _id: string;
        fullName: string;
    };
    profilePic?: string;
    createdAt?: Date;
    updatedAt?: Date;
}


const EmployeeProfilePage = () => {
    const naviagte = useNavigate();
    const { employee } = useSelector((state: RootState) => state.employee);
    const [user, setUser] = useState<Employee>();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getProfileDetails(employee ? employee?._id : "");
                console.log(response.details)
                setUser(response.details);
            } catch (error) {
                console.log(error);
            }
        }
        fetchUsers()
    }, [employee]);

    const handleChangePass = async (updatedPass: {
        currentPassword: string,
        newPassword: string,
    }) => {
        try {
            if (employee?._id) {
                const response = await changePasswordService(employee?._id, updatedPass.currentPassword, updatedPass.newPassword);
                enqueueSnackbar(response.message, { variant: "success" });

            }
        } catch (error) {
            console.log(error);
            if (error instanceof AxiosError) {
                enqueueSnackbar(error.response?.data?.message || "An unexpected error occurred", { variant: "error" });
            } else {
                enqueueSnackbar("An unexpected error occurred", { variant: "error" });
            }
        }
    }


    const formatRole = (role: string) => {
        switch (role) {
            case "hr":
                return "HR Manager";
            case "developer":
                return "Developer";
            case "projectManager":
                return "Project Manager";
            default:
                return role;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar role="employee" />

            {/* Main Content */}
            <div className="flex-1 p-6">
                <Header role="employee" heading="Profile Page" />
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar className="w-20 h-20 rounded-full overflow-hidden border border-gray-300">
                                <AvatarImage
                                    src={user?.profilePic || "https://via.placeholder.com/80"}
                                    alt={user?.fullName}
                                    className="object-cover w-full h-full"
                                />
                                <AvatarFallback className="text-gray-700 bg-gray-200">
                                    {user?.fullName
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {user?.fullName}
                                </h2>
                                <p className="text-sm text-gray-600">{formatRole(user?.role ? user.role : "")}</p>
                                <p className="text-xs text-gray-500">ID: {user?._id}</p>
                                <span
                                    className={`inline-block mt-1 px-3 py-1 text-xs font-medium rounded-full ${user?.status === "active"
                                        ? "text-green-600 bg-green-100"
                                        : "text-red-600 bg-red-100"
                                        }`}
                                >
                                    {user ? user?.status.charAt(0).toUpperCase() + user?.status.slice(1) : ""}
                                </span>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button className="bg-blue-600 text-white" onClick={() => naviagte(`/profile/${user?._id}`)}>Edit Profile</Button>
                            <ChangePasswordModal onUpdate={handleChangePass} />
                        </div>
                    </div>
                </div>

                {/* Main Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        Email:
                                    </span>
                                    <span className="text-sm text-gray-600">{user?.email}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        Phone:
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {user?.phone ? `+91 ${user?.phone}` : "Not provided"}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        Address:
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {user?.address || "Not provided"}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Work Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">
                                    Work Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        Department:
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {user?.department}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        Role:
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {formatRole(user?.role ? user.role : "")}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-800">
                                        Reports to:
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {!user?.manager ? "Not assigned" : user.manager.fullName}
                                    </span>

                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activities */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">
                                    Recent Activities
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800">
                                        Clocked In
                                    </p>
                                    <span className="text-xs text-gray-600">March 24, 2025</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800">
                                        Leave Request Submitted
                                    </p>
                                    <span className="text-xs text-gray-600">March 20, 2025</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800">
                                        Task Completed
                                    </p>
                                    <span className="text-xs text-gray-600">March 18, 2025</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Section */}
                    <div className="space-y-6">
                        {/* Joining Date */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">
                                    Joining Date
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.joinedAt
                                        ? new Date(user?.joinedAt).toLocaleDateString()
                                        : "Not provided"}
                                </p>
                            </CardContent>
                        </Card>

                        {/* User Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">
                                    User Statistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800">
                                        Last Login
                                    </p>
                                    <span className="text-sm text-gray-800">
                                        {user?.updatedAt
                                            ? new Date(user?.updatedAt).toLocaleDateString()
                                            : "Not provided"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800">
                                        Account Created
                                    </p>
                                    <span className="text-sm text-gray-800">
                                        {user?.createdAt
                                            ? new Date(user?.createdAt).toLocaleDateString()
                                            : "Not provided"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-800">
                                        Status
                                    </p>
                                    <span className="text-sm text-gray-800 capitalize">
                                        {user?.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-gray-600">
                                    Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link to="/leave">
                                    <Button className="w-full bg-blue-600 text-white mb-2">
                                        Apply for Leave
                                    </Button>
                                </Link>
                                <Link to="/help-desk">
                                    <Button className="w-full bg-blue-600 text-white mb-2">
                                        Submit Help Desk Ticket
                                    </Button>
                                </Link>
                                <Link to="/payroll">
                                    <Button className="w-full bg-blue-600 text-white">
                                        View Payroll
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfilePage;