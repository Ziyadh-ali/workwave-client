import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { CheckCircle, X } from "lucide-react";
import { useSnackbar } from "notistack";
import ShadTable from "../../../components/TableComponent";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import { useLocation } from "react-router-dom";
import { IPayroll } from "../../../utils/Interfaces/interfaces";
import {
    getPayrollRecordsService,
    updatePayrollStatusService,
    generatePayrollService,
    generateBulkPayrollService
} from "../../../services/admin/adminService";
import GeneratePayrollModal from "../modals/GeneratePayrollModal";
import { AxiosError } from "axios";

const PayrollManagementPage = () => {
    const location = useLocation();
    const { enqueueSnackbar } = useSnackbar();
    const [payrolls, setPayrolls] = useState<IPayroll[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [taxPercentage, setTaxPercentage] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);

    // State for modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState<IPayroll | null>(null);

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const data = await getPayrollRecordsService(selectedMonth, selectedYear);
                setPayrolls(data.data || []);
            } catch (error) {
                console.log(error);
                enqueueSnackbar("Failed to fetch payroll records", { variant: "error" });
            }
        };
        fetchPayrolls();

        //eslint-disable-next-line 
    }, [selectedMonth, selectedYear, location]);

    const handleMarkAsPaid = async (payrollId: string) => {
        try {
            const updatedPayroll = await updatePayrollStatusService(payrollId);
            setPayrolls(prev =>
                prev.map(payroll =>
                    payroll._id === payrollId ? updatedPayroll.data : payroll
                )
            );
            enqueueSnackbar("Payroll marked as paid", { variant: "success" });
        } catch (error) {
            console.log(error);
            enqueueSnackbar("Failed to update payroll status", { variant: "error" });
        }
    };

    const handleGeneratePayroll = async (employeeId?: string) => {
        setIsGenerating(true);
        try {
            let result;
            if (employeeId) {
                result = await generatePayrollService(selectedMonth, selectedYear, taxPercentage, employeeId);
            } else {
                result = await generateBulkPayrollService(selectedMonth, selectedYear, taxPercentage);
            }
            setPayrolls(prev => [...prev, ...(Array.isArray(result.data) ? result.data : [result.data])]);
            enqueueSnackbar("Payroll generated successfully", { variant: "success" });
        } catch (error) {
            console.log(error);
            enqueueSnackbar(
                (error instanceof AxiosError) ? error.response?.data.message : "Failed to generate payroll",
                { variant: "error" }
            );
        } finally {
            setIsGenerating(false);
        }
    };

    // Modal open handler
    const openDetailsModal = (payroll: IPayroll) => {
        setSelectedPayroll(payroll);
        setShowDetailsModal(true);
    };

    // Modal close handler
    const closeDetailsModal = () => {
        setSelectedPayroll(null);
        setShowDetailsModal(false);
    };

    // Columns shown in table - fewer details
    const columns = [
        {
            header: "Employee",
            accessor: (row: IPayroll) => row.employeeId.fullName,
        },
        {
            header: "Role",
            accessor: (row: IPayroll) => row.employeeId.role,
        },
        {
            header: "Month/Year",
            accessor: (row: IPayroll) =>
                `${new Date(row.year, row.month - 1).toLocaleString('default', { month: 'long' })} ${row.year}`,
        },
        {
            header: "Net Salary",
            accessor: (row: IPayroll) => `₹${row.netSalary.toLocaleString()}`,
        },
        {
            header: "Status",
            accessor: (row: IPayroll) => (
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    }`}>
                    {row.status}
                </span>
            ),
        },
        {
            header: "Actions",
            accessor: (row: IPayroll) => (
                <div className="flex space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailsModal(row)}
                    >
                        See Details
                    </Button>

                    {row.status === "Pending" ? (
                        <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(row._id)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <CheckCircle size={16} className="mr-1" /> Mark Paid
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled>
                            Paid
                        </Button>
                    )}
                </div>
            ),
        }
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar role="admin" />
            <div className="flex-1 p-6">
                <Header heading="Payroll Management" role="admin" />
                <div className="flex justify-between items-center mt-6 mb-4 flex-wrap gap-4">
                    <div className="flex space-x-4 items-center">
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
                        <select
                            value={taxPercentage}
                            onChange={(e) => setTaxPercentage(Number(e.target.value))}
                            className="border rounded px-3 py-2"
                        >
                            {Array.from({ length: 101 }, (_, i) => (
                                <option key={i} value={i}>{i}% Tax</option>
                            ))}
                        </select>
                    </div>
                    <GeneratePayrollModal
                        onGenerate={handleGeneratePayroll}
                        isGenerating={isGenerating}
                    />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                            Payroll Records
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ShadTable
                            columns={columns}
                            data={payrolls}
                            keyExtractor={(row) => row._id}
                            emptyMessage="No payroll records available for selected period"
                        />
                    </CardContent>
                </Card>
            </div>
            {/* Details Modal */}
            {showDetailsModal && selectedPayroll && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
                    onClick={closeDetailsModal}
                >
                    <div
                        className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closeDetailsModal}
                            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-semibold mb-4">Payroll Details</h2>
                        <div className="space-y-2 text-sm">
                            <div><strong>Employee:</strong> {selectedPayroll.employeeId.fullName}</div>
                            <div><strong>Role:</strong> {selectedPayroll.employeeId.role}</div>
                            <div><strong>Month/Year:</strong> {new Date(selectedPayroll.year, selectedPayroll.month - 1).toLocaleString('default', { month: 'long' })} {selectedPayroll.year}</div>
                            <div><strong>Working Days:</strong> {selectedPayroll.workingDays}</div>
                            <div><strong>Present Days:</strong> {selectedPayroll.presentDays}</div>
                            <div><strong>Base Salary:</strong> ₹{selectedPayroll.baseSalary.toLocaleString()}</div>
                            <div><strong>Tax Deduction:</strong> ₹{selectedPayroll.taxDeduction.toLocaleString()}</div>
                            <div><strong>PF Deduction:</strong> ₹{selectedPayroll.pfDeduction.toLocaleString()}</div>
                            <div><strong>Loss of Pay Deduction:</strong> ₹{selectedPayroll.lossOfPayDeduction.toLocaleString()}</div>
                            <div><strong>Total Deductions:</strong> ₹{selectedPayroll.totalDeduction.toLocaleString()}</div>
                            <div><strong>Net Salary:</strong> ₹{selectedPayroll.netSalary.toLocaleString()}</div>
                            <div><strong>Status:</strong> {selectedPayroll.status}</div>
                            <div><strong>Generated At:</strong> {selectedPayroll.generatedAt ? new Date(selectedPayroll.generatedAt).toLocaleDateString() : "-"}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollManagementPage;
