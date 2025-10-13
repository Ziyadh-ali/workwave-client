import { NavLink } from "react-router-dom";
import {
  Home,
  Clock,
  Calendar,
  DollarSign,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const Sidebar = ({ role }: { role: "admin" | "employee"}) => {

  const {employee} = useSelector((state : RootState) => state.employee)
  return (
    <div className="w-64 bg-white shadow-md min-h-screen">
      <div className="p-4">
        {/* Logo Section */}
        <div className="flex items-center space-x-2 mb-6">
          <img
            src="https://res.cloudinary.com/dr0iflvfs/image/upload/v1741307136/logo-transparent_gra32p.png"
            alt="HR Portal Logo"
            className="h-12"
          />
          <h2 className="text-lg font-semibold text-gray-800">Work Wave</h2>
        </div>

        {/* Employee Sidebar */}
        {role === "employee" && employee?.role !== "hr" &&(
          <nav className="space-y-2">
            <SidebarLink to="/dashboard" icon={<Home />} label="Dashboard" />
            <SidebarLink to="/attendance" icon={<Clock />} label="Attendance" />
            <SidebarLink to="/leave" icon={<Calendar />} label="Leave" />
            <SidebarLink to="/payslip" icon={<DollarSign />} label="Payslip" />
            <SidebarLink to="/help-desk" icon={<HelpCircle />} label="Help Desk" />
            <SidebarLink to="/meeting" icon={<Calendar />} label="Meeting" />
          </nav>
        )}

        {/* Admin Sidebar */}
        {role === "admin" && (
          <nav className="space-y-2">
            {[
              { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
              { path: "/admin/users", label: "User Management", icon: "👥" },
              { path: "/admin/leave/requests", label: "Leave Management", icon: "📅" },
              { path: "/admin/leave/types", label: "Leave Type Management", icon: "📅" },
              { path: "/admin/payroll", label: "Payroll", icon: "💰" },
              { path: "/admin/attendance", label: "Attendance", icon: "⏰" },
              { path: "/admin/attendance/summary", label: "Monthly Summary", icon: "📊" },
              { path: "/admin/reports", label: "Reports", icon: "📈" },
              { path: "/admin/help", label: "Help Centre", icon: "❓" },
            ].map(({ path, label, icon }) => (
              <SidebarLink key={path} to={path} icon={<span>{icon}</span>} label={label} />
            ))}
          </nav>
        )}

        {/* HR Sidebar */}
        {employee?.role === "hr" && (
          <nav className="space-y-2">
            <SidebarLink to="/dashboard" icon={<Home />} label="Dashboard" />
            <SidebarLink to="/attendance" icon={<Clock />} label="Attendance" />
            <SidebarLink to="/leave" icon={<Calendar />} label="Leave" />
            <SidebarLink to="/meeting" icon={<Calendar />} label="Meeting" />
            <SidebarLink
              to="/developers/leave"
              icon={<ClipboardList />}
              label="Leave Requests"
            />
            <SidebarLink to="/payslip" icon={<DollarSign />} label="Payroll" />
            <SidebarLink to="/help-desk" icon={<HelpCircle />} label="Help Desk" />
          </nav>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

/* --------------------------------------------- */
/* Reusable NavLink Component */
const SidebarLink = ({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-2 p-2 rounded-md transition font-medium ${
        isActive
          ? "bg-blue-100 text-blue-600"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
      }`
    }
  >
    <span className="w-5 h-5">{icon}</span>
    <span>{label}</span>
  </NavLink>
);
