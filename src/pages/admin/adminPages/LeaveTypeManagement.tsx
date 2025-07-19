import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { useSnackbar } from "notistack";
import { Edit, Trash2 } from "lucide-react";
import { AddLeaveTypeModal, UpdateLeaveTypeModal } from "../modals/LeaveTypeKModal";
import { createLeaveTypeService, deleteLeaveTypeService, getLeaveTypesService, updateLeaveTypeService } from "../../../services/admin/adminService";
import { useNavigate } from "react-router-dom";
import { useConfirmModal } from "../../../components/useConfirm";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import { LeaveType } from "../../../utils/Interfaces/interfaces";

const LeaveTypeManagementPage = () => {
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar();
    const { confirm, ConfirmModalComponent } = useConfirmModal();
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveType | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filterPaid, setFilterPaid] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");

    const rowsPerPage = 2;

    const fetchLeaveTypes = async () => {
        try {
            const data = await getLeaveTypesService(currentPage, rowsPerPage, filterPaid);
            console.log(data)
            setLeaveTypes(data.leaveTypes);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error("Failed to fetch leave types:", error);
            enqueueSnackbar("Failed to fetch leave types", { variant: "error" });
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage , filterPaid]);

    const filteredLeaveTypes = (leaveTypes || []).filter((lt) =>
        lt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddLeaveType = async (leaveType: Omit<LeaveType, "_id">) => {
        try {
            const createdLeaveType = await createLeaveTypeService(leaveType);
            setLeaveTypes([...leaveTypes, createdLeaveType]);
            navigate("/admin/leave/types")
        } catch (error) {
            console.error("Error adding leave type:", error);
            enqueueSnackbar("Failed to add leave type", { variant: "error" });
        }
    };

    const handleUpdateLeaveType = async (id: string, leaveType: Omit<LeaveType, "_id">) => {
        const response = await updateLeaveTypeService(id, leaveType);
        setLeaveTypes(
            leaveTypes.map((lt) => (lt._id === id ? response.data : lt))
        );
        setSelectedLeaveType(null);
    };

    const handleDelete = async (id: string) => {
        confirm({
            title: "Delete LeaveType ?",
            message: "Are you sure you want to delete this LeaveType?",
            onConfirm: async () => {
                try {
                    await deleteLeaveTypeService(id);
                    setLeaveTypes(leaveTypes.filter((lt) => lt._id !== id));
                    enqueueSnackbar("Leave type deleted successfully", { variant: "success" });
                } catch (error) {
                    console.error("Failed to delete leave type:", error);
                    enqueueSnackbar("Failed to delete leave type", { variant: "error" });
                    setLeaveTypes([]);
                }
            },
        })
    };

    const openUpdateModal = (leaveType: LeaveType) => {
        setSelectedLeaveType(leaveType);
        setIsUpdateModalOpen(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar role="admin" />

            {/* Main Content */}
            <div className="flex-1 p-6">
                {/* Header */}
                <Header heading="Leave Type Management" role="admin" />

                {/* Leave Types Table */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800">
                            Leave Types
                        </CardTitle>
                        <AddLeaveTypeModal
                            open={isAddModalOpen}
                            onOpenChange={(open) => {
                                setIsAddModalOpen(open);
                            }}
                            onAdd={handleAddLeaveType}
                        />
                    </CardHeader>

                    <CardContent className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border rounded w-full sm:w-1/2"
                        />

                        <select
                            value={filterPaid}
                            onChange={(e) => {
                                setFilterPaid(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="p-2 border rounded w-full sm:w-1/4"
                        >
                            <option value="All">All</option>
                            <option value="Paid">Paid</option>
                            <option value="Unpaid">Unpaid</option>
                        </select>
                    </CardContent>

                    <CardContent>
                        {filteredLeaveTypes.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Max Days Allowed</TableHead>
                                        <TableHead>Is Paid</TableHead>
                                        <TableHead>Requires Approval</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLeaveTypes.map((leaveType) => (
                                        <TableRow key={leaveType._id as string}>
                                            <TableCell>{leaveType.name}</TableCell>
                                            <TableCell>{leaveType.description || "N/A"}</TableCell>
                                            <TableCell>{leaveType.maxDaysAllowed}</TableCell>
                                            <TableCell>{leaveType.isPaid ? "Yes" : "No"}</TableCell>
                                            <TableCell>{leaveType.requiresApproval ? "Yes" : "No"}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openUpdateModal(leaveType)}
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(leaveType._id as string)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <h1>No Leave Types</h1>
                        )}
                    </CardContent>

                    <CardContent className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                size="sm"
                                variant="outline"
                            >
                                Previous
                            </Button>
                            <Button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                size="sm"
                                variant="outline"
                            >
                                Next
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <UpdateLeaveTypeModal
                    open={isUpdateModalOpen}
                    onOpenChange={(open) => {
                        setIsUpdateModalOpen(open);
                        if (!open) setSelectedLeaveType(null);
                    }}
                    leaveType={selectedLeaveType}
                    onUpdate={handleUpdateLeaveType}
                />

                <ConfirmModalComponent />
            </div>
        </div>
    );
};

export default LeaveTypeManagementPage;