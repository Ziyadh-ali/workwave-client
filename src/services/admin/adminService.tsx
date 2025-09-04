import { adminAxios } from "../../api/axios";
import { Employee, EmployeeFilter, ILeaveRequest, IPayroll,  } from "../../utils/Interfaces/interfaces";

export const adminLoginService = async (data: { email: string, password: string }) => {
    const response = await adminAxios.post("/login", data);
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
    const response = await adminAxios.post("/users", { userData });
    return response.data;
}

export const getUsers = async (
    filter: EmployeeFilter,
    page: number,
    pageSize: number,
): Promise<{ data: Employee[], total: number, active: number, inactive: number, page: number, pageSize: number }> => {
    const response = await adminAxios.get(`/users?page=${page}&pageSize=${pageSize}`, {
        params: { ...filter }
    });
    return response.data;
}

export const getUserDetails = async (id: string) => {
    const response = await adminAxios.get(`/users/${id}`);
    return response.data;
}

export const deleteUser = async (id: string) => {
    const response = await adminAxios.delete(`/users/${id}`);
    return response.data;
}

export const getManagers = async () => {
    const response = await adminAxios.get("/managers");
    return response.data;
}

export const updateUserService = async (userId: string, formData: FormData) => {
    const response = await adminAxios.patch(`/users/${userId}`, formData);
    return response.data;

}

export const getLeaveTypesService = async (
    page: number,
    limit: number,
    filterPaid: string) => {
    const response = await adminAxios.get("/leave/type", {
        params: {
            page,
            limit,
            isPaid: filterPaid === "All" ? "" : filterPaid === "Paid" ? true : false,
        },
    });
    return response.data;

}

export const deleteLeaveTypeService = async (id: string) => {
    const response = await adminAxios.delete(`/leave/type/${id}`);
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
    const response = await adminAxios.post(`/leave/type`, data);
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
    const response = await adminAxios.patch(`/leave/type/${id}`, data);
    return response.data;
}

export const getAllLeaveRequestsService = async (
    page: number,
    limit: number,
    status: string
): Promise<{ leaveRequests: ILeaveRequest[] | [], totalPages: number }> => {
    const response = await adminAxios.get("/leave/requests", {
        params: { page, limit, status },
    });
    return response.data;
}

export const getEveryLeaveRequestsService = async (): Promise<{leaveRequests : ILeaveRequest[]}> => {
    const response = await adminAxios.get("/leave/requests/all");
    return response.data;
}

export const updateLeaveRequestStatusService = async (leaveRequestId: string, status: "Approved" | "Rejected", reason?: string) => {
    const response = await adminAxios.patch(`/leave/requests/${leaveRequestId}`, {
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
    const response = await adminAxios.get(
        `/attendance?date=${queryDate}&page=${page}&pageSize=${pageSize}`
    );
    return response.data;
};

export const updateAttendanceService = async (attendanceId: string, data: {
    status?: "Present" | "Absent" | "Weekend" | "Holiday" | "Pending",
    checkInTime?: string,
    checkOutTime?: string,
}) => {
    const response = await adminAxios.patch(`/attendance/${attendanceId}`, {
        data
    });
    return response.data;
}

export const adminDeleteFaqService = async (faqId: string) => {
    const response = await adminAxios.delete(`/faq/${faqId}`);
    return response.data;
}
export const adminGetFaqService = async (searchQuery?: string) => {
    const response = await adminAxios.get(`/faq?search=${searchQuery}`);
    return response.data;
}

export const adminAddFaqService = async (data: {
  topic: string;
  description: string;
  questions: {
    question: string;
    answer: string;
  }[]
}) => {
  const response = await adminAxios.post("/faq", data);
  return response.data;
}

export const regularizeStatusService = async (attendanceId: string, action: "Approved" | "Rejected", remarks: string) => {
    const response = await adminAxios.patch(`/attendance/${attendanceId}/regularize?action=${action}`, { remarks });
    return response.data;
}

export const getQuestionsForAdminService = async () => {
    const response = await adminAxios.get("/question");
    return response.data;
}

export const answerAdminQuestionService = async (questionId: string, answer: string) => {
    const response = await adminAxios.patch(`/question/${questionId}`, { answer });
    return response.data;
}

export const approveSummaryStatusService = async (summaryId: string) => {
    const response = await adminAxios.patch(`/summary/approve/${summaryId}`,);
    return response.data;
}

export const bulkApproveSummariesService = async (summaryIds: string[]) => {
    const response = await adminAxios.patch(`/summary/bulk-approve`, { summaryIds });
    return response.data;
};

export const rejectSummaryStatusService = async (summaryId: string, rejectionReason: string) => {
    const response = await adminAxios.patch(`/summary/reject/${summaryId}`, { rejectionReason });
    return response.data;
}

export const generateMonthlySummaryService = async (month: number, year: number, employeeId?: string) => {
    const response = await adminAxios.post(`/summary`, { month, year, employeeId });
    return response.data;
}


export const regenerateMonthlySummaryService = async (month: number, year: number, employeeId?: string) => {
    const response = await adminAxios.post(`/summary/regenerate`, { month, year, employeeId });
    return response.data;
}

export const getMonthlySummariesService = async (month: number, year: number) => {
    const response = await adminAxios.get(`/summary?month=${month}&year=${year}`);
    return response.data;
}

export const getPayrollRecordsService = async (month: number, year: number) => {
    const response = await adminAxios.get(`/payroll?month=${month}&year=${year}&status=${status}`);
    return response.data;
}

export const updatePayrollStatusService = async (payrollId: string) => {
    const response = await adminAxios.patch(`/payroll/${payrollId}/status`);
    return response.data;
}

export const generatePayrollService = async (month: number, year: number, taxPercentage: number, employeeId?: string,) => {
    const response = await adminAxios.post("/payroll/generate", { month, year, employeeId, taxPercentage });
    return response.data;
}

export const generateBulkPayrollService = async (month: number, year: number, taxPercentage: number) => {
    const response = await adminAxios.post("/payroll/generate/bulk", { month, year, taxPercentage });
    return response.data;
}

export const getAllPayrollsService = async (): Promise<{ payrolls: IPayroll[] | [] }> => {
    const response = await adminAxios.get("/payrolls");
    return response.data;
}

export const getPayrollsForReportService = async (month: number, year: number): Promise<{ data: IPayroll[] | [], count: number }> => {
    const response = await adminAxios.get(`/payroll?month=${month}&year=${year}`);
    return response.data;
}

export const adminEditFaqService = async (faqId: string, updatedData: Partial<{
  topic: string;
  description: string;
  questions: {
    question: string;
    answer: string;
  }[]
}>) => {
  const response = await adminAxios.patch(`/faq/${faqId}`, { updatedData });
  return response.data;
}