import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useEffect, useState } from "react";
import {
  checkInService,
  checkOutService,
  getAllFaqService,
  getEmployeePayslipsService,
  getLeaveBalancesService,
  getMeetingsService,
  getTodayAttendance,
} from "../../../services/user/userService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import {
  IFaq,
  IMeetingWithDetails,
  IPayroll,
  LeaveBalance,
} from "../../../utils/Interfaces/interfaces";

export interface Attendance {
  _id?: string;
  employeeId: string;
  date: Date;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  status: "Present" | "Absent" | "Late" | "Leave" | "Pending";
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { employee } = useSelector((state: RootState) => state.employee);
  const [todayAttendance, setTodayAttendance] = useState<Attendance>();
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>();
  const [meetings, setMeetings] = useState<IMeetingWithDetails[]>();
  const [payrolls, setPayrolls] = useState<IPayroll[]>();
  const [faqs, setFaqs] = useState<IFaq[]>();

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await getTodayAttendance(
          employee ? employee?._id : ""
        );
        setTodayAttendance(response.todayAttendance);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAttendanceData();
  }, [employee, refreshKey]);

  useEffect(() => {
    const fetchLeaveBalances = async () => {
      try {
        const response = await getLeaveBalancesService(
          employee ? employee?._id : ""
        );
        setLeaveBalances(response.leaveBalances.leaveBalances);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLeaveBalances();
  }, [employee, refreshKey]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await getMeetingsService(
          employee ? employee?._id : ""
        );
        setMeetings(response.meetings);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMeetings();
  }, [employee, refreshKey]);

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const response = await getEmployeePayslipsService(
          employee ? employee?._id : ""
        );
        setPayrolls(response.payslip);
      } catch (error) {
        console.log(error);
      }
    };
    fetchPayrolls();
  }, [employee, refreshKey]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await getAllFaqService();
        setFaqs(response.faqs);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFaqs();
  }, [employee, refreshKey]);

  const handleCheckIn = async () => {
    try {
      const response = await checkInService(employee ? employee?._id : "");
      enqueueSnackbar(response.message, { variant: "success" });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      enqueueSnackbar(
        error instanceof AxiosError
          ? error.response?.data.message
          : "Error in checkin",
        { variant: "error" }
      );
    }
  };
  const handleCheckOut = async () => {
    try {
      const response = await checkOutService(employee ? employee?._id : "");
      enqueueSnackbar(response.message, { variant: "success" });
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.log(error);
      enqueueSnackbar(
        error instanceof AxiosError
          ? error.response?.data.message
          : "Error in checkout",
        { variant: "error" }
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar role="employee" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <Header role="employee" heading="Dashboard" />
        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {todayAttendance?.checkInTime && (
                <p className="text-sm text-gray-600 mb-2">
                  Clocked in at:{" "}
                  {new Date(todayAttendance.checkInTime).toLocaleTimeString()}
                </p>
              )}
              {todayAttendance?.checkOutTime && (
                <p className="text-sm text-gray-600 mb-2">
                  Clocked out at:{" "}
                  {new Date(todayAttendance.checkOutTime).toLocaleTimeString()}
                </p>
              )}
              {!todayAttendance?.checkInTime &&
                !todayAttendance?.checkOutTime && (
                  <>
                    <p className="text-sm text-red-500 mb-2">
                      Please check in before 10:00 AM
                    </p>
                    <Button
                      onClick={handleCheckIn}
                      className="w-full bg-blue-600 text-white"
                    >
                      Clock in
                    </Button>
                  </>
                )}

              {todayAttendance?.checkInTime &&
                !todayAttendance?.checkOutTime && (
                  <Button
                    onClick={handleCheckOut}
                    className="w-full bg-blue-600 text-white"
                  >
                    Clock out
                  </Button>
                )}

              {todayAttendance?.checkInTime &&
                todayAttendance?.checkOutTime && (
                  <Button
                    disabled
                    className="w-full bg-gray-400 text-white cursor-not-allowed"
                  >
                    You're done for today
                  </Button>
                )}
            </CardContent>
          </Card>

          {/* Leave Balance */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">
                Leave Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaveBalances && leaveBalances.length > 0 ? (
                <div className="mb-3">
                  {leaveBalances.slice(0, 2).map((leave) => (
                    <p
                      key={leave.leaveTypeId._id}
                      className="text-sm text-gray-700 flex justify-between mb-1"
                    >
                      <span>{leave.leaveTypeId.name}</span>
                      <span className="font-semibold">
                        Balance :{leave.availableDays}
                      </span>
                    </p>
                  ))}
                  {leaveBalances.length > 2 && (
                    <p className="text-xs text-gray-500 italic">+ more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">
                  No leave balances available
                </p>
              )}
              <Button
                onClick={() => {
                  navigate("/leave");
                }}
                variant="outline"
                className="w-full"
              >
                Apply for Leave
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              {meetings && meetings.length > 0 ? (
                <div className="mb-3">
                  {meetings.slice(0, 1).map((m) => (
                    <div
                      key={m._id}
                      className="text-sm text-gray-700 mb-2 border-b pb-1"
                    >
                      <p className="font-semibold">{m.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(m.date).toLocaleDateString()} • {m.startTime}
                      </p>
                      <p className="text-xs">
                        Status: <span className="font-medium">{m.status}</span>
                      </p>
                    </div>
                  ))}
                  {meetings.length > 2 && (
                    <p className="text-xs text-gray-500 italic">+ more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">
                  No meetings scheduled
                </p>
              )}
              <Button
                onClick={() => {
                  navigate("/meeting");
                }}
                variant="outline"
                className="w-full"
              >
                See Meetings
              </Button>
            </CardContent>
          </Card>

          {/* Payroll */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              {payrolls && payrolls.length > 0 ? (
                <div className="mb-3">
                  {payrolls.slice(0, 1).map((p) => {
                    const monthName = new Date(
                      p.year,
                      p.month - 1
                    ).toLocaleString("default", { month: "long" });
                    return (
                      <div
                        key={p._id}
                        className="text-sm text-gray-700 mb-2 border-b pb-1"
                      >
                        <p className="font-semibold">
                          {monthName} {p.year}
                        </p>
                        <p className="text-xs">
                          Net Salary:{" "}
                          <span className="font-medium">
                            ₹{p.netSalary.toLocaleString()}
                          </span>
                        </p>
                        <p className="text-xs">
                          Status:{" "}
                          <span className="font-medium">{p.status}</span>
                        </p>
                      </div>
                    );
                  })}
                  {payrolls.length > 2 && (
                    <p className="text-xs text-gray-500 italic">+ more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">No payroll records</p>
              )}
              <Button
                onClick={() => {
                  navigate("/payslip");
                }}
                variant="outline"
                className="w-full"
              >
                View Details
              </Button>
            </CardContent>
          </Card>

          {/* Help Desk */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle className="text-sm text-gray-600">FAQs</CardTitle>
            </CardHeader>
            <CardContent>
              {faqs && faqs.length > 0 ? (
                <div className="mb-3">
                  {faqs.slice(0, 1).map((faq) => (
                    <div
                      key={faq._id}
                      className="text-sm text-gray-700 mb-2 border-b pb-1"
                    >
                      <p className="font-semibold">{faq.topic}</p>
                      {faq.questions && faq.questions.length > 0 ? (
                        <p className="text-xs text-gray-500 truncate">
                          Q: {faq.questions[0].question}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500 italic">
                          No questions yet
                        </p>
                      )}
                    </div>
                  ))}
                  {faqs.length > 1 && (
                    <p className="text-xs text-gray-500 italic">+ more</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-3">No FAQs available</p>
              )}
              <Button
                onClick={() => {
                  navigate("/help-desk");
                }}
                variant="outline"
                className="w-full"
              >
                See More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
