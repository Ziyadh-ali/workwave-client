import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ResetPasswordModal from "../modals/resetPasswordModal";
import { resetPasswordService } from "../../../services/user/userService";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (token) {
            setOpen(true);
        }
    }, [token]);

    const handleResetPassword = async (data: { token: string; newPassword: string }) => {
        try {
            const response = await resetPasswordService(data.token, data.newPassword);
            
            enqueueSnackbar(response.message, { variant: "success" });
            handleClose();
        } catch (error) {
            enqueueSnackbar(error instanceof AxiosError ? error.response?.data?.message : "Error in reseting password", { variant: "error" });
        }
    };

    const handleClose = () => {
        setOpen(false);
        window.location.href = "/login";
    };

    return (
        <ResetPasswordModal
            token={token}
            onResetPassword={handleResetPassword}
            onClose={handleClose}
            open={open} // Control modal state
        />
    );
};
