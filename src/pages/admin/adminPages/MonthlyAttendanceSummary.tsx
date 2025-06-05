import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CheckCircle, RefreshCw, CheckCheck } from "lucide-react";
import { useSnackbar } from "notistack";
import ShadTable from "../../../components/TableComponent";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import { useLocation } from "react-router-dom";
import {
    approveSummaryStatusService,
    bulkApproveSummariesService,
    generateMonthlySummaryService,
    getMonthlySummariesService,
    regenerateMonthlySummaryService,
    rejectSummaryStatusService
} from "../../../services/admin/adminService";
import RejectSummaryModal from "../modals/RejectSummaryModal";
import GenerateSummaryModal from "../modals/GenerateSummaryModal";
import { MonthlyAttendanceSummary } from "../../../utils/Interfaces/interfaces";

const MonthlyAttendanceSummaryPage = () => {
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const [summaries, setSummaries] = useState<MonthlyAttendanceSummary[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [isGenerating, setIsGenerating] = useState(false);
    const [selectedSummaries, setSelectedSummaries] = useState<string[]>([]);
    const [isBulkApproving, setIsBulkApproving] = useState(false);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                const data = await getMonthlySummariesService(selectedMonth, selectedYear);
                console.log("summary",data)
                setSummaries(data || []);
                setSelectedSummaries([]);
            } catch (error) {
                console.error("Failed to fetch summaries:", error);
                enqueueSnackbar("Failed to fetch attendance summaries", { variant: "error" });
            }
        };
        fetchSummaries();
        //eslint-disable-next-line
    }, [selectedMonth, selectedYear, location]);

    const handleGenerate = async (month: number, year: number, employeeId?: string) => {
        setIsGenerating(true);
        try {
            const data = await generateMonthlySummaryService(month, year, employeeId);
            setSummaries(prev => [...prev, ...(Array.isArray(data) ? data : [data])]);
            enqueueSnackbar("Summary generated successfully", { variant: "success" });
        } catch (error) {
            console.error("Error generating summary:", error);
            enqueueSnackbar("Failed to generate summary", { variant: "error" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerate = async (month: number, year: number, employeeId?: string) => {
        try {
            const data = await regenerateMonthlySummaryService(month, year, employeeId);
            setSummaries(prev =>
                prev.map(summary =>
                    summary._id === data._id ? data : summary
                )
            );
            enqueueSnackbar("Summary regenerated successfully", { variant: "success" });
        } catch (error) {
            console.error("Error regenerating summary:", error);
            enqueueSnackbar("Failed to regenerate summary", { variant: "error" });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await approveSummaryStatusService(id);
            setSummaries(prev =>
                prev.map(summary =>
                    summary._id === id ? { ...summary, status: "Approved" } : summary
                )
            );
            enqueueSnackbar("Summary approved successfully", { variant: "success" });
        } catch (error) {
            console.error("Error approving summary:", error);
            enqueueSnackbar("Failed to approve summary", { variant: "error" });
        }
    };

    const handleBulkApprove = async () => {
        if (selectedSummaries.length === 0) {
            enqueueSnackbar("Please select at least one summary to approve", { variant: "warning" });
            return;
        }

        setIsBulkApproving(true);
        try {
            await bulkApproveSummariesService(selectedSummaries);

            setSummaries(prev =>
                prev.map(summary =>
                    selectedSummaries.includes(summary._id)
                        ? { ...summary, status: "Approved" }
                        : summary
                )
            );

            setSelectedSummaries([]);
            enqueueSnackbar(`Approved ${selectedSummaries.length} summaries successfully`, {
                variant: "success"
            });
        } catch (error) {
            console.error("Error in bulk approval:", error);
            enqueueSnackbar("Failed to approve summaries", { variant: "error" });
        } finally {
            setIsBulkApproving(false);
        }
    };

    const toggleSummarySelection = (id: string) => {
        setSelectedSummaries(prev =>
            prev.includes(id)
                ? prev.filter(summaryId => summaryId !== id)
                : [...prev, id]
        );
    };

    const selectAllPending = () => {
        const pendingIds = summaries
            .filter(s => s.status === "Pending")
            .map(s => s._id);
        setSelectedSummaries(pendingIds);
    };

    const columns = [
        {
            header: "Select",
            accessor: (row: MonthlyAttendanceSummary) => (
                <input
                    type="checkbox"
                    checked={selectedSummaries.includes(row._id)}
                    onChange={() => toggleSummarySelection(row._id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
            ),
            width: 50
        },
        {
            header: "Employee",
            accessor: (row: MonthlyAttendanceSummary) => row.employeeId.fullName,
        },
        {
            header: "Role",
            accessor: (row: MonthlyAttendanceSummary) => row.employeeId.role,
        },
        {
            header: "Month/Year",
            accessor: (row: MonthlyAttendanceSummary) =>
                `${new Date(row.year, row.month - 1).toLocaleString('default', { month: 'long' })} ${row.year}`,
        },
        {
            header: "Working Days",
            accessor: (row: MonthlyAttendanceSummary) => row.workingDays,
        },
        {
            header: "Present Days",
            accessor: (row: MonthlyAttendanceSummary) => row.presentDays,
        },
        {
            header: "Leave Days",
            accessor: (row: MonthlyAttendanceSummary) => row.leaveDays,
        },
        {
            header: "Non Paid Leaves",
            accessor: (row: MonthlyAttendanceSummary) => row.nonPaidLeaves,
        },
        {
            header: "Status",
            accessor: (row: MonthlyAttendanceSummary) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    row.status === "Approved" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: (row: MonthlyAttendanceSummary) => (
                <div className="flex space-x-2">
                    {row.status === "Pending" && (
                        <>
                            <Button
                                size="sm"
                                onClick={() => handleApprove(row._id)}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle size={16} className="mr-1" /> Approve
                            </Button>
                            <RejectSummaryModal
                                onReject={async (reason) => {
                                    await rejectSummaryStatusService(row._id, reason);
                                    setSummaries(prev =>
                                        prev.map(summary =>
                                            summary._id === row._id ?
                                                { ...summary, status: "Rejected", rejectionReason: reason } :
                                                summary
                                        )
                                    );
                                }}
                            />
                        </>
                    )}
                    {row.status === "Rejected" && (
                        <span className="text-sm text-red-600">
                            Reason: {row.rejectionReason || "No reason provided"}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerate(row.month, row.year, row.employeeId._id)}
                    >
                        <RefreshCw size={16} className="mr-1" /> Regenerate
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar role="admin" />

            <div className="flex-1 p-6">
                <Header heading="Monthly Attendance Summary" role="admin" />
                <p className="text-sm text-gray-600">Manage and approve monthly attendance records</p>

                {selectedSummaries.length > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-800">
                            {selectedSummaries.length} selected
                        </span>
                        <Button
                            onClick={handleBulkApprove}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                            disabled={isBulkApproving}
                        >
                            <CheckCheck size={16} className="mr-2" />
                            {isBulkApproving ? "Approving..." : "Approve Selected"}
                        </Button>
                    </div>
                )}

                <div className="flex justify-between items-center mt-6 mb-4">
                    <div className="flex space-x-4">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="border rounded px-3 py-2"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="border rounded px-3 py-2"
                        >
                            {Array.from({ length: 10 }, (_, i) => (
                                <option key={i} value={new Date().getFullYear() - 5 + i}>
                                    {new Date().getFullYear() - 5 + i}
                                </option>
                            ))}
                        </select>
                    </div>

                    <GenerateSummaryModal
                        month={selectedMonth}
                        year={selectedYear}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">
                            Attendance Summaries
                        </CardTitle>
                        {summaries.some(s => s.status === "Pending") && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllPending}
                            >
                                Select All Pending
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <ShadTable
                            columns={columns}
                            data={summaries}
                            keyExtractor={(row) => row._id}
                            emptyMessage="No summaries available for selected period"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MonthlyAttendanceSummaryPage;