import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { getAllLeaveTypesService } from "../../../services/user/userService";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import { leaveRequestSchema } from "../../../utils/leaveRequest.validation";

// LeaveType interface (for selecting leave types)
export interface LeaveType {
    _id?: string;
    name: string;
    description?: string;
    maxDaysAllowed: number;
    isPaid?: boolean;
    requiresApproval?: boolean;
}

// Interface for the leave request data
export interface LeaveRequest {
    employeeId?: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
}

// Props for the AddLeaveRequestModal
interface AddLeaveRequestModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (leaveRequest: LeaveRequest) => Promise<void>;
}


const AddLeaveRequestModal = ({ open, onClose, onAdd }: AddLeaveRequestModalProps) => {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>();

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const response = await getAllLeaveTypesService();
                setLeaveTypes(response.data);
            } catch (error) {
                console.log("error in fethcing leave types", error);
            }
        }
        fetchLeaveTypes();
    }, []);

    const formik = useFormik({
        initialValues: {
            leaveTypeId: "",
            startDate: "",
            endDate: "",
            reason: "",
            duration : "",
        },
        validationSchema: leaveRequestSchema,
        onSubmit: async (values, { resetForm }) => {
            console.log("Formik values:", values);
            console.log("Formik errors:", formik.errors);

            try {
                await onAdd(values);
                enqueueSnackbar("Leave Request added successfully", { variant: "success" });
                setTimeout(() => {
                    window.location.reload();
                }, 500);
                resetForm();
                onClose();
            } catch (error) {
                console.error("Failed to submit leave request:", error);
                if (error instanceof AxiosError) {
                    const errorData = error.response?.data;
                    if (errorData?.errors && Array.isArray(errorData.errors)) {
                        errorData.errors.forEach((err: { field: string; message: string }) => {
                            enqueueSnackbar(`${err.field}: ${err.message}`, { variant: "error" });
                        });
                    } else {
                        enqueueSnackbar(errorData?.message || "An unexpected error occurred", { variant: "error" });
                    }
                }
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-lg bg-white shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-800">
                        Apply for Leave
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="leaveType" className="text-sm font-medium text-gray-700">
                            Leave Type *
                        </Label>
                        <Select
                            name="leaveType"
                            value={formik.values.leaveTypeId}
                            onValueChange={(value) => formik.setFieldValue("leaveTypeId", value)}
                        >

                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveTypes && leaveTypes.map((leaveType) => (
                                    <SelectItem key={leaveType._id} value={leaveType._id as string}>
                                        {leaveType.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formik.touched.leaveTypeId && formik.errors.leaveTypeId ? (
                            <div className="text-red-500 text-sm">{formik.errors.leaveTypeId}</div>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                            Duration *
                        </Label>
                        <Select
                            name="duration"
                            value={formik.values.duration}
                            onValueChange={(value) => formik.setFieldValue("duration", value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select leave duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full">Full Day</SelectItem>
                                <SelectItem value="morning">Morning Half Day</SelectItem>
                                <SelectItem value="afternoon">Afternoon Half Day</SelectItem>
                            </SelectContent>
                        </Select>
                        {formik.touched.duration && formik.errors.duration ? (
                            <div className="text-red-500 text-sm">{formik.errors.duration}</div>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                            Start Date *
                        </Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            className="w-full"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.startDate}
                        />
                        {formik.touched.startDate && formik.errors.startDate ? (
                            <div className="text-red-500 text-sm">{formik.errors.startDate}</div>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                            End Date *
                        </Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            className="w-full"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.endDate}
                        />
                        {formik.touched.endDate && formik.errors.endDate ? (
                            <div className="text-red-500 text-sm">{formik.errors.endDate}</div>
                        ) : null}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-medium text-gray-700">
                            Reason *
                        </Label>
                        <Input
                            id="reason"
                            name="reason"
                            type="text"
                            placeholder="Enter reason for leave"
                            className="w-full"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.reason}
                        />
                        {formik.touched.reason && formik.errors.reason ? (
                            <div className="text-red-500 text-sm">{formik.errors.reason}</div>
                        ) : null}
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting ? "Submitting..." : "Submit Leave Request"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddLeaveRequestModal;