import { Routes, Route } from "react-router-dom"
import AdminLogin from "./pages/admin/adminPages/AdminLogin"
import AdminDashBoard from "./pages/admin/adminPages/AdminDashBoard"
import AdminProfile from "./pages/admin/adminPages/AdminProfile"
import UserManagement from "./pages/admin/adminPages/UserManagement"
import { SnackbarProvider } from "notistack";
import { AdminProtect, EmployeeProtect } from "./protected/ProtectedRoute"
import { AdminPublic, EmployeePublic } from "./protected/PublicRoutes"
import UserDetails from "./pages/admin/adminPages/UserDetails"
import EmployeeLogin from "./pages/employee/employeePages/employeeLogin"
import EmployeeDashBoard from "./pages/employee/employeePages/employeeDashboard"
import EditProfilePage from "./pages/employee/employeePages/employeeEditProfile"
import EmployeeProfilePage from "./pages/employee/employeePages/employeeProfile"
import AdminEditUserPage from "./pages/admin/adminPages/AdminUserEdit"
import LeavePage from "./pages/employee/employeePages/employeeLeavePage"
import LeaveTypeManagementPage from "./pages/admin/adminPages/LeaveTypeManagement"
import LeaveManagementPage from "./pages/admin/adminPages/LeaveManagement"
import { ResetPasswordPage } from "./pages/employee/employeePages/resetPasswordPage"
import AttendancePage from "./pages/employee/employeePages/AttendancePage"
import MeetingPage from "./pages/employee/employeePages/MeetingPage"
import ChatPage from "./pages/employee/employeePages/ChatPage"
import AdminHelpCenterPage from "./pages/admin/adminPages/AdminHelpCenter"
import EmployeeHelpCenterPage from "./pages/employee/employeePages/HelpCentre"
import ManagerDeveloperManagement from "./pages/employee/employeePages/ManagerUserManagement"
import ManagerLeaveManagementPage from "./pages/employee/employeePages/ManagerLeaveRequest"
import AdminAttendancePage from "./pages/admin/adminPages/AdminAttendncePage"
import MonthlyAttendanceSummaryPage from "./pages/admin/adminPages/MonthlyAttendanceSummary"
import PayrollManagementPage from "./pages/admin/adminPages/PayrollManagement"
import PayslipPage from "./pages/employee/employeePages/PayslipPage"
import { SocketProvider } from "./context/SocketContext";
import { useSelector } from "react-redux"
import { RootState } from "./store/store"

function App() {
  const { employee } = useSelector((state: RootState) => state.employee);
  const {admin} = useSelector((state : RootState)=>state.admin)
  return (
    <>
    <SocketProvider userId={employee?._id || admin?._id || ""}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Routes>
          <Route path="/">

            <Route element={<EmployeePublic />}>

              <Route path="login" element={<EmployeeLogin />} />

              <Route path="/reset-password" element={<ResetPasswordPage />} />

            </Route>

            <Route element={<EmployeeProtect />}>

              <Route path="dashboard" element={<EmployeeDashBoard />} />

              <Route path="profile/:id" element={<EditProfilePage />} />

              <Route path="profile" element={<EmployeeProfilePage />} />

              <Route path="leave" element={<LeavePage />} />

              <Route path="attendance" element={<AttendancePage />} />

              <Route path="meeting" element={<MeetingPage />} />


              <Route path="messages" element={<ChatPage />} />

              <Route path="help-desk" element={<EmployeeHelpCenterPage />} />

              {/* <Route path="project" element={<ProjectManagementPage />} /> */}

              <Route path="developers/developers-list" element={<ManagerDeveloperManagement />} />

              <Route path="developers/leave" element={<ManagerLeaveManagementPage />} />

              <Route path="payslip" element={<PayslipPage />} />

            </Route>

          </Route>

          <Route path="/admin">

            <Route element={<AdminPublic />}>

              <Route path="login" element={<AdminLogin />} />

            </Route>

            <Route element={<AdminProtect />}>

              <Route path="dashboard" element={<AdminDashBoard />} />

              <Route path="profile" element={<AdminProfile />} />

              <Route path="users" element={<UserManagement />} />

              <Route path="users/:userId" element={<UserDetails />} />

              <Route path="users/:userId/edit" element={<AdminEditUserPage />} />

              <Route path="leave/types" element={<LeaveTypeManagementPage />} />

              <Route path="leave/requests" element={<LeaveManagementPage />} />

              <Route path="help" element={<AdminHelpCenterPage />} />

              <Route path="attendance" element={<AdminAttendancePage />} />

              <Route path="attendance/summary" element={<MonthlyAttendanceSummaryPage />} />

              <Route path="payroll" element={<PayrollManagementPage />} />

            </Route>

          </Route>

        </Routes>

      </SnackbarProvider>
      </SocketProvider>
    </>
  )
}

export default App
