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
import { adminAxiosInstance } from "../api/admin.axios";
import { adminLogout } from "../store/slices/adminSlice";
import { NotificationDropdown } from "./NotificationDropDown";

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
                const response = await adminAxiosInstance.post("/logout");
                dispatch(adminLogout());
                enqueueSnackbar(response.data.message, { variant: "success" });
                navigate("/admin/login");
            }
        } catch (error) {
            console.log("Error in logout", error);
        }
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
                                {role === "employee" ? (
                                    <AvatarImage
                                        src={
                                            employee && employee?.profilePic?.length > 0
                                                ? employee?.profilePic
                                                : "https://via.placeholder.com/40"
                                        }
                                        alt="Profile"
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <AvatarImage
                                        src="data:image/jpeg;base64,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"
                                        alt="John Smith"
                                    />
                                )}
                                <AvatarFallback className="w-12 h-12 rounded-full flex items-center justify-center text-lg bg-gray-200">
                                    NA
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