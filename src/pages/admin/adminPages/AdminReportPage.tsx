import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { IPayroll } from "../../../utils/Interfaces/interfaces";
import { getPayrollsForReportService } from "../../../services/admin/adminService";
import { Header } from "../../../components/HeaderComponent";
import Sidebar from "../../../components/SidebarComponent";

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();

const PayrollReport: React.FC = () => {
    const [payrolls, setPayrolls] = useState<IPayroll[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const [summary, setSummary] = useState({
        totalEmployees: 0,
        totalBaseSalary: 0,
        totalTax: 0,
        totalPF: 0,
        totalLossOfPay: 0,
        totalDeductions: 0,
        totalNetSalary: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayrolls = async () => {
            setLoading(true);
            try {
                const res = await getPayrollsForReportService(selectedMonth, selectedYear);
                const data = res.data || [];

                setPayrolls(data);

                if (data.length > 0) {
                    const totals = data.reduce(
                        (acc, payroll) => {
                            acc.totalBaseSalary += payroll.baseSalary;
                            acc.totalTax += payroll.taxDeduction;
                            acc.totalPF += payroll.pfDeduction;
                            acc.totalLossOfPay += payroll.lossOfPayDeduction;
                            acc.totalDeductions += payroll.totalDeduction;
                            acc.totalNetSalary += payroll.netSalary;
                            return acc;
                        },
                        {
                            totalBaseSalary: 0,
                            totalTax: 0,
                            totalPF: 0,
                            totalLossOfPay: 0,
                            totalDeductions: 0,
                            totalNetSalary: 0,
                        }
                    );

                    setSummary({
                        ...totals,
                        totalEmployees: data.length,
                    });
                } else {
                    setSummary({
                        totalEmployees: 0,
                        totalBaseSalary: 0,
                        totalTax: 0,
                        totalPF: 0,
                        totalLossOfPay: 0,
                        totalDeductions: 0,
                        totalNetSalary: 0,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch payrolls", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayrolls();
    }, [selectedMonth, selectedYear]);

    const chartData = payrolls.map((payroll) => ({
        name: payroll.employeeId?.fullName || "Unknown",
        NetSalary: payroll.netSalary,
        Deductions: payroll.totalDeduction,
    }));

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar role="admin" />
            <div className="flex-1 p-6">
                <Header heading="Payroll Report" role="admin" />
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-2xl font-semibold tracking-tight">Payroll Report</h2>
                        <div className="flex gap-2">
                            <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Select Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthNames.map((name, index) => (
                                        <SelectItem key={index} value={String(index + 1)}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[currentYear, currentYear - 1].map((year) => (
                                        <SelectItem key={year} value={String(year)}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* If loading */}
                    {loading ? (
                        <div className="text-center text-muted-foreground">Loading...</div>
                    ) : payrolls.length === 0 ? (
                        <div className="text-center text-lg font-semibold text-muted-foreground py-10">
                            No payroll data found for {monthNames[selectedMonth - 1]} {selectedYear}.
                        </div>
                    ) : (
                        <>
                            {/* Summary Card */}
                            <Card className="shadow-lg">
                                <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Employees</p>
                                        <p className="text-lg font-semibold">{summary.totalEmployees}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Base Salary</p>
                                        <p className="text-lg font-semibold">₹{summary.totalBaseSalary.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Net Salary</p>
                                        <p className="text-lg font-semibold">₹{summary.totalNetSalary.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Deductions</p>
                                        <p className="text-lg font-semibold">₹{summary.totalDeductions.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Tax Deducted</p>
                                        <p className="text-lg font-semibold">₹{summary.totalTax.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">PF Deducted</p>
                                        <p className="text-lg font-semibold">₹{summary.totalPF.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Loss of Pay</p>
                                        <p className="text-lg font-semibold">₹{summary.totalLossOfPay.toFixed(2)}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Chart */}
                            <Card className="shadow-lg">
                                <CardContent className="p-4">
                                    <h3 className="text-lg font-medium mb-2">Salary Overview</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={chartData}>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="NetSalary" fill="#4ade80" />
                                            <Bar dataKey="Deductions" fill="#f87171" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Table */}
                            <Card className="shadow-lg">
                                <CardContent className="p-0">
                                    <ScrollArea className="w-full">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Month</TableHead>
                                                    <TableHead>Employee ID</TableHead>
                                                    <TableHead>Working Days</TableHead>
                                                    <TableHead>Present Days</TableHead>
                                                    <TableHead>Base Salary</TableHead>
                                                    <TableHead>Tax</TableHead>
                                                    <TableHead>PF</TableHead>
                                                    <TableHead>Loss of Pay</TableHead>
                                                    <TableHead>Total Deductions</TableHead>
                                                    <TableHead>Net Salary</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Generated At</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payrolls.map((payroll) => (
                                                    <TableRow key={payroll._id}>
                                                        <TableCell>{monthNames[payroll.month - 1]} {payroll.year}</TableCell>
                                                        <TableCell>{payroll.employeeId?._id || "N/A"}</TableCell>
                                                        <TableCell>{payroll.workingDays}</TableCell>
                                                        <TableCell>{payroll.presentDays}</TableCell>
                                                        <TableCell>₹{payroll.baseSalary.toFixed(2)}</TableCell>
                                                        <TableCell>₹{payroll.taxDeduction.toFixed(2)}</TableCell>
                                                        <TableCell>₹{payroll.pfDeduction.toFixed(2)}</TableCell>
                                                        <TableCell>₹{payroll.lossOfPayDeduction.toFixed(2)}</TableCell>
                                                        <TableCell>₹{payroll.totalDeduction.toFixed(2)}</TableCell>
                                                        <TableCell className="font-semibold">₹{payroll.netSalary.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={payroll.status === "Paid" ? "default" : "destructive"}>
                                                                {payroll.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {payroll.generatedAt
                                                                ? new Date(payroll.generatedAt).toLocaleDateString()
                                                                : "-"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PayrollReport;