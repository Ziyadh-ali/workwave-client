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
import { projectSchema } from "../../../utils/project.validator";
import { getDeveloperService } from "../../../services/user/userService";

export interface ProjectFormValues {
    name: string;
    startDate: Date;
    endDate: Date;
    members: string[];
}

interface ProjectFormModalProps {
    isOpen: boolean;
    initialValues: ProjectFormValues;
    onClose: () => void;
    onSubmit: (values: ProjectFormValues) => void;
    isEdit?: boolean;
}

interface Employee {
    _id: string;
    fullName: string;
}

const formatDateInput = (date: Date): string => {
    return date.toISOString().split("T")[0];
};

const ProjectFormModal: FC<ProjectFormModalProps> = ({
    isOpen,
    initialValues,
    onClose,
    onSubmit,
    isEdit = false,
}) => {
    const [employees, setEmployees] = useState<Employee[]>([]);

    const today = new Date();

    const updatedInitialValues: ProjectFormValues = {
        ...initialValues,
        startDate: isEdit ? initialValues.startDate : initialValues.startDate || today,
    };

    const formik = useFormik<ProjectFormValues>({
        initialValues: updatedInitialValues,
        validationSchema: projectSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            onSubmit(values);
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
                    <DialogTitle>{isEdit ? "Edit Project" : "Add New Project"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Project Name</Label>
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
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={formatDateInput(formik.values.startDate)}
                            onChange={(e) =>
                                formik.setFieldValue("startDate", new Date(e.target.value))
                            }
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.startDate && typeof formik.errors.startDate === "string" && (
                            <p className="text-red-600 text-sm">{formik.errors.startDate}</p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={formatDateInput(formik.values.endDate)}
                            onChange={(e) =>
                                formik.setFieldValue("endDate", new Date(e.target.value))
                            }
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.endDate && typeof formik.errors.endDate === "string" && (
                            <p className="text-red-600 text-sm">{formik.errors.endDate}</p>
                        )}
                    </div>
                    <div>
                        <Label>Members</Label>
                        <div className="border rounded p-2 max-h-40 overflow-y-auto space-y-1">
                            {employees.map((emp: Employee) => {
                                const isChecked = formik.values.members.includes(emp._id);

                                return (
                                    <label key={emp._id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                                const updatedMembers = isChecked
                                                    ? formik.values.members.filter(id => id !== emp._id)
                                                    : [...formik.values.members, emp._id];

                                                formik.setFieldValue("members", updatedMembers);
                                            }}
                                        />
                                        <span>{emp.fullName}</span>
                                    </label>
                                );
                            })}
                        </div>
                        {formik.touched.members && typeof formik.errors.members === "string" && (
                            <p className="text-red-600 text-sm">{formik.errors.members}</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="bg-blue-600 text-white">
                            Save
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

export default ProjectFormModal;
