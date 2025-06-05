import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "../../../components/ui/dialog";
  import { Button } from "../../../components/ui/button";
  import { Input } from "../../../components/ui/input";
  import { Label } from "../../../components/ui/label";
  import { Textarea } from "../../../components/ui/textarea";
  import { useFormik } from "formik";
  import { faqValidationSchema } from "../../../utils/faq.validaiton";
  import { enqueueSnackbar } from "notistack";
  import { AxiosError } from "axios";
  import { useEffect, useState } from "react";
  
  interface FaqData {
    _id?: string;
    topic: string;
    description: string;
    questions: {
      question: string;
      answer: string;
    }[];
  }
  
  interface AddEditFaqModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (faqData: FaqData, id?: string) => Promise<void>;
    mode: "add" | "edit";
    initialData?: FaqData;
  }
  
  const AddEditFaqModal = ({
    open,
    onClose,
    onSubmit,
    mode,
    initialData,
  }: AddEditFaqModalProps) => {
    const [questionInput, setQuestionInput] = useState("");
    const [answerInput, setAnswerInput] = useState("");
  
    useEffect(() => {
      if (!open) {
        setQuestionInput("");
        setAnswerInput("");
      }
    }, [open]);
  
    const formik = useFormik<FaqData>({
      initialValues: initialData || {
        topic: "",
        description: "",
        questions: [],
      },
      enableReinitialize: true,
      validationSchema: faqValidationSchema,
      onSubmit: async (values, { resetForm }) => {
        try {
          if (mode === "edit" && initialData?._id) {
            await onSubmit(values, initialData._id);
          } else {
            await onSubmit(values);
          }
  
          enqueueSnackbar(`FAQ ${mode === "edit" ? "updated" : "added"} successfully`, {
            variant: "success",
          });

  
          resetForm();
          setQuestionInput("");
          setAnswerInput("");
          onClose();
        } catch (error) {
          enqueueSnackbar(
            error instanceof AxiosError
              ? error.response?.data?.message
              : "Something went wrong",
            { variant: "error" }
          );
        }
      },
    });
  
    const addQuestion = () => {
      if (!questionInput.trim() || !answerInput.trim()) return;
  
      const newQuestion = {
        question: questionInput.trim(),
        answer: answerInput.trim(),
      };
  
      formik.setFieldValue("questions", [...formik.values.questions, newQuestion]);
      setQuestionInput("");
      setAnswerInput("");
    };
  
    const removeQuestion = (index: number) => {
      const updated = [...formik.values.questions];
      updated.splice(index, 1);
      formik.setFieldValue("questions", updated);
    };
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent
          className="rounded-xl max-w-md max-h-[80vh] overflow-y-auto
          scrollbar-hidden hover:scrollbar-thumb-black-400 scrollbar-thumb-rounded-full"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {mode === "edit" ? "Edit FAQ" : "Add FAQ"}
            </DialogTitle>
          </DialogHeader>
  
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Topic */}
            <div className="space-y-1">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                value={formik.values.topic}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.topic && formik.errors.topic && (
                <p className="text-sm text-red-500">{formik.errors.topic}</p>
              )}
            </div>
  
            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500">{formik.errors.description}</p>
              )}
            </div>
  
            {/* Add Q&A Section */}
            <div className="space-y-2">
              <Label>Add Questions & Answers</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Enter a question"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                />
                <Textarea
                  placeholder="Enter the answer"
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                />
                <Button type="button" onClick={addQuestion}>
                  Add Q&A
                </Button>
              </div>
  
              {/* Validation error for questions */}
              {formik.errors.questions &&
                typeof formik.errors.questions === "string" && (
                  <p className="text-sm text-red-500">{formik.errors.questions}</p>
                )}
  
              {/* Display added Q&As */}
              {formik.values.questions.length > 0 && (
                <div className="mt-4 space-y-4 max-h-48 overflow-y-auto border rounded-md p-2 bg-gray-50">
                  {formik.values.questions.map((q, i) => (
                    <div
                      key={i}
                      className="border-b pb-2 last:border-b-0 last:pb-0 relative"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        Q{i + 1}: {q.question}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">A: {q.answer}</p>
                      <button
                        type="button"
                        onClick={() => removeQuestion(i)}
                        className="absolute top-0 right-0 text-sm text-red-500"
                      >
                        ✖
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
  
            {/* Submit Button */}
            <Button type="submit" className="w-full bg-blue-600 text-white">
              {mode === "edit" ? "Update FAQ" : "Submit FAQ"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default AddEditFaqModal;
  