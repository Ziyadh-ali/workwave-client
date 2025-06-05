import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { forgotPasswordService } from "../../../services/user/userService";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";

const ForgotPasswordModal = () => {
    const [open, setOpen] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Email is required"),
        }),
        onSubmit: async (values) => {
            try {
                const response = await forgotPasswordService(values.email)
                enqueueSnackbar(response.message , {variant : "success"});
                setOpen(false);
            } catch (error) {
                enqueueSnackbar(error instanceof AxiosError? error.response?.data?.message : "Error in forgot password" , {variant : "error"});
            }
        },
    });

    return (
        <>
            <Button variant="link" className="text-blue-600 hover:underline" onClick={() => setOpen(true)}>
                Forgot Password?
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Forgot Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input id="email" name="email" type="email" onChange={formik.handleChange} value={formik.values.email} />
                            {formik.touched.email && formik.errors.email && <div className="text-red-500 text-sm">{formik.errors.email}</div>}
                        </div>
                        <Button type="submit" className="w-full bg-blue-600 text-white">
                            Send Reset Link
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ForgotPasswordModal;
