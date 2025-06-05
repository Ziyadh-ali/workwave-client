import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
// import { Progress } from "@radix-ui/react-progress";
import { Header } from "../../../components/HeaderComponent";
import Sidebar from "../../../components/SidebarComponent";


export default function AdminProfile() {
    return (
        <div className="flex min-h-screen bg-gray-100">
      <Sidebar role = "admin"/>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Header heading="Profile" role="admin"/>
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage
                  src="data:image/jpeg;base64,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"
                  alt="Admin User"
                />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  John Doe
                </h2>
                <p className="text-sm text-gray-600">System Administrator</p>
                <p className="text-xs text-gray-500">ID: ADMIN001</p>
                <span className="inline-block mt-1 px-3 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                  Active
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button className="bg-blue-600 text-white">Edit Profile</Button>
              <Button variant="outline">
                <span className="mr-2">⬇</span> Download Info
              </Button>
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
                  <span className="text-sm text-gray-600">
                    john.doe@company.com
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Phone:
                  </span>
                  <span className="text-sm text-gray-600">
                    (+1) 555-987-6543
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Birthday:
                  </span>
                  <span className="text-sm text-gray-600">April 20, 1985</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Address:
                  </span>
                  <span className="text-sm text-gray-600">
                    456 Admin Lane, Suite 200, Los Angeles, CA 90001
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
                  <span className="text-sm text-gray-600">IT Administration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Position:
                  </span>
                  <span className="text-sm text-gray-600">
                    System Administrator
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Reports to:
                  </span>
                  <span className="text-sm text-gray-600">CEO</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-800">
                    Access Level:
                  </span>
                  <span className="text-sm text-gray-600">Full Admin</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Admin Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">
                  Recent Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    User Access Updated
                  </p>
                  <span className="text-xs text-gray-600">March 5, 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Payroll Processed
                  </p>
                  <span className="text-xs text-gray-600">March 1, 2025</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Report Generated
                  </p>
                  <span className="text-xs text-gray-600">February 28, 2025</span>
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
                  June 10, 2018
                </p>
              </CardContent>
            </Card>

            {/* Admin Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">
                  Admin Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Active Users
                  </p>
                  <span className="text-sm text-gray-800">150</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Pending Requests
                  </p>
                  <span className="text-sm text-gray-800">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-800">
                    Last Login
                  </p>
                  <span className="text-sm text-gray-800">March 6, 2025</span>
                </div>
              </CardContent>
            </Card>

            {/* Management Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-600">
                  Management Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-blue-600 text-white mb-2">
                  Manage Users
                </Button>
                <Button className="w-full bg-blue-600 text-white mb-2">
                  Set Permissions
                </Button>
                <Button className="w-full bg-blue-600 text-white">
                  Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    )
}
