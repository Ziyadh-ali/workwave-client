import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useFormik } from "formik";
import * as Yup from "yup";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { answerQuestionService } from "../../../services/user/userService";
import { answerAdminQuestionService } from "../../../services/admin/adminService";

interface AnswerQuestionModalProps {
    open : boolean,
    questionId: string; // ID of the question being answered
    questionText: string; // Question text to display
    existingAnswer: string; // The existing answer (if any)
    userRole: "employee" | "admin"; // User role (HR or Admin)
    onClose: () => void; // Callback to close the modal
}

const AnswerQuestionModal = ({
    open,
    questionId,
    existingAnswer,
    userRole,
    onClose,
}: AnswerQuestionModalProps) => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            answer: existingAnswer || "",
        },
        validationSchema: Yup.object({
            answer: Yup.string().required("Answer is required"),
        }),
        onSubmit: async (values) => {
            try {
                let response;
                if (userRole === "employee") {
                    response = await answerQuestionService(questionId, values.answer);
                } else {
                    response = await answerAdminQuestionService(questionId, values.answer);
                }

                enqueueSnackbar(response.message, { variant: "success" });
                onClose();
                navigate(userRole === "employee" ?"/help-desk" : "/admin/help");
            } catch (error) {
                enqueueSnackbar(
                    error instanceof AxiosError ? error.response?.data?.message : "Error answering question",
                    { variant: "error" }
                );
            }
        },
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Answer Question</DialogTitle>
                </DialogHeader>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="answer">Your Answer *</Label>
                        <Input
                            id="answer"
                            name="answer"
                            type="text"
                            placeholder="Enter your answer here"
                            onChange={formik.handleChange}
                            value={formik.values.answer}
                        />
                        {formik.touched.answer && formik.errors.answer && (
                            <div className="text-red-500 text-sm">{formik.errors.answer}</div>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => {
                                onClose();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 text-white">
                            Submit Answer
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AnswerQuestionModal;
