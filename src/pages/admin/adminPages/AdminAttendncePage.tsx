import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Header } from "../../../components/HeaderComponent";
import Sidebar from "../../../components/SidebarComponent";
import { format } from "date-fns";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { getAllAttendanceService, regularizeStatusService, updateAttendanceService } from "../../../services/admin/adminService";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
// import { AxiosError } from "axios";

type Attendance = {
    _id: string;
    employeeId: {
        _id: string;
        fullName: string;
    };
    status: "Present" | "Absent" | "Weekend" | "Holiday" | "Pending";
    checkInTime?: string | null;
    checkOutTime?: string | null;
    date?: string;
    isRegularized?: boolean;
    isRegularizable?: boolean;
    regularizationRequest?: {
        reason: string;
        status: "Pending" | "Approved" | "Rejected";
        adminRemarks?: string;
    };
};

const AdminAttendancePage = () => {
    const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
    const [editedStatus, setEditedStatus] = useState<{
        [id: string]: {
            status?: Attendance["status"];
            checkInTime?: string;
            checkOutTime?: string;
        };
    }>({});
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [total, setTotal] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
    const [adminRemarks, setAdminRemarks] = useState("");

    const handleStatusChange = (id: string, newStatus: Attendance["status"]) => {
        setEditedStatus((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                status: newStatus,
            },
        }));
    };

    const handleCheckInChange = (id: string, value: string) => {
        setEditedStatus((prev) => ({
            ...prev,
            [id]: { ...prev[id], checkInTime: value },
        }));
    };

    const handleCheckOutChange = (id: string, value: string) => {
        setEditedStatus((prev) => ({
            ...prev,
            [id]: { ...prev[id], checkOutTime: value },
        }));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getAllAttendanceService(
                    selectedDate || Date.now(),
                    currentPage,
                    itemsPerPage
                );
                const safeData = Array.isArray(res.attendances?.data) ? res.attendances.data : [];
                console.log("Safe Data", safeData)
                setAttendanceData(safeData);
                setTotal(res.attendances?.total || 0);
            } catch (err) {
                console.error("Failed to fetch attendance:", err);
                setAttendanceData([]);
                setTotal(0);
            }
        };

        fetchData();
    }, [selectedDate, currentPage]);

    const handleSaveStatus = async (
        id: string,
        data: {
            status: Attendance["status"];
            checkInTime?: string;
            checkOutTime?: string;
        }
    ) => {
        const original = attendanceData.find((att) => att._id === id);
        if (!original) return;

        const updatePayload: Partial<{
            status: Attendance["status"];
            checkInTime: string;
            checkOutTime: string;
        }> = {};

        if (data.status !== original.status) {
            updatePayload.status = data.status;
        }

        if (
            data.checkInTime
        ) {
            updatePayload.checkInTime = data.checkInTime;
        }

        if (
            data.checkOutTime
        ) {
            updatePayload.checkOutTime = data.checkOutTime;
        }

        if (Object.keys(updatePayload).length === 0) {
            enqueueSnackbar("No changes to save.", { variant: "info" });
            return;
        }


        try {
            const response = await updateAttendanceService(id, updatePayload);
            enqueueSnackbar(response.message, { variant: "success" });
            setAttendanceData((prevData) =>
                prevData.map((item) =>
                    item._id === id
                        ? {
                            ...item,
                            ...response.updatedAttendance,
                        }
                        : item
                )
            );
            setEditedStatus((prev) => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            enqueueSnackbar(
                error instanceof AxiosError ? error.response?.data.message : "Failed to update",
                { variant: "error" }
            );
        }
    };

    const handleRegularizationAction = async (status: "Approved" | "Rejected") => {
        if (!selectedAttendance) return;
        try {
            const response = await regularizeStatusService(selectedAttendance._id, status, adminRemarks);
            enqueueSnackbar(response.message, { variant: "success" });
            setAttendanceData((prev) =>
                prev.map((item) =>
                    item._id === selectedAttendance._id
                        ? {
                            ...item,
                            isRegularized: status === "Approved",
                            regularizationRequest: {
                                ...item.regularizationRequest!,
                                status,
                                adminRemarks,
                            },
                        }
                        : item
                )
            );
            setSelectedAttendance(null);
            setAdminRemarks("");
        } catch (error) {
            console.log(error);
            enqueueSnackbar("Failed to update regularization", { variant: "error" });
        }
    };

    const totalPages = Math.ceil(total / itemsPerPage);

    const formatTimeString = (value?: string | null): string => {
        if (!value) return "";
        const parsedUTC = new Date(value);
        if (isNaN(parsedUTC.getTime())) return "";

        // Convert to local time
        const localDate = new Date(parsedUTC.getTime() + parsedUTC.getTimezoneOffset() * 60000);

        return format(localDate, "HH:mm");
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar role="admin" />
            <div className="flex-1 p-6">
                <Header role="admin" heading="Attendance Overview" />

                <div className="flex items-center gap-4 mb-4">
                    <label className="text-sm font-medium">Filter by date:</label>
                    <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-[200px]"
                    />
                    {selectedDate && (
                        <Button variant="outline" size="sm" onClick={() => setSelectedDate("")}>
                            Clear Filter
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-gray-600">Attendance History</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr>
                                    <th className="p-2 border">Employee</th>
                                    <th className="p-2 border">Date</th>
                                    <th className="p-2 border">Check-in</th>
                                    <th className="p-2 border">Check-out</th>
                                    <th className="p-2 border">Status</th>
                                    <th className="p-2 border">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData.length > 0 ? (
                                    attendanceData.map((att) => (
                                        <tr
                                            key={att._id}
                                            className={
                                                att.isRegularizable
                                                    ? "border-l-4 border-yellow-300"
                                                    : ""
                                            }
                                        >
                                            <td className="p-2 border">{att.employeeId?.fullName}</td>
                                            <td className="p-2 border">
                                                {att.date ? format(new Date(att.date), "MM/dd/yyyy") : "—"}
                                            </td>
                                            <td className="p-2 border">
                                                <Input
                                                    type="time"
                                                    value={
                                                        editedStatus[att._id]?.checkInTime ??
                                                        formatTimeString(att.checkInTime)
                                                    }
                                                    onChange={(e) => handleCheckInChange(att._id, e.target.value)}
                                                    className="w-[120px]"
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <Input
                                                    type="time"
                                                    value={
                                                        editedStatus[att._id]?.checkOutTime ??
                                                        formatTimeString(att.checkOutTime)
                                                    }
                                                    onChange={(e) => handleCheckOutChange(att._id, e.target.value)}
                                                    className="w-[120px]"
                                                />
                                            </td>
                                            <td className="p-2 border">
                                                <Select
                                                    value={editedStatus[att._id]?.status || att.status}
                                                    onValueChange={(value: Attendance["status"]) =>
                                                        handleStatusChange(att._id, value)
                                                    }
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Present">Present</SelectItem>
                                                        <SelectItem value="Absent">Absent</SelectItem>
                                                        <SelectItem value="Late">Late</SelectItem>
                                                        <SelectItem value="Leave">Leave</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-2 border flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        handleSaveStatus(att._id, {
                                                            status: editedStatus[att._id]?.status || att.status,
                                                            checkInTime: editedStatus[att._id]?.checkInTime || "",
                                                            checkOutTime: editedStatus[att._id]?.checkOutTime || "",
                                                        })
                                                    }
                                                >
                                                    Save
                                                </Button>
                                                {att.isRegularizable && att.regularizationRequest?.status === "Pending" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setSelectedAttendance(att);
                                                            setAdminRemarks(att.regularizationRequest?.adminRemarks || "");
                                                        }}
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-2 border text-center">
                                            No data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex justify-end items-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-3 py-1 text-sm rounded border ${currentPage === i + 1
                                    ? "bg-blue-600 text-white"
                                    : "bg-white text-gray-800 hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next
                    </Button>
                </div>

                {/* Regularization Modal */}
                <Dialog open={!!selectedAttendance} onOpenChange={() => setSelectedAttendance(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Regularization Request</DialogTitle>
                        </DialogHeader>
                        <div>
                            <p className="text-sm mb-2">
                                <strong>Reason:</strong> {selectedAttendance?.regularizationRequest?.reason}
                            </p>
                            <Textarea
                                placeholder="Admin remarks..."
                                value={adminRemarks}
                                onChange={(e) => setAdminRemarks(e.target.value)}
                                className="w-full mb-4"
                            />
                        </div>
                        <DialogFooter className="gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => handleRegularizationAction("Rejected")}
                            >
                                Reject
                            </Button>
                            <Button onClick={() => handleRegularizationAction("Approved")}>
                                Approve
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AdminAttendancePage;
