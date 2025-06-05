export interface IGroup {
    _id?: string;
    name: string;
    members: string[];
    createdBy?: string;
}

export interface IAdminAttendance {
    date: Date | null;
    page: number;
    pageSize: number;
}

export interface IQuestion {
    _id: string;
    employeeId: string;
    question: string;
    answer: string;
    isAnswered: boolean;
    answeredBy?: string;
    createdAt: Date;
    answeredAt?: Date;
}

export interface ChatUser {
    _id: string;
    fullName: string;
    role: string;
    profilePic: string;
}

export interface Notification {
    _id: string;
    content: string;
    read: boolean;
    createdAt: Date;
    type: 'message' | 'group_invite' | 'mention' | 'reaction' | 'group_update';
}

export interface Message {
    _id?: string;
    content: string;
    sender: {
        _id: string;
        fullName: string;
        email: string;
    };
    recipient?: string;
    roomId?: string;
    media?: {
        url: string;
        type: 'image' | 'video' | 'document';
        public_id?: string;
    }
    createdAt?: string;
}

export interface MonthlyAttendanceSummary {
    _id: string;
    employeeId: {
        fullName: string;
        role: string;
        _id: string;
    };
    month: number;
    year: number;
    workingDays: number;
    presentDays: number;
    leaveDays: number;
    nonPaidLeaves: number;
    status: "Pending" | "Approved" | "Rejected";
    remarks?: string;
    rejectionReason?: string;
    generatedAt: string;
    generatedBy: string;
}


export interface IPayroll {
    _id: string;
    employeeId: {
        _id: string,
        fullName: string,
        role: "admin" | "employee"
    };
    month: number;
    year: number;
    presentDays: number;
    workingDays: number;
    baseSalary: number;
    netSalary: number;
    status: "Pending" | "Paid";
    generatedAt: Date;
}

export interface IPayslip {
    _id: string;
    employeeId: {
        _id: string,
        fullName: string,
        role: "admin" | "employee"
    };
    month: number;
    year: number;
    presentDays: number;
    workingDays: number;
    taxDeduction: number;
    pfDeduction: number;
    totalDeduction: number;
    lossOfPayDeduction: number;
    baseSalary: number;
    netSalary: number;
    status: "Pending" | "Paid";
    generatedAt: Date;
}

export interface IMessage {
    _id?: string;
    content: string;
    sender: {
        _id: string;
        email: string,
        fullName: string,
        profilePic: string,
    };
    roomId?: string;
    recipient?: string;
    media?: {
        url: string;
        type: 'image' | 'video' | 'document';
        public_id?: string;
    };
    createdAt: Date;
}

export interface Employee {
    _id: string;
    fullName: string,
    email: string;
    department: string;
    role: "hr" | "developer" | "projectManager";
    status: "active" | "inactive",
    phone: number,
    address?: string,
    joinedAt: Date,
    manager?: { _id: string; fullName: string } | null,
    profilePic?: string,
    salary: number;
    salaryType: "hourly" | "monthly";
    createdAt: Date;
    updatedAt: Date;
}


export interface IGroup {
    _id?: string;
    name: string;
    members: string[];
    createdBy?: string;
}

export interface INotification {
    _id: string;
    recipient: string;
    sender?: string;
    type: 'message' | 'leave_approval' | 'leave_rejection' | 'meeting_scheduled' | 'meeting_updated';
    content: string;
    read?: boolean;
    createdAt: Date;
    updatedAt: Date;
    metadata?: {
        leaveId?: string;
        meetingId?: string;
        messageId?: string;
        roomId?: string;
    };
}

export interface ILeaveRequest {
    _id: string;
    employeeId: {
        fullName: string,
        role: string,
        _id: string,
    }
    leaveTypeId: {
        name: string,
        _id: string,
    }
    days: number;
    startDate: string;
    endDate: string;
    assignedManager : string;
    duration : number
    reason?: string;
    status?: "Pending" | "Approved" | "Rejected";
}

export interface IMeeting {
    _id: string;
    title: string,
    description: string;
    date: Date;
    startTime: string;
    status: "upcoming" | "completed" | "ongoing";
    duration: number;
    link?: string;
    createdBy: string;
    participants: string[];
}