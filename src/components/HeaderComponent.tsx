import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useDispatch, useSelector } from "react-redux";
import { employeeLogout } from "./../store/slices/employeeSlice";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { logoutService } from "../services/user/userService";
import { RootState } from "../store/store";
import { adminLogout } from "../store/slices/adminSlice";
import { NotificationDropdown } from "./NotificationDropDown";
import { adminAxios } from "../api/axios";

interface Props {
    heading: string;
    role: "employee" | "admin";
}

export const Header: React.FC<Props> = ({ heading, role }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { employee } = useSelector((state: RootState) => state.employee);



    const handleLogout = async () => {
        try {
            if (role === "employee") {
                const response = await logoutService();
                dispatch(employeeLogout());
                enqueueSnackbar(response.message, { variant: "success" });
                navigate("/login");
            } else if (role === "admin") {
                const response = await adminAxios.post("/logout");
                dispatch(adminLogout());
                enqueueSnackbar(response.data.message, { variant: "success" });
                navigate("/admin/login");
            }
        } catch (error) {
            console.log("Error in logout", error);
        }
    };

    const getProfilePicUrl = (id: string, version?: string) => {
        if (!version) return "";
        return `https://res.cloudinary.com/dr0iflvfs/image/upload/v${version}/user_profiles/employees/${id}.jpg`;
    };


    return (
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-semibold text-gray-800">{heading}</h1>
            </div>
            <div className="flex items-center space-x-4">
                {/* Notification Dropdown */}
                <NotificationDropdown />

                {/* User Avatar and Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="flex items-center space-x-2 cursor-pointer">
                            <Avatar className="w-12 h-12 rounded-full overflow-hidden">
                                <AvatarImage
                                    src={
                                        employee?.profilePic
                                            ? getProfilePicUrl(employee._id!, employee.profilePic)
                                            : "https://via.placeholder.com/40"
                                    }
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                                    }}
                                />
                                <AvatarFallback className="w-12 h-12 rounded-full flex items-center justify-center text-lg bg-gray-200">
                                    {employee?.fullName?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-800">
                                {role === "employee" ? employee?.fullName : "John Smith"}
                            </span>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border border-gray-200 shadow-md">
                        <DropdownMenuItem onClick={() => navigate(role === "employee" ? `/profile` : `/admin/profile`)}>
                            Profile
                        </DropdownMenuItem>
                        {role === "employee" && (
                            <DropdownMenuItem onClick={() => navigate(`/messages`)}>
                                Messages
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};