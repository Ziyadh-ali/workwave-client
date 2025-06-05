import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  addLeaveRequestService,
  cancelLeaveRequest,
  deleteLeaveRequest,
  getLeaveBalancesService,
  getLeaveRequestsService,
} from "../../../services/user/userService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import AddLeaveRequestModal, {
  LeaveRequest,
} from "../modals/AddLeaveRequestModal";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import ShadTable from "../../../components/TableComponent";
import { useConfirmModal } from "../../../components/useConfirm";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import { useLocation, useNavigate } from "react-router-dom";
import { useSocket } from "../../../context/SocketContext";

// User interface
export interface User {
  _id?: string;
  fullName: string;
  email: string;
  department: string;
  role: "hr" | "developer" | "projectManager";
  status: string;
  password: string;
  phone?: number;
  address?: string;
  joinedAt?: Date;
  manager?: string;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for leave data
interface Leave {
  _id: string;
  leaveTypeId: {
    name: string;
    _id: string;
  };
  startDate: string;
  endDate: string;
  reason: string;
  status: "Approved" | "Rejected" | "Pending" | "Cancelled";
  rejectionReason: string;
}

interface LeaveTypes {
  userId: string;
  leaveBalances: [
    {
      availableDays: number;
      leaveTypeId: string;
      leaveTypeName: string;
      totalDays: number;
      usedDays: number;
    }
  ];
}

const LeavePage = () => {
  const naviagte = useNavigate();
  const location = useLocation();
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypes>();
  const { confirm, ConfirmModalComponent } = useConfirmModal();
  const [leaveHistory, setLeaveHistory] = useState<Leave[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const { employee } = useSelector((state: RootState) => state.employee);
  const {sendLeaveRequestApplied} = useSocket() 

  useEffect(() => {
    const fethchLeaveBalance = async () => {
      if (employee?._id) {
        const response = await getLeaveBalancesService(employee._id);
        setLeaveTypes(response.leaveBalances);
      }
    };
    const fetchLeaveHistory = async () => {
      if (employee?._id) {
        const response = await getLeaveRequestsService(employee._id);
        setLeaveHistory(response.leaveRequests);
      }
    };
    fethchLeaveBalance();
    fetchLeaveHistory();
  }, [employee?._id, location]);

  const handleLeaveAdd = async (data: LeaveRequest) => {
    const newData = { ...data, employeeId: employee?._id };
    const response = await addLeaveRequestService(newData);
    console.log(response)
    sendLeaveRequestApplied({
      employeeId : response.leaveRequest.employeeId._id,
      employeeName : employee?.fullName ? employee?.fullName : "",
      leaveId : response.leaveRequest._id,
      managerId : response.leaveRequest.assignedManager || "67d3fb40609f7c890f6eb579",
    })
    setOpenModal(false);

    const updated = await getLeaveRequestsService(employee!._id);
    setLeaveHistory(updated.leaveRequests);
  };

  const handleDelete = async (leaveRequestId: string) => {
    confirm({
      title: "Delete Leave Request?",
      message: "Are you sure you want to delete this Leave Request?",
      onConfirm: async () => {
        try {
          const response = await deleteLeaveRequest(leaveRequestId);
          enqueueSnackbar(response.message, { variant: "success" });
          naviagte("/leave")
        } catch (error) {
          console.log(error);
          if (error instanceof AxiosError) {
            enqueueSnackbar(error?.response?.data.message, {
              variant: "error",
            });
          }
        }
      }
    });
  };

  const handleCancel = async (leaveRequestId: string) => {
    confirm({
      title: "Cancel Leave Request?",
      message: "Are you sure you want to Cancel this Leave Request?",
      onConfirm: async () => {
        try {
          const response = await cancelLeaveRequest(leaveRequestId);
          enqueueSnackbar(response.message, { variant: "success" });
          naviagte("/leave");
        } catch (error) {
          console.log(error);
          if (error instanceof AxiosError) {
            enqueueSnackbar(error?.response?.data.message, {
              variant: "error",
            });
          }
        }
      }
    });
  }

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    return formattedDate.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const leaveColumns = [
    {
      header: "Leave Type",
      accessor: (row: Leave) => row.leaveTypeId.name,
    },
    {
      header: "Start Date",
      accessor: (row: Leave) => formatDate(row.startDate),
    },
    {
      header: "End Date",
      accessor: (row: Leave) => formatDate(row.endDate),
    },
    {
      header: "Reason",
      accessor: (row: Leave) => row.reason,
    },
    {
      header: "Status",
      accessor: (row: Leave) => (
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${row.status === "Approved"
            ? "bg-green-100 text-green-600"
            : row.status === "Rejected"
              ? "bg-red-100 text-red-600"
              : "bg-yellow-100 text-yellow-600"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (row: Leave) => {
        if (row.status === "Pending") {
          return (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-800"
              onClick={() => handleDelete(row._id)}
            >
              <X size={16} />
            </Button>
          );
        } else if (row.status === "Approved") {
          return (
            <Button
              variant="outline"
              size="sm"
              className="text-yellow-600 hover:text-yellow-800"
              onClick={() => handleCancel(row._id)}
            >
              Cancel
            </Button>
          );
        } else if (row.status === "Rejected") {
          return (
            <span className="text-sm text-red-600">
              Reason: {row.rejectionReason || "No reason provided"}
            </span>
          );
        } else {
          return null;
        }
      }
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar role="employee" />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Header role="employee" heading="Leave Page" />

        {/* Leave Types Section */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-4">
            Types of leaves Available:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {leaveTypes?.leaveBalances?.map((leave) => (
              <Card key={leave.leaveTypeName} className="text-center">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">
                    {leave.leaveTypeName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900 bg-gray-500 py-2 rounded-md">
                    {leave.totalDays
                      ? `${leave.availableDays}/${leave.totalDays}`
                      : leave.usedDays}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Leave History Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Leave History
            </h2>
            <div className="mb-4">
              <Button
                onClick={() => setOpenModal(true)}
                className="bg-blue-600 text-white"
              >
                Apply for Leave
              </Button>
            </div>
            <AddLeaveRequestModal
              open={openModal}
              onClose={() => setOpenModal(false)}
              onAdd={handleLeaveAdd}
            />
          </div>

          {/* Card Wrapping Table */}
          <Card className="shadow-md p-4">
            <CardContent className="p-0">
              <ShadTable
                columns={leaveColumns}
                data={leaveHistory}
                keyExtractor={(row) => row._id}
                emptyMessage="No leave requests"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModalComponent />
    </div>
  );
};

export default LeavePage;
