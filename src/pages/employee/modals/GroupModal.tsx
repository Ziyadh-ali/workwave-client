import { FC, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getDeveloperService } from "../../../services/user/userService";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

export interface GroupFormValues {
  name: string;
  members: string[];
}

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: GroupFormValues) => void;
}

interface Employee {
  _id: string;
  fullName: string;
}

const groupSchema = Yup.object().shape({
  name: Yup.string().required("Group name is required"),
  members: Yup.array().min(2, "At least two members required"),
});

const GroupFormModal: FC<GroupFormModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { employee } = useSelector((state: RootState) => state.employee);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const formik = useFormik<GroupFormValues>({
    initialValues: { name: "", members: [] },
    validationSchema: groupSchema,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm()
      onClose();
    },
  });

  useEffect(() => {
    async function fetchDevelopers() {
      const response = await getDeveloperService();
      setEmployees(response.developers);
    }
    fetchDevelopers();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name</Label>
            <Input
              id="name"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-red-600 text-sm">{formik.errors.name}</p>
            )}
          </div>

          <div>
            <Label>Select Members</Label>
            <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-1">
              {employees
                .filter((emp) => emp._id !== employee?._id)
                .map((emp) => {
                  const isChecked = formik.values.members.includes(emp._id);

                  return (
                    <label key={emp._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const updatedMembers = isChecked
                            ? formik.values.members.filter((id) => id !== emp._id)
                            : [...formik.values.members, emp._id];

                          formik.setFieldValue("members", updatedMembers);
                        }}
                      />
                      <span>{emp.fullName}</span>
                    </label>
                  );
                })}
            </div>
            {formik.touched.members && formik.errors.members && (
              <p className="text-red-600 text-sm">{formik.errors.members}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="bg-blue-600 text-white">
              Create Group
            </Button>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupFormModal;
