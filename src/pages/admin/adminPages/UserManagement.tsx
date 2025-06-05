import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import AddUserModal from "../modals/AddUserModal";
import { enqueueSnackbar } from "notistack";
import { addUser, deleteUser, getUsers } from "../../../services/admin/adminService";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ShadTable from "../../../components/TableComponent";
import { useConfirmModal } from "../../../components/useConfirm";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import { Employee } from "../../../utils/Interfaces/interfaces";

interface EmployeeFilter {
  role?: string;
  status?: string;
  department?: string;
  [key: string]: string | undefined;
}


function UserManagement() {
  const location = useLocation()
  const navigate = useNavigate();
  const [users, setUsers] = useState<Employee[]>([]);
  const {confirm , ConfirmModalComponent} = useConfirmModal()
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(2);
  const [total, setTotal] = useState<number>(0);
  const [active, setActive] = useState<number>(0);
  const [inactive, setInactive] = useState<number>(0);
  const [filter, setFilter] = useState<EmployeeFilter>({
    role: "all",
    status: "all",
    department: "all",
  });
  const [loading, setLoading] = useState<boolean>(false);

  const fetchUsers = async () => {
    setLoading(true);
    console.log(loading);

    try {
      const response = await getUsers(filter, page, pageSize);
      console.log(response.data)
      setUsers(response.data);
      setTotal(response.total);
      setActive(response.active);
      setInactive(response.inactive);
      setPageSize(2)
    } catch (err) {
      console.log(err);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // useEffect for fetching users -----------------------------------------------------------------------------------------

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filter, location]);

  //TODO  Function for handling adding user- ------------------------------------------------------------------------------------

  const handleAddUser = async (userData: {
    fullName: string;
    email: string;
    role: string;
    department: string;
    password: string;
    salary: number;
  }) => {
    try {
      const data = await addUser(userData);
      enqueueSnackbar(data.message, { variant: "success" });
      fetchUsers()
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      if (error instanceof AxiosError) {
        enqueueSnackbar(error.response?.data?.message || "An unexpected error occurred", { variant: "error" });
      } else {
        enqueueSnackbar("An unexpected error occurred", { variant: "error" });
      }
    }
  };


  //todo Function for handling user deletion --------------------------------------------------------------------------------


  const handleDelete = (userId: string) => {
    confirm({
      title : "Delete Employee?",
      message : "Are you sure you want to delete this Employee?",
      onConfirm : async () => {
        try {
          const response = await deleteUser(userId);
          enqueueSnackbar(response.message, { variant: "success" });
          navigate("/admin/users")
        } catch (error) {
          console.log(error)
          enqueueSnackbar("Failed to delete user.", { variant: "error" });
        }
      }
    });
  };



  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / pageSize)) {
      setPage(newPage);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter((prevFilter: EmployeeFilter) => ({
      ...prevFilter,
      [key]: value === "all" ? undefined : value,
    }));
    setPage(1);
  };

  const employeeColumns = [
    {
      header: "Name",
      accessor: (row: Employee) => row.fullName,
    },
    {
      header: "Role",
      accessor: (row: Employee) => row.role,
    },
    {
      header: "Status",
      accessor: (row: Employee) => (
        <span
          className={`${row.status === "active"
            ? "text-green-600 bg-green-100"
            : "text-red-600 bg-red-100"
            } px-2 py-1 rounded-full text-xs`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: "Email",
      accessor: (row: Employee) => row.email,
    },
    {
      header: "Actions",
      accessor: (row: Employee) =>
        <div className="flex space-x-2">
          <button onClick={() => navigate(`/admin/users/${row._id}`)} className="text-blue-600 hover:underline cursor-pointer">👁️</button>
          <button onClick={() => handleDelete(row._id)} className="text-red-600 hover:underline cursor-pointer">🗑️</button>  
        </div>,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role="admin" />
      <div className="flex-1 p-6">
        <Header heading="User management" role="admin" />
        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Manage all users in the system
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-gray-800">{total}</p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-gray-800">{active}</p>
                  <p className="text-sm text-gray-600">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-gray-800">{inactive}</p>
                  <p className="text-sm text-gray-600">Inactive Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-4">
                  <p className="text-2xl font-bold text-gray-800"></p>
                  <p className="text-sm text-gray-600">New Users</p>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-between items-center mb-4">
              <Input
                type="text"
                placeholder="Search users..."
                className="w-full md:w-1/3"
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
              <div className="flex space-x-4">
                <Select onValueChange={(value) => handleFilterChange("role", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="hr">HR Manager</SelectItem>
                    <SelectItem value="project">Project Manager</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => handleFilterChange("department", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <AddUserModal onAddUser={handleAddUser} />
            </div>
            <div className="overflow-x-auto">
            <ShadTable
                columns={employeeColumns}
                data={users}
                keyExtractor={(row) => row._id}
                emptyMessage="No employees"
              />
            </div>
            <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
              <span>
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center">
                  {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-3 py-1 ${page === i + 1 ? "bg-blue-600 text-white" : "bg-white"
                        } rounded`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page * pageSize >= total}
                  className="bg-blue-600 text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ConfirmModalComponent />
    </div>
  );
}

export default UserManagement;