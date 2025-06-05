import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";

// LeaveType interface
export interface LeaveType {
  _id?: string;
  name: string;
  description?: string;
  maxDaysAllowed: number;
  isPaid?: boolean;
  requiresApproval?: boolean;
}

// Validation schema for adding/updating leave types
const leaveTypeSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string().optional(),
  maxDaysAllowed: Yup.number()
    .min(0, "Max days allowed must be 0 or greater")
    .required("Max days allowed is required"),
  isPaid: Yup.boolean().required(),
  requiresApproval: Yup.boolean().required(),
});

// Props for AddLeaveTypeModal
interface AddLeaveTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (leaveType: Omit<LeaveType, "_id">) => Promise<void>;
}

// Add Leave Type Modal
export const AddLeaveTypeModal = ({ open, onOpenChange, onAdd }: AddLeaveTypeModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      maxDaysAllowed: 0,
      isPaid: true,
      requiresApproval: true,
    },
    validationSchema: leaveTypeSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await onAdd(values);
        enqueueSnackbar("Leave type added successfully", { variant: "success" });
        resetForm();
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to add leave type:", error);
        enqueueSnackbar("Failed to add leave type", { variant: "error" });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white">+ Add Leave Type</Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Add New Leave Type
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter leave type name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm">{formik.errors.description}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxDaysAllowed" className="text-sm font-medium text-gray-700">
              Max Days Allowed *
            </Label>
            <Input
              id="maxDaysAllowed"
              name="maxDaysAllowed"
              type="number"
              placeholder="Enter max days allowed"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.maxDaysAllowed}
            />
            {formik.touched.maxDaysAllowed && formik.errors.maxDaysAllowed && (
              <div className="text-red-500 text-sm">{formik.errors.maxDaysAllowed}</div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isPaid"
              name="isPaid"
              checked={formik.values.isPaid}
              onCheckedChange={(checked) => formik.setFieldValue("isPaid", checked)}
            />
            <Label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
              Is Paid
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="requiresApproval"
              name="requiresApproval"
              checked={formik.values.requiresApproval}
              onCheckedChange={(checked) =>
                formik.setFieldValue("requiresApproval", checked)
              }
            />
            <Label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
              Requires Approval
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Adding..." : "Add Leave Type"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Props for UpdateLeaveTypeModal
interface UpdateLeaveTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType: LeaveType | null;
  onUpdate: (id: string, leaveType: Omit<LeaveType, "_id">) => Promise<void>;
}

// Update Leave Type Modal
export const UpdateLeaveTypeModal = ({
  open,
  onOpenChange,
  leaveType,
  onUpdate,
}: UpdateLeaveTypeModalProps) => {
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      name: leaveType?.name || "",
      description: leaveType?.description || "",
      maxDaysAllowed: leaveType?.maxDaysAllowed || 0,
      isPaid: leaveType?.isPaid || true,
      requiresApproval: leaveType?.requiresApproval || true,
    },
    validationSchema: leaveTypeSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!leaveType) return;
      try {
        await onUpdate(leaveType._id as string, values);
        enqueueSnackbar("Leave type updated successfully", { variant: "success" });
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to update leave type:", error);
        enqueueSnackbar("Failed to update leave type", { variant: "error" });
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Update Leave Type
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name *
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter leave type name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Enter description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm">{formik.errors.description}</div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxDaysAllowed" className="text-sm font-medium text-gray-700">
              Max Days Allowed *
            </Label>
            <Input
              id="maxDaysAllowed"
              name="maxDaysAllowed"
              type="number"
              placeholder="Enter max days allowed"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.maxDaysAllowed}
            />
            {formik.touched.maxDaysAllowed && formik.errors.maxDaysAllowed && (
              <div className="text-red-500 text-sm">{formik.errors.maxDaysAllowed}</div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isPaid"
              name="isPaid"
              checked={formik.values.isPaid}
              onCheckedChange={(checked) => formik.setFieldValue("isPaid", checked)}
            />
            <Label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
              Is Paid
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="requiresApproval"
              name="requiresApproval"
              checked={formik.values.requiresApproval}
              onCheckedChange={(checked) =>
                formik.setFieldValue("requiresApproval", checked)
              }
            />
            <Label htmlFor="requiresApproval" className="text-sm font-medium text-gray-700">
              Requires Approval
            </Label>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Updating..." : "Update Leave Type"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};