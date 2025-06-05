import { adminAxiosInstance } from "../../api/admin.axios";
import { Employee, ILeaveRequest, IPayroll } from "../../utils/Interfaces/interfaces";

export const adminLoginService = async (data: { email: string, password: string }) => {
    const response = await adminAxiosInstance.post("/login", data);
    return response.data;
}

export const addUser = async (userData: {
    fullName: string;
    email: string;
    role: string;
    department: string;
    password: string;
    salary: number;
}) => {
    const response = await adminAxiosInstance.post("/users", { userData });
    return response.data;
}

interface EmployeeFilter {
    role?: string;
    status?: string;
    department?: string;
    [key: string]: string | undefined;
}
export const getUsers = async (
    filter: EmployeeFilter,
    page: number,
    pageSize: number,
): Promise<{ data: Employee[], total: number, active: number, inactive: number, page: number, pageSize: number }> => {
    const response = await adminAxiosInstance.get(`/users?page=${page}&pageSize=${pageSize}`, {
        params: { ...filter }
    });
    return response.data;
}

export const getUserDetails = async (id: string) => {
    const response = await adminAxiosInstance.get(`/users/${id}`);
    return response.data;
}

export const deleteUser = async (id: string) => {
    const response = await adminAxiosInstance.delete(`/users/${id}`);
    return response.data;
}

export const getManagers = async () => {
    const response = await adminAxiosInstance.get("/managers");
    return response.data;
}

export const updateUserService = async (userId: string, formData: FormData) => {
    const response = await adminAxiosInstance.patch(`/users/${userId}`, formData);
    return response.data;

}

export const getLeaveTypesService = async () => {
    const response = await adminAxiosInstance.get("/leave/type");
    return response.data;

}

export const deleteLeaveTypeService = async (id: string) => {
    const response = await adminAxiosInstance.delete(`/leave/type/${id}`);
    return response.data;
}

export const createLeaveTypeService = async (
    data: {
        name: string;
        description?: string;
        maxDaysAllowed: number;
        isPaid?: boolean;
        requiresApproval?: boolean;
    }
) => {
    const response = await adminAxiosInstance.post(`/leave/type`, data);
    return response.data;
}
export const updateLeaveTypeService = async (
    id: string,
    data: {
        name?: string;
        description?: string;
        maxDaysAllowed?: number;
        isPaidLeave?: boolean;
        requiresApproval?: boolean;
    }
) => {
    const response = await adminAxiosInstance.patch(`/leave/type/${id}`, data);
    return response.data;
}

export const getAllLeaveRequestsService = async () : Promise<{leaveRequests : ILeaveRequest[] | []}> => {
    const response = await adminAxiosInstance.get("/leave/requests");
    return response.data;
}

export const updateLeaveRequestStatusService = async (leaveRequestId: string, status: "Approved" | "Rejected", reason?: string) => {
    const response = await adminAxiosInstance.patch(`/leave/requests/${leaveRequestId}`, {
        status,
        reason
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    }
    );
    return response.data;
}

export const getAllAttendanceService = async (
    date: string | number,
    page: number,
    pageSize: number
) => {
    const queryDate = typeof date === "number" ? new Date(date).toISOString().split("T")[0] : date;
    const response = await adminAxiosInstance.get(
        `/attendance?date=${queryDate}&page=${page}&pageSize=${pageSize}`
    );
    return response.data;
};

export const updateAttendanceService = async (attendanceId: string, status: "Present" | "Absent" | "Weekend" | "Holiday" | "Pending") => {
    const response = await adminAxiosInstance.patch(`/attendance/${attendanceId}?status=${status}`);
    return response.data;
}

export const regularizeStatusService = async (attendanceId: string, action: "Approved" | "Rejected", remarks: string) => {
    const response = await adminAxiosInstance.patch(`/attendance/${attendanceId}/regularize?action=${action}`, { remarks });
    return response.data;
}

export const getQuestionsForAdminService = async () => {
    const response = await adminAxiosInstance.get("/question");
    return response.data;
}

export const answerAdminQuestionService = async (questionId: string, answer: string) => {
    const response = await adminAxiosInstance.patch(`/question/${questionId}`, { answer });
    return response.data;
}

export const approveSummaryStatusService = async (summaryId: string) => {
    const response = await adminAxiosInstance.patch(`/summary/approve/${summaryId}`,);
    return response.data;
}

export const bulkApproveSummariesService = async (summaryIds: string[]) => {
    const response = await adminAxiosInstance.patch(`/summary/bulk-approve`, { summaryIds });
    return response.data;
};

export const rejectSummaryStatusService = async (summaryId: string, rejectionReason: string) => {
    const response = await adminAxiosInstance.patch(`/summary/reject/${summaryId}`, { rejectionReason });
    return response.data;
}

export const generateMonthlySummaryService = async (month: number, year: number, employeeId?: string) => {
    const response = await adminAxiosInstance.post(`/summary`, { month, year, employeeId });
    return response.data;
}


export const regenerateMonthlySummaryService = async (month: number, year: number, employeeId?: string) => {
    const response = await adminAxiosInstance.post(`/summary/regenerate`, { month, year, employeeId });
    return response.data;
}

export const getMonthlySummariesService = async (month: number, year: number) => {
    const response = await adminAxiosInstance.get(`/summary?month=${month}&year=${year}`);
    return response.data;
}

export const getPayrollRecordsService = async (month: number, year: number) => {
    const response = await adminAxiosInstance.get(`/payroll?month=${month}&year=${year}&status=${status}`);
    return response.data;
}

export const updatePayrollStatusService = async (payrollId: string) => {
    const response = await adminAxiosInstance.patch(`/payroll/${payrollId}/status`);
    return response.data;
}

export const generatePayrollService = async (month: number, year: number, taxPercentage: number, employeeId?: string,) => {
    const response = await adminAxiosInstance.post("/payroll/generate", { month, year, employeeId, taxPercentage });
    return response.data;
}

export const generateBulkPayrollService = async (month: number, year: number, taxPercentage: number) => {
    const response = await adminAxiosInstance.post("/payroll/generate/bulk", { month, year, taxPercentage });
    return response.data;
}

export const getAllPayrollsService = async () : Promise<{payrolls : IPayroll[] | []}> => {
    const response = await adminAxiosInstance.get("/payrolls");
    return response.data;
}