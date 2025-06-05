import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CheckCircle, } from "lucide-react";
import { useSnackbar } from "notistack";
import { getAllLeaveRequestsService, updateLeaveRequestStatusService } from "../../../services/admin/adminService";
import ShadTable from "../../../components/TableComponent";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import RejectLeaveRequestModal from "../modals/RejectLeaveRequest";
import { useLocation } from "react-router-dom";

// Define LeaveRequest interface
export interface LeaveRequest {
    _id: string;
    employeeId: {
        fullName: string,
        role: string,
        _id: string,
    }
    leaveTypeId: {
        name: string,
        _id: string,
    }
    days: number;
    startDate: string;
    endDate: string;
    reason?: string;
    status?: "Pending" | "Approved" | "Rejected";
    rejectionReason ?: string;
}


const ManagerLeaveManagementPage = () => {
    const location = useLocation()
    const { enqueueSnackbar } = useSnackbar();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    

    // Fetch leave requests on mount
    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const data = await getAllLeaveRequestsService();
                const updatedLeaveRequests = (data.leaveRequests || []).map((request: LeaveRequest) => {
                    const startDate = new Date(request.startDate);
                    const endDate = new Date(request.endDate);

                    const timeDifference = endDate.getTime() - startDate.getTime();

                    const days = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

                    return { ...request, days: days };
                });
                setLeaveRequests(updatedLeaveRequests || []);
            } catch (error) {
                console.error("Failed to fetch leave requests:", error);
                enqueueSnackbar("Failed to fetch leave requests", { variant: "error" });
            }
        };
        fetchLeaveRequests();

        //eslint-disable-next-line
    }, [ location]);

    // Handle approve/reject actions
    const handleApprove = async (id: string, userId: string) => {
        try {
            await updateLeaveRequestStatusService(id, "Approved", userId);
            setLeaveRequests(leaveRequests.map(req => req._id === id ? { ...req, status: "Approved" } : req));
            enqueueSnackbar("Leave request approved successfully", { variant: "success" });
        } catch (error) {
            console.error("Error approving leave request:", error);
            enqueueSnackbar("Failed to approve leave request", { variant: "error" });
        }
    };

   

    const leaveColumns = [
        {
            header: "User Name",
            accessor: (row: LeaveRequest) => row.employeeId.fullName,
        },
        {
            header: "Role",
            accessor: (row: LeaveRequest) => row.employeeId.role,
        },
        {
            header: "Leave Type",
            accessor: (row: LeaveRequest) => row.leaveTypeId.name,
        },
        {
            header: "Start Date",
            accessor: (row: LeaveRequest) => new Date(row.startDate).toDateString(),
        },
        {
            header: "End Date",
            accessor: (row: LeaveRequest) => new Date(row.endDate).toDateString(),
        },
        {
            header: "Days",
            accessor: (row: LeaveRequest) => row.days,
        },
        {
            header: "Status",
            accessor: (row: LeaveRequest) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    row.status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: "Actions",
            accessor: (row: LeaveRequest) => {
                if (row.status === "Pending") {
                    return (
                        <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleApprove(row._id as string, row.employeeId._id as string)}>
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
                        <Button variant="outline" size="sm" disabled>{row.status}</Button>
                    );
                }
            }
        }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar role="employee" />

            {/* Main Content */}
            <div className="flex-1 p-6">
                <Header heading="Leave Management" role="employee" />
                <p className="text-sm text-gray-600">Manage all leave requests</p>

                {/* Leave Requests Table */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Leave Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ShadTable
                            columns={leaveColumns}
                            data={leaveRequests}
                            keyExtractor={(row) => row._id}
                            emptyMessage="No Leave Requests"
                        />
                    </CardContent>
                </Card>
            </div>
            
        </div>
    );
};

export default ManagerLeaveManagementPage;
