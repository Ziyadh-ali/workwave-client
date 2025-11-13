import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addRegularizeRequest,
  fetchAttendanceDataService,
  fetchHolidays,
} from "../../../services/user/userService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import RegularizationModal from "../modals/RegularizationModal";
import { useLocation, useNavigate } from "react-router-dom";
import { AttendanceDay } from "../../../utils/Interfaces/interfaces";

const AttendancePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null);
  const [holidays, setHolidays] = useState<{ date: string; name: string }[]>([]);
  const { employee } = useSelector((state: RootState) => state.employee);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceDay[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const attendanceResponse = await fetchAttendanceDataService(
          employee?._id || "",
          currentDate.getFullYear(),
          currentDate.getMonth() + 1
        );
        attendanceResponse.attendancesOfMonth = attendanceResponse.attendancesOfMonth.map((attendance: AttendanceDay) => ({
          _id: attendance._id,
          date: attendance.date,
          status: attendance.status,
          isRegularized: attendance.isRegularized,
          isRegularizable: attendance.isRegularizable || false,
        }));

        setAttendanceData(
          Array.isArray(attendanceResponse.attendancesOfMonth)
            ? attendanceResponse.attendancesOfMonth
            : []
        );

        const holidaysResponse = await fetchHolidays(
          currentDate.getFullYear(),
          "IN"
        );
        setHolidays(holidaysResponse);
      } catch (error) {
        console.error("Error fetching data", error);
        setAttendanceData([]);
        setHolidays([]);
      }
    };
    fetchData();
  }, [currentDate, employee?._id, location]);

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDayClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

    const isTooOld =
      (today.getTime() - clickedDate.getTime()) / (1000 * 60 * 60 * 24) > 30;
    if (isTooOld) return;

    const isFuture = clickedDate > today;
    if (isFuture) return;

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = holidays.some(
      (holiday) => new Date(holiday.date).toDateString() === date.toDateString()
    );

    if (!isWeekend && !isHoliday) {
      const matchingAttendance = attendanceData.find((d) => {
        const attendanceDate = new Date(d.date);
        return (
          attendanceDate.getDate() === date.getDate() &&
          attendanceDate.getMonth() === date.getMonth() &&
          attendanceDate.getFullYear() === date.getFullYear()
        );
      });
      if (matchingAttendance?.isRegularized) return;
      if (matchingAttendance?.isRegularizable) return;

      setSelectedDate(date);
      setSelectedAttendanceId(matchingAttendance?._id || null);
      setShowModal(true);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isToday =
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();

      const attendance = attendanceData.find((d) => {
        const attendanceDate = new Date(d.date);
        return (
          attendanceDate.getDate() === day &&
          attendanceDate.getMonth() === month &&
          attendanceDate.getFullYear() === year
        );
      });

      const holiday = holidays.find(
        (holiday) =>
          new Date(holiday.date).getDate() === day &&
          new Date(holiday.date).getMonth() === month
      );

      let bgColor = "bg-white";
      if (isWeekend) bgColor = "bg-yellow-50";
      if (holiday) bgColor = "bg-blue-50";
      if (attendance) {
        if (attendance.isRegularized) bgColor = "bg-purple-300";
        else if (attendance.isRegularizable) bgColor = "bg-violet-300";
        else if (attendance.status === "Present") bgColor = "bg-green-100";
        else if (attendance.status === "Absent") bgColor = "bg-red-100";
        else if (attendance.status === "Pending") bgColor = "bg-gray-100";
      }

      const todayHighlight = isToday ? "ring-2 ring-blue-400 shadow-md" : "";

      days.push(
        <div
          key={day}
          className={`h-24 w-full flex flex-col justify-between items-center p-2 border rounded-lg ${bgColor} ${todayHighlight} cursor-pointer hover:scale-105 hover:shadow-md transition-all duration-200`}
          onClick={() => handleDayClick(date)}
        >
          <div className="text-base font-semibold text-gray-700">{day}</div>

          <div className="flex flex-col items-center space-y-0.5">
            {attendance?.isRegularizable && !attendance?.isRegularized && (
              <>
                <div className="text-xs text-violet-700 font-medium">Requested</div>
              </>
            )}
            {attendance?.isRegularized && (
              <>
                <div className="text-xs text-purple-700 font-medium">Regularized</div>
                <div className="text-xs text-gray-700 font-medium">
                  {attendance.status}
                </div>
              </>
            )}

            {!attendance?.isRegularized && !attendance?.isRegularizable && attendance?.status && (
              <div
                className={`text-xs font-medium ${attendance.status === "Present"
                  ? "text-green-700"
                  : attendance.status === "Absent"
                    ? "text-red-700"
                    : "text-gray-700"
                  }`}
              >
                {attendance.status}
              </div>
            )}
          </div>

          {holiday && (
            <div
              className="text-[10px] text-blue-600 font-medium truncate w-full text-center"
              title={holiday.name}
            >
              {holiday.name}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="employee" />

      <div className="flex-1 p-6">
        <Header heading="Attendance Calendar" role="employee" />

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={() => changeMonth("prev")}>
                  <ChevronLeft size={20} />
                </Button>
                <Button variant="outline" size="icon" onClick={() => changeMonth("next")}>
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-700">
              {[
                { color: "bg-green-200", label: "Present" },
                { color: "bg-red-200", label: "Absent" },
                { color: "bg-gray-200", label: "Pending" },
                { color: "bg-yellow-100", label: "Weekend" },
                { color: "bg-blue-100", label: "Holiday" },
                { color: "bg-purple-200", label: "Regularized" },
              ].map((item) => (
                <div key={item.label} className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 font-semibold text-gray-600">
                  {day}
                </div>
              ))}
              {renderCalendar()}
            </div>
          </CardContent>
        </Card>
      </div>

      <RegularizationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        selectedDate={selectedDate}
        onSubmit={async (reason) => {
          try {
            await addRegularizeRequest(selectedAttendanceId!, reason);
            navigate("/attendance");
            setShowModal(false);
          } catch (error) {
            console.error("Failed to request regularization", error);
          }
        }}
      />
    </div>
  );
};

export default AttendancePage;
