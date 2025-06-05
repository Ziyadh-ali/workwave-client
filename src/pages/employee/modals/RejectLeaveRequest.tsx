import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import { updateLeaveRequestStatusService } from "../../../services/admin/adminService";
import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";
import { useConfirmModal } from "../../../components/useConfirm";

interface RejectProps {
    leaveRequestId: string;
    role: "admin" | "employee" 
}

const RejectLeaveRequestModal = ({ leaveRequestId, role }: RejectProps) => {
    const navigate = useNavigate();
    const { confirm, ConfirmModalComponent } = useConfirmModal();
    const [open, setOpen] = useState(false);

    const formik = useFormik({
        initialValues: {
            reason: "",
        },
        validationSchema: Yup.object({
            reason: Yup.string().min(5, "Min 5 letters needed").required("Reason is required"),
        }),
        onSubmit: async (values) => {


            confirm({
                title: "Reject Leave Request",
                message: "Are you sure you want to reject this Leave Request?",
                onConfirm: async () => {
                    try {
                        const response = await updateLeaveRequestStatusService(leaveRequestId, "Rejected", values.reason);
                        enqueueSnackbar(response.message, { variant: "success" });
                        navigate(role === "admin" ? "/admin/leave/requests" : "/developers/leave");
                        setOpen(false);
                    } catch (error) {
                        enqueueSnackbar(error instanceof AxiosError ? error.response?.data?.message : "Error in forgot password", { variant: "error" });
                    }
                }
            })

        },
    });

    return (
        <>
            <Button size="sm" className="bg-red-600 text-white" onClick={() => setOpen(true)}>
                <XCircle size={16} className="mr-1" /> reject
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Leave Request</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="text">Reason *</Label>
                            <Input id="reason" name="reason" type="text" onChange={formik.handleChange} value={formik.values.reason} />
                            {formik.touched.reason && formik.errors.reason && <div className="text-red-500 text-sm">{formik.errors.reason}</div>}
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 text-white">
                            Reject Leave Request
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
            <ConfirmModalComponent />
        </>
    );
};

export default RejectLeaveRequestModal;
