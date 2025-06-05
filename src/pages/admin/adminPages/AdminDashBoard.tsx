import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Header } from "../../../components/HeaderComponent";
import Sidebar from "../../../components/SidebarComponent";
import { useEffect, useState } from "react";
import { getAllLeaveRequestsService, getAllPayrollsService, getUsers } from "../../../services/admin/adminService";
import { NavLink } from "react-router-dom";
import { ILeaveRequest } from "../../../utils/Interfaces/interfaces";

function AdminDashBoard() {
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [leaveRequests, setLeaveRequests] = useState<ILeaveRequest[] | []>([]);
  const [pendingRequests, setPendingRequests] = useState<number>(0);
  const [payrollTotal, setPayrollTotal] = useState<number>(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      const response = await getUsers({ role: "all" }, 1, 10);
      setTotalEmployees(response.total);
    }
    const fetchLeaveRequests = async () => {
      const response = await getAllLeaveRequestsService();
      const pendingCount = response.leaveRequests.filter(req => req.status === "Pending").length;
      setPendingRequests(pendingCount)
      const latestRequests = response.leaveRequests.slice(0, 2);
      setLeaveRequests(latestRequests);
    };
    const fetchPayrolls = async () => {
      const response = await getAllPayrollsService();

      const totalNetSalary = response.payrolls.reduce((sum, payroll) => {
        return sum + payroll.netSalary;
      }, 0);

      setPayrollTotal(totalNetSalary);
    };
    fetchEmployees();
    fetchLeaveRequests();
    fetchPayrolls()
  }, [totalEmployees,])


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" />
      <div className="flex-1 p-6">
        <Header heading="Dashboard" role="admin" />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">{totalEmployees}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Pending Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">{pendingRequests}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Payroll Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">₹{payrollTotal}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-800">5%</p>
            </CardContent>
          </Card>
        </div>

        {/* Detail Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Recent Leave Requests */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">Recent Leave Requests</CardTitle>
              <NavLink to="/admin/leave/requests" className="text-blue-600 text-sm">View All</NavLink>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaveRequests.length === 0 ? (
                <p className="text-sm text-gray-500">No recent leave requests.</p>
              ) : (
                leaveRequests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{request.employeeId.fullName}</p>
                      <p className="text-xs text-gray-600">
                        {request.leaveTypeId.name} - {request.duration} days
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${request.status === "Approved"
                        ? "text-green-600 bg-green-100"
                        : request.status === "Rejected"
                          ? "text-red-600 bg-red-100"
                          : "text-yellow-600 bg-yellow-100"
                        }`}
                    >
                      {request.status}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>


          {/* Recent Payroll */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">Recent Payroll</CardTitle>
              <NavLink to="/admin/payroll" className="text-blue-600 text-sm">View All</NavLink>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">March 2025</p>
                  <p className="text-xs text-gray-600">Processing</p>
                </div>
                <span className="text-sm font-medium text-gray-800">$48,000</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">February 2025</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <span className="text-sm font-medium text-gray-800">$48,000</span>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Overview */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">Attendance Overview</CardTitle>
              <NavLink to="/admin/attendance" className="text-blue-600 text-sm">View All</NavLink>

            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">90 Employees</p>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  Present
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">10 Employees</p>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                  Absent
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashBoard;
