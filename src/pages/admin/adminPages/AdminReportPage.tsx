import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { IPayroll } from "../../../utils/Interfaces/interfaces";

const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();

const PayrollReport: React.FC = () => {
    const [payrolls, setPayrolls] = useState<IPayroll[] | []>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    useEffect(() => {
        const fetchPayrolls = async () => {
            try {
                const res = await axios.get(`/api/payroll?month=${selectedMonth}&year=${selectedYear}`);
                setPayrolls(res.data);
            } catch (error) {
                console.error("Failed to fetch payrolls", error);
            }
        };

        fetchPayrolls();
    }, [selectedMonth, selectedYear]);

    const chartData = payrolls.map((payroll) => ({
        name: payroll.employeeId,
        NetSalary: payroll.netSalary,
        Deductions: payroll.totalDeduction,
    }));

    return (
        <div className="p-6 space-y-4">
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
                                        <TableCell>{payroll.employeeId._id}</TableCell>
                                        <TableCell>{payroll.workingDays}</TableCell>
                                        <TableCell>{payroll.presentDays}</TableCell>
                                        <TableCell>${payroll.baseSalary.toFixed(2)}</TableCell>
                                        <TableCell>${payroll.taxDeduction.toFixed(2)}</TableCell>
                                        <TableCell>${payroll.pfDeduction.toFixed(2)}</TableCell>
                                        <TableCell>${payroll.lossOfPayDeduction.toFixed(2)}</TableCell>
                                        <TableCell>${payroll.totalDeduction.toFixed(2)}</TableCell>
                                        <TableCell className="font-semibold">${payroll.netSalary.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant={payroll.status === "Paid" ? "default" : "destructive"}>
                                                {payroll.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{payroll.generatedAt ? new Date(payroll.generatedAt).toLocaleDateString() : "-"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
};

export default PayrollReport;
