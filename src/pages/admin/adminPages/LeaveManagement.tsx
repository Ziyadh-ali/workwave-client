import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CheckCircle, } from "lucide-react";
import { useSnackbar } from "notistack";
import { getAllLeaveRequestsService, updateLeaveRequestStatusService } from "../../../services/admin/adminService";
import ShadTable from "../../../components/TableComponent";
import Sidebar from "../../../components/SidebarComponent";
import RejectLeaveRequestModal from "../../employee/modals/RejectLeaveRequest";
import { useLocation } from "react-router-dom";
import { ILeaveRequest } from "../../../utils/Interfaces/interfaces";


const LeaveManagementPage = () => {
    const location = useLocation()
    const { enqueueSnackbar } = useSnackbar();
    const [leaveRequests, setLeaveRequests] = useState<ILeaveRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const rowsPerPage = 3;


    const fetchLeaveRequests = async () => {
        try {
            const data = await getAllLeaveRequestsService(currentPage, rowsPerPage, statusFilter === "All" ? "" : statusFilter);
            const updatedLeaveRequests = (data.leaveRequests || []).map((request: ILeaveRequest) => {
                const startDate = new Date(request.startDate);
                const endDate = new Date(request.endDate);

                const timeDifference = endDate.getTime() - startDate.getTime();

                const days = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

                return { ...request, days: days };
            });
            setLeaveRequests(updatedLeaveRequests || []);
            setTotalPages(data.totalPages)
        } catch (error) {
            console.error("Failed to fetch leave requests:", error);
            enqueueSnackbar("Failed to fetch leave requests", { variant: "error" });
        }
    };
    // Fetch leave requests on mount
    useEffect(() => {
        fetchLeaveRequests();

        //eslint-disable-next-line
    }, [enqueueSnackbar, location, currentPage, statusFilter]);

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

    const filteredData = leaveRequests.filter((item) => {
        const nameMatch = item.employeeId.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const typeMatch = item.leaveTypeId.name.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch || typeMatch;
    });

    const leaveColumns = [
        {
            header: "User Name",
            accessor: (row: ILeaveRequest) => row.employeeId.fullName,
        },
        {
            header: "Role",
            accessor: (row: ILeaveRequest) => row.employeeId.role,
        },
        {
            header: "Leave Type",
            accessor: (row: ILeaveRequest) => row.leaveTypeId.name,
        },
        {
            header: "Start Date",
            accessor: (row: ILeaveRequest) => new Date(row.startDate).toDateString(),
        },
        {
            header: "End Date",
            accessor: (row: ILeaveRequest) => new Date(row.endDate).toDateString(),
        },
        {
            header: "Days",
            accessor: (row: ILeaveRequest) => row.days,
        },
        {
            header: "Status",
            accessor: (row: ILeaveRequest) => (
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
            accessor: (row: ILeaveRequest) =>
                row.status === "Pending" ? (
                    <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleApprove(row._id as string, row.employeeId._id as string)}>
                            <CheckCircle size={16} className="mr-1" /> Approve
                        </Button>
                        <RejectLeaveRequestModal
                            leaveRequestId={row._id}
                            role="admin"
                        />
                    </div>
                ) : (
                    <Button variant="outline" size="sm" disabled>{row.status}</Button>
                ),
        },
        {
            header: "Rejection Reason",
            accessor: (row: ILeaveRequest) =>
                row.status === "Rejected" ? (
                    <span className="text-sm text-red-600">
                        {row.reason || "No reason provided"}
                    </span>
                ) : (
                    "-"
                ),
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar role="admin" />

            {/* Main Content */}
            <div className="flex-1 p-6">
                <h1 className="text-2xl font-semibold text-gray-800">Leave Management</h1>
                <p className="text-sm text-gray-600">Manage all leave requests</p>

                {/* Leave Requests Table */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Leave Requests</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 justify-between my-4">
                        <input
                            type="text"
                            placeholder="Search by employee name or leave type"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border rounded w-full sm:w-1/2"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="p-2 border rounded w-full sm:w-1/4"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </CardContent>
                    <CardContent>
                        <ShadTable
                            columns={leaveColumns}
                            data={filteredData}
                            keyExtractor={(row) => row._id}
                            emptyMessage="No Leave Requests"
                        />
                    </CardContent>
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </p>
                        <CardContent className="flex gap-2">
                            <Button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                variant="outline"
                                size="sm"
                            >
                                Previous
                            </Button>
                            <Button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                variant="outline"
                                size="sm"
                            >
                                Next
                            </Button>
                        </CardContent>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LeaveManagementPage;
