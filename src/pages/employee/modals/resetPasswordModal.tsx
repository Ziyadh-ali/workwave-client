// ResetPasswordModal.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";

interface ResetPasswordModalProps {
  token: string | null;
  onResetPassword: (data: { token: string; newPassword: string }) => void;
  onClose: () => void;
  open: boolean;
}

const ResetPasswordModal = ({ token, onResetPassword, onClose, open }: ResetPasswordModalProps) => {
  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().min(8, "Must be at least 8 characters").required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("newPassword")], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: (values) => {
      if (token) {
        onResetPassword({
          token,
          newPassword: values.newPassword,
        });
      }
    },
  });

  if (!token) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.newPassword}
            />
            {formik.touched.newPassword && formik.errors.newPassword && (
              <div className="text-red-500 text-sm">{formik.errors.newPassword}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-red-500 text-sm">{formik.errors.confirmPassword}</div>
            )}
          </div>
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordModal;