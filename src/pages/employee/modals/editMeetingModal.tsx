import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { useFormik } from "formik";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import { meetingScheduleSchema } from "../../../utils/MeetingSchedule.validator";
import { useNavigate } from "react-router-dom";

export interface EditMeeting {
    _id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    duration: number;
    role?: string;
    department?: string;
}

interface EditMeetingModalProps {
    open: boolean;
    onClose: () => void;
    meeting: EditMeeting;
    onUpdate: (
        updatedMeeting: EditMeeting,
        filter :{
            role?: string;
            department?: string;
        }
    ) => Promise<void>;
}

const EditMeetingModal = ({ open, onClose, meeting, onUpdate }: EditMeetingModalProps) => {
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            title: meeting.title || "",
            description: meeting.description || "",
            date: meeting.date || "",
            startTime: meeting.startTime || "",
            duration: String(meeting.duration || ""),
            role: meeting.role || "",
            department: meeting.department || "",
        },
        enableReinitialize: true,
        validationSchema: meetingScheduleSchema,
        onSubmit: async (values, { resetForm }) => {
            try {
                const filter: { role?: string; department?: string } = values.role
                    ? { role: values.role }
                    : { department: values.department };

                const payload: EditMeeting = {
                    _id: meeting._id,
                    title: values.title,
                    description: values.description,
                    date: values.date,
                    startTime: values.startTime,
                    duration: Number(values.duration),
                };

                await onUpdate(payload, filter);

                enqueueSnackbar("Meeting updated successfully", { variant: "success" });
                navigate("/meeting");
                resetForm();
                onClose();
            } catch (error) {
                console.error("Error updating meeting:", error);
                if (error instanceof AxiosError) {
                    enqueueSnackbar(error?.response?.data.message, { variant: "error" });
                }
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="rounded-xl max-w-md max-h-[80vh] overflow-y-auto scrollbar-hidden">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-800">
                        Edit Meeting
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4">

                    {/* Title */}
                    <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            name="title"
                            type="text"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.title && formik.errors.title && (
                            <p className="text-red-500 text-sm">{formik.errors.title}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Input
                            id="description"
                            name="description"
                            type="text"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <p className="text-red-500 text-sm">{formik.errors.description}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <Label htmlFor="date">Date *</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formik.values.date}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.date && formik.errors.date && (
                            <p className="text-red-500 text-sm">{formik.errors.date}</p>
                        )}
                    </div>

                    {/* Start Time */}
                    <div>
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                            id="startTime"
                            name="startTime"
                            type="time"
                            value={formik.values.startTime}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.startTime && formik.errors.startTime && (
                            <p className="text-red-500 text-sm">{formik.errors.startTime}</p>
                        )}
                    </div>

                    {/* Duration */}
                    <div>
                        <Label htmlFor="duration">Duration (in minutes) *</Label>
                        <Input
                            id="duration"
                            name="duration"
                            type="number"
                            value={formik.values.duration}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.duration && formik.errors.duration && (
                            <p className="text-red-500 text-sm">{formik.errors.duration}</p>
                        )}
                    </div>

                    {/* Role */}
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formik.values.role}
                            onValueChange={(value) => {
                                formik.setFieldValue("role", value);
                                formik.setFieldValue("department", "");
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hr">HR Manager</SelectItem>
                                <SelectItem value="projectManager">Project Manager</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                            </SelectContent>
                        </Select>
                        {formik.touched.role && formik.errors.role && (
                            <p className="text-red-500 text-sm">{formik.errors.role}</p>
                        )}
                    </div>

                    {/* Department */}
                    <div>
                        <Label htmlFor="department">Department</Label>
                        <Select
                            value={formik.values.department}
                            onValueChange={(value) => {
                                formik.setFieldValue("department", value);
                                formik.setFieldValue("role", "");
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="hr">HR</SelectItem>
                                <SelectItem value="softwareDevelopment">Software Development</SelectItem>
                                <SelectItem value="projectManagement">Project Management</SelectItem>
                            </SelectContent>
                        </Select>
                        {formik.touched.department && formik.errors.department && (
                            <p className="text-red-500 text-sm">{formik.errors.department}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button type="submit" className="w-full bg-blue-600 text-white" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? "Updating..." : "Update Meeting"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditMeetingModal;
