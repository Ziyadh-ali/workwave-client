import * as Yup from "yup"

const today = new Date();
today.setHours(0, 0, 0, 0);

export const leaveRequestSchema = Yup.object({
    leaveTypeId: Yup.string().required("Leave type is required"),
    startDate: Yup.date()
        .required("Start date is required")
        .min(today, "Start date cannot be in the past"),
    endDate: Yup.date()
        .required("End date is required")
        .min(Yup.ref("startDate"), "End date cannot be before start date"),
    reason: Yup.string()
        .required("Reason is required")
        .min(5, "Reason must be at least 5 characters"),
});