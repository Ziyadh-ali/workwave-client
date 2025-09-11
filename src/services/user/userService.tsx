import axios from "axios";
import { EditMeeting } from "../../pages/employee/modals/editMeetingModal";
import { Employee, EmployeeFilter, IGroup, ILeaveRequest, IMeeting } from "../../utils/Interfaces/interfaces";
import { employeeAxios } from "../../api/axios";



export const employeeLoginService = async (data: {
  email: string,
  password: string,
}) => {
  const response = await employeeAxios.post("/login", data);
  return response.data;
}

export const logoutService = async () => {
  const response = await employeeAxios.post("/logout");
  return response.data;
}

export const getProfileDetails = async (userId: string): Promise<{ details: Employee }> => {
  const response = await employeeAxios.get(`/profile/${userId}`);
  return response.data;
}

export const updateProfileService = async (userId: string, formData: FormData) => {
  const response = await employeeAxios.patch(`profile/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const changePasswordService = async (userId: string, currentPassword: string, newPassword: string) => {
  const response = await employeeAxios.patch(`profile/${userId}/password`, {
    currentPassword,
    newPassword,
  });

  return response.data;
}

export const getLeaveBalancesService = async (userId: string) => {
  const response = await employeeAxios.get(`/leave/balance/${userId}`);
  return response.data;
}

export const getAllLeaveTypesService = async () => {
  const response = await employeeAxios.get("/leave/types");
  return response.data;
}
export const getEveryLeaveTypesService = async () => {
  const response = await employeeAxios.get("/leave/types/request");
  return response.data;
}

export const addLeaveRequestService = async (data: {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<{ message: string, leaveRequest: ILeaveRequest }> => {
  const response = await employeeAxios.post("/leave/request", {
    data,
  })
  return response.data
}

export const getLeaveRequestsService = async (
  employeeId: string,
  page: number,
  limit: number,
  search: string,
  status: string
) => {
  const response = await employeeAxios.get(`/leave/request/${employeeId}`, {
    params: { page, limit, search, status },
  });
  return response.data;
}

export const deleteLeaveRequest = async (leaveRequestId: string) => {
  const response = await employeeAxios.delete(`/leave/request/${leaveRequestId}`);
  return response.data;
}

export const forgotPasswordService = async (email: string) => {
  const response = await employeeAxios.post("/forgot-password", { email }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}
export const resetPasswordService = async (token: string, newPassword: string) => {
  const response = await employeeAxios.post("/reset-password", {
    token,
    newPassword,
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
}

export const checkInService = async (employeeId: string) => {
  const response = await employeeAxios.post(`/attendance/${employeeId}`);
  return response.data;
}

export const checkOutService = async (employeeId: string) => {
  const response = await employeeAxios.patch(`/attendance/${employeeId}`);
  return response.data;
}

export const getTodayAttendance = async (employeeId: string) => {
  const response = await employeeAxios.get(`/attendance/${employeeId}`);
  return response.data;
}

export const fetchAttendanceDataService = async (employeeId: string, year: number, month: number) => {
  const response = await employeeAxios.get(`/attendance/month/${employeeId}`, {
    params: {
      year,
      month,
    },
  });
  return response.data;
};

export const scheduleMeetingService = async (meeting: {
  title: string;
  description: string;
  date: string;
  startTime: string;
  duration: number;
}, filter: { role?: string, department?: string }): Promise<{ message: string, createdMeeting: IMeeting }> => {
  const response = await employeeAxios.post("/meeting", {
    meeting, filter
  });
  return response.data;
}

export const getMeetingsService = async (employeeId: string) => {
  const response = await employeeAxios.get(`/meeting/${employeeId}`);
  return response.data;
}

export const addMeetingLinkService = async (meetingId: string, link: string): Promise<{ message: string, meeting: IMeeting }> => {
  const response = await employeeAxios.patch(`/meeting/${meetingId}/link`, { link });
  return response.data;
}

export const changeMeetingStatusService = async (meetingId: string) => {
  const response = await employeeAxios.patch(`/meeting/${meetingId}/status`, { status: "completed" });
  return response.data;
}

export const deleteMeetingService = async (meetingId: string) => {
  const response = await employeeAxios.delete(`/meeting/${meetingId}`);
  return response.data;
}

export const editMeetingService = async (meetingId: string, updatedMeeting: Partial<EditMeeting>, filter: { role?: string, department?: string }) => {
  const response = await employeeAxios.patch(`/meeting/${meetingId}`, { meeting: updatedMeeting, filter });
  return response.data;
}

export const addFaqService = async (data: {
  topic: string;
  description: string;
  questions: {
    question: string;
    answer: string;
  }[]
}) => {
  const response = await employeeAxios.post("/faq", data);
  return response.data;
}
export const editFaqService = async (faqId: string, updatedData: Partial<{
  topic: string;
  description: string;
  questions: {
    question: string;
    answer: string;
  }[]
}>) => {
  const response = await employeeAxios.patch(`/faq/${faqId}`, { updatedData });
  return response.data;
}

export const deleteFaqService = async (faqId: string) => {
  const response = await employeeAxios.delete(`/faq/${faqId}`);
  return response.data;
}
export const getFaqService = async (searchQuery?: string) => {
  const response = await employeeAxios.get(`/faq?search=${searchQuery}`);
  return response.data;
}
export const getAllFaqService = async () => {
  const response = await employeeAxios.get(`/faq/all`);
  return response.data;
}

export const getEmployeesForChatService = async () => {
  const response = await employeeAxios.get("/employees");
  return response.data;
}

export const getDeveloperService = async () => {
  const response = await employeeAxios.get("/developers");
  return response.data;
}

export const getPrivateMessagesService = async (user1: string, user2: string) => {
  const response = await employeeAxios.get(`/messages?user1=${user1}&user2=${user2}`);
  return response.data;
}
export const getGroupMessagesService = async (roomId: string) => {
  const response = await employeeAxios.get(`/messages/${roomId}`);
  return response.data;
}
interface ProjectData {
  name: string;
  startDate: Date;
  endDate: Date;
  members: string[];
}

export const cretaeProjectService = async (data: ProjectData) => {
  const response = await employeeAxios.post("/projects ", { data });
  return response.data;
}

export const deleteProjectService = async (projectId: string) => {
  const response = await employeeAxios.delete(`/projects/${projectId}`);
  return response.data;
}

export const updateProjectService = async (projectId: string, updatedData: Partial<ProjectData>) => {
  const response = await employeeAxios.patch(`/projects/${projectId}`, { updatedData });
  return response.data;
}

export const getProjectService = async (projectId: string) => {
  const response = await employeeAxios.get(`/projects/${projectId}`);
  return response.data;
}

export const getProjectsService = async () => {
  const response = await employeeAxios.get("/projects");
  return response.data;
}

export const cancelLeaveRequest = async (leaveRequestId: string) => {
  const response = await employeeAxios.patch(`/leave/request/cancel/${leaveRequestId}`);
  return response.data;
}

export const fetchHolidays = async (year: number, countryCode = "IN") => {
  const apiKey = import.meta.env.VITE_CALENDARIFIC_API_KEY;
  try {
    const res = await axios.get(import.meta.env.VITE_CALENDARIFIC_URL, {
      params: {
        api_key: apiKey,
        country: countryCode,
        year: year,
      },
    });
    const data = res.data.response.holidays;
    console.log("Fetched holiday data:", data);

    if (Array.isArray(data)) {
      return data.map((holiday) => ({
        date: holiday.date.iso,
        name: holiday.name,
      }));
    } else {
      console.error("Holiday data is not an array:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }
};

export const addGroupService = async (data: IGroup) => {
  const response = await employeeAxios.post("/groups", { data: data });
  return response.data;
}

export const addRegularizeRequest = async (attendanceId: string, reason: string) => {
  const response = await employeeAxios.post(`/attendance/${attendanceId}/regularized`, { reason })
  return response.data;
}

export const getMyQuestionsService = async (employeeId: string) => {
  const response = await employeeAxios.get(`/question/${employeeId}`);
  return response.data;
}

export const submitQuestionService = async (question: string) => {
  const response = await employeeAxios.post("/question", { question });
  return response.data;
}
export const getHrQuestionService = async () => {
  const response = await employeeAxios.get("/question");
  return response.data;
}

export const answerQuestionService = async (questionId: string, answer: string) => {
  const response = await employeeAxios.patch(`/question/${questionId}`, { answer });
  return response.data;
}

export const getGroupByMemberService = async () => {
  const response = await employeeAxios.get("/groups");
  return response.data;
}

export const addGroupMembersService = async (
  groupId: string,
  userIds: string[]
) => {
  const response = await employeeAxios.patch(`/groups/${groupId}/members`, { userIds });
  return response.data;
};

export const getEmployeePayslipsService = async (employeeId: string) => {
  const response = await employeeAxios.get(`/payslip/${employeeId}`);
  return response.data;
};

export const downloadPayslipService = async (employeeId: string, month: number, year: number) => {
  const response = await employeeAxios.get(`/payslip/download/pdf?employeeId=${employeeId}&month=${month}&year=${year}`,
    {
      responseType: 'blob',
    }
  );
  return response.data;
};

export const getUsersForManagers = async (
  filter: EmployeeFilter,
  page: number,
  pageSize: number,
): Promise<{ data: Employee[], total: number, active: number, inactive: number, page: number, pageSize: number }> => {
  const response = await employeeAxios.get(`/users?page=${page}&pageSize=${pageSize}`, {
    params: { ...filter }
  });
  return response.data;
}

export const deleteUserForManagers = async (id: string) => {
  const response = await employeeAxios.delete(`/users/${id}`);
  return response.data;
}

export const addUserForManagers = async (userData: {
  fullName: string;
  email: string;
  role: string;
  department: string;
  password: string;
  salary: number;
}) => {
  const response = await employeeAxios.post("/users", { userData });
  return response.data;
}

export const getAllLeaveRequestsForManagerService = async (): Promise<{ leaveRequests: ILeaveRequest[] | [] }> => {
  const response = await employeeAxios.get("/leave/requests");
  return response.data;
}

export const updateLeaveRequestStatusForManagerService = async (leaveRequestId: string, status: "Approved" | "Rejected", reason?: string) => {
  const response = await employeeAxios.patch(`/leave/requests/${leaveRequestId}`, {
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
