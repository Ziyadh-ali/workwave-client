import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CheckCircle } from "lucide-react";
import { useSnackbar } from "notistack";
import ShadTable from "../../../components/TableComponent";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import RejectLeaveRequestModal from "../modals/RejectLeaveRequest";
import { useLocation } from "react-router-dom";
import {
  getAllLeaveRequestsForManagerService,
  updateLeaveRequestStatusForManagerService,
} from "../../../services/user/userService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

export interface LeaveRequest {
  _id: string;
  employeeId: {
    fullName: string;
    role: string;
    _id: string;
  };
  leaveTypeId: {
    name: string;
    _id: string;
  };
  days: number;
  startDate: string;
  endDate: string;
  reason?: string;
  status?: "Pending" | "Approved" | "Rejected";
  rejectionReason?: string;
}

const ManagerLeaveManagementPage = () => {
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { employee } = useSelector((state: RootState) => state.employee);
  const limit = 5

  // Fetch leave requests (paginated)
  const fetchLeaveRequests = async (page: number) => {
    try {
      setIsLoading(true);
      // 👇 Assuming your service can accept page number
      const data = await getAllLeaveRequestsForManagerService(page , limit); 

      const updatedLeaveRequests = (data.leaveRequests || []).map(
        (request: LeaveRequest) => {
          const startDate = new Date(request.startDate);
          const endDate = new Date(request.endDate);
          const timeDifference = endDate.getTime() - startDate.getTime();
          const days = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
          return { ...request, days };
        }
      );

      setLeaveRequests(updatedLeaveRequests || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
      enqueueSnackbar("Failed to fetch leave requests", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial + On location or page change
  useEffect(() => {
    fetchLeaveRequests(currentPage);
    // eslint-disable-next-line
  }, [location, currentPage]);

  // Approve leave
  const handleApprove = async (id: string, userId: string) => {
    try {
      await updateLeaveRequestStatusForManagerService(id, "Approved", userId);
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req._id === id ? { ...req, status: "Approved" } : req
        )
      );
      enqueueSnackbar("Leave request approved successfully", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error approving leave request:", error);
      enqueueSnackbar("Failed to approve leave request", { variant: "error" });
    }
  };

  // Table columns
  const leaveColumns = [
    { header: "User Name", accessor: (row: LeaveRequest) => row.employeeId.fullName },
    { header: "Role", accessor: (row: LeaveRequest) => row.employeeId.role },
    { header: "Leave Type", accessor: (row: LeaveRequest) => row.leaveTypeId.name },
    { header: "Start Date", accessor: (row: LeaveRequest) => new Date(row.startDate).toDateString() },
    { header: "End Date", accessor: (row: LeaveRequest) => new Date(row.endDate).toDateString() },
    { header: "Days", accessor: (row: LeaveRequest) => row.days },
    {
      header: "Status",
      accessor: (row: LeaveRequest) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            row.status === "Pending"
              ? "bg-yellow-100 text-yellow-800"
              : row.status === "Approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: LeaveRequest) => {
        if (row.status === "Pending") {
          return (
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleApprove(row._id, row.employeeId._id)}
              >
                <CheckCircle size={16} className="mr-1" /> Approve
              </Button>
              <RejectLeaveRequestModal leaveRequestId={row._id} role="employee" />
            </div>
          );
        } else if (row.status === "Rejected") {
          return (
            <span className="text-sm text-red-600">
              Reason: {row.rejectionReason || "No reason provided"}
            </span>
          );
        } else {
          return (
            <Button variant="outline" size="sm" disabled>
              {row.status}
            </Button>
          );
        }
      },
    },
  ];

  // Access restriction
  if (employee?.role !== "hr") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
        <div className="text-center p-8 rounded-2xl shadow-2xl bg-opacity-30 bg-gray-800 backdrop-blur-lg border border-gray-700">
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-red-500 mx-auto animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.636-1.14 1.05-2.045L13.05 4.955c-.526-.84-1.574-.84-2.1 0L4.032 16.955C3.446 17.86 4.028 19 5.082 19z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-red-600 mb-2 tracking-wide">
            Access Denied
          </h1>
          <p className="text-gray-300 text-lg">
            You do not have permission to view this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold shadow-md transition-transform transform hover:scale-105"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar role="employee" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Header heading="Leave Request Management" role="employee" />
        <p className="text-sm text-gray-600 mb-4">
          Manage all developer leave requests
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Leave Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ShadTable
              columns={leaveColumns}
              data={leaveRequests}
              keyExtractor={(row) => row._id}
              emptyMessage={isLoading ? "Loading..." : "No Leave Requests Found"}
            />

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>

              <p className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </p>

              <Button
                variant="outline"
                disabled={currentPage === totalPages || isLoading}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManagerLeaveManagementPage;
