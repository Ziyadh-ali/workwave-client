import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { useEffect, useState } from "react";
import { getUserDetails } from "../../../services/admin/adminService";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";

// Define the IUserModel interface based on the schema
interface IUserModel {
  _id: string,
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: string;
  profilePic?: string;
  phone?: number;
  address?: string;
  manager?: {
    _id: string;
    fullName: string
  };
  joinedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}


const UserDetailsPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState<IUserModel | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {

      try {
        if (userId) {
          const response = await getUserDetails(userId);
          setUser(response.user);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUsers();
  }, [userId])
  const formatRole = (role: string | undefined) => {
    switch (role) {
      case "hr":
        return "HR Manager";
      case "projectManager":
        return "Project Manager";
      case "developer":
        return "Developer";
      default:
        return role;
    }
  };

  // Format the date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" />

      <div className="flex-1 p-6">
        <Header heading="User details" role="admin" />

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src={user?.profilePic || "https://via.placeholder.com/80"}
                  alt={user?.fullName}
                />
                <AvatarFallback>
                  {typeof user?.fullName === "string"
                    ? user.fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {user?.fullName}
                </h2>
                <p className="text-sm text-gray-600">{formatRole(user?.role)}</p>
                <p className="text-xs text-gray-500">ID: EMP1001</p>
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
              <Button onClick={() => navigate(`/admin/users/${user?._id}/edit`)} className="bg-blue-600 text-white">Edit Profile</Button>
              <Button variant="outline">
                <span className="mr-2">⬇</span> Download Info
              </Button>
            </div>
          </div>
        </div>

        Main Sections
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
                    {user?.phone || "Not provided"}
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
                  <span className="text-sm text-gray-600">{user?.department}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Position:
                  </span>
                  <span className="text-sm text-gray-600">{formatRole(user?.role)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Reporting to:
                  </span>
                  <span className="text-sm text-gray-600">
                    {user?.manager?.fullName || "Not assigned"}
                  </span>
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
                  {user?.joinedAt && formatDate(user.joinedAt)}
                </p>
              </CardContent>
            </Card>

            {/* Leave & Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">
                  Leave & Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Sick Leave
                  </p>
                  <span className="text-sm text-gray-800">3/12 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Vacation
                  </p>
                  <span className="text-sm text-gray-800">5/15 days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <p className="text-sm text-gray-600">
                    Checked in today at 9:00 AM
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;