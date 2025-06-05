import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "../../../components/ui/card";
import { downloadPayslipService, getEmployeePayslipsService } from "../../../services/user/userService";
import { Badge } from "../../../components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "../../../components/ui/skeleton";
import { Header } from "../../../components/HeaderComponent";
import Sidebar from "../../../components/SidebarComponent";
import { IPayslip } from "../../../utils/Interfaces/interfaces";

const PayslipPage = () => {
  const [payslips, setPayslips] = useState<IPayslip[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem("employeeSession") || "{}");

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await getEmployeePayslipsService(currentUser._id);
        if (response && Array.isArray(response.payslip)) {
          setPayslips(response.payslip);
        } else {
          setPayslips([]);
        }
      } catch (error) {
        console.error("Error fetching payslips:", error);
        setPayslips([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [currentUser._id]);

  const handleDownload = async (month: number, year: number) => {
    try {
      const blob = await downloadPayslipService(currentUser._id, month, year);
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip_${month}_${year}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download payslip");
    }
  };

  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("default", { month: "long" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar role="employee" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-2">
          <Header heading="My Payslip" role="employee" />
        </div>
        <div className="px-6 pb-6 flex-1 overflow-auto">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Payslip History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : payslips.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No payslips available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-md">
                    <thead className="bg-gray-100 text-gray-700 text-sm">
                      <tr>
                        <th className="p-3 text-left">Month</th>
                        <th className="p-3 text-left">Working Days</th>
                        <th className="p-3 text-left">Present Days</th>
                        <th className="p-3 text-left">Base Salary</th>
                        <th className="p-3 text-left">Net Salary</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Generated On</th>
                        <th className="p-3 text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-800">
                      {payslips.map((p) => (
                        <tr key={p._id} className="border-t">
                          <td className="p-3">
                            {getMonthName(p.month)} {p.year}
                          </td>
                          <td className="p-3">{p.workingDays}</td>
                          <td className="p-3">{p.presentDays}</td>
                          <td className="p-3">{formatCurrency(p.baseSalary)}</td>
                          <td className="p-3">{formatCurrency(p.netSalary)}</td>
                          <td className="p-3">
                            <Badge variant={p.status === "Paid" ? "default" : "secondary"}>
                              {p.status}
                            </Badge>
                          </td>
                          <td className="p-3">
                            {format(new Date(p.generatedAt), "dd MMM yyyy")}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleDownload(p.month, p.year)}
                              className="text-blue-600 hover:underline text-xs"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PayslipPage;
