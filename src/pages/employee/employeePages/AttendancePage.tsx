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

// Interface for attendance data
interface AttendanceDay {
  _id: string;
  date: string;
  status: "Present" | "Absent" | "Late" | "Leave" | "Pending";
  isRegularized?: boolean;
}

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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const changeMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
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
      if (isWeekend) bgColor = "bg-yellow-100";
      if (holiday) bgColor = "bg-blue-100";
      if (attendance) {
        if (attendance.isRegularized) bgColor = "bg-purple-300";
        else if (attendance.status === "Present") bgColor = "bg-green-300";
        else if (attendance.status === "Absent") bgColor = "bg-red-300";
        else if (attendance.status === "Pending") bgColor = "bg-gray-300";
      }

      const todayHighlight = isToday ? "ring-2 ring-blue-300 shadow-md" : "";

      days.push(
        <div
          key={day}
          className={`p-2 text-center ${bgColor} border border-gray-200 rounded-md ${todayHighlight} cursor-pointer`}
          onClick={() => handleDayClick(date)}
        >
          <div>{day}</div>
          {attendance?.isRegularized && (
            <div className="text-xs text-purple-700 font-medium">Regularized</div>
          )}
          {holiday && <div className="text-xs text-blue-500">{holiday.name}</div>}
        </div>
      );
    }

    return days;
  };

  const handleDayClick = (date: Date) => {

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);

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

      setSelectedDate(date);
      setSelectedAttendanceId(matchingAttendance?._id || null);
      setShowModal(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="employee" />

      <div className="flex-1 p-6">
        <Header heading="Attendance Details" role="employee" />

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-800">
                {currentDate.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeMonth("prev")}
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => changeMonth("next")}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>

            <div className="flex space-x-4 mt-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-200 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Absent</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-100 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-100 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Weekend</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-200 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Holiday</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-300 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Regularized</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center font-semibold text-gray-600">
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
