import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import { addMeetingLinkService } from "../../../services/user/userService";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../../context/SocketContext";


interface AddMeetingLinkModalProps {
    meetingId: string; // ID of  Callback to close the modal
}

const AddMeetingLinkModal = ({ meetingId }: AddMeetingLinkModalProps) => {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false);
    const { sendMeetingUpdated } = useSocket()


    const formik = useFormik({
        initialValues: {
            link: "",
        },
        validationSchema: Yup.object({
            link: Yup.string()
                .url("Invalid URL format")
                .required("Meeting link is required"),
        }),
        onSubmit: async (values) => {
            try {
                const response = await addMeetingLinkService(meetingId, values.link);
                sendMeetingUpdated({
                    participants : response.meeting.participants,
                    meetingId : response.meeting._id,
                    meetingTitle : response.meeting.title,
                    updatedBy : response.meeting.createdBy,
                    changes : "Link Added"
                })
                enqueueSnackbar(response.message, { variant: "success" });
                navigate("/meeting")
                setOpen(false);
            } catch (error) {
                enqueueSnackbar(
                    error instanceof AxiosError ? error.response?.data?.message : "Error adding meeting link",
                    { variant: "error" }
                );
            }
        },
    });

    return (
        <>
            <Button
                variant="outline"
                className="w-full bg-yellow-500 text-white mb-2"
                onClick={() => setOpen(true)}
            >
                Add Link
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Meeting Link</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="link">Meeting Link *</Label>
                            <Input
                                id="link"
                                name="link"
                                type="url"
                                placeholder="Enter meeting link (e.g., https://example.com)"
                                onChange={formik.handleChange}
                                value={formik.values.link}
                            />
                            {formik.touched.link && formik.errors.link && (
                                <div className="text-red-500 text-sm">{formik.errors.link}</div>
                            )}
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 text-white">
                            Save Link
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddMeetingLinkModal;