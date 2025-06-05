import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { useState } from "react";

interface SubmitQuestionModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (question: string) => void;
}

export const SubmitQuestionModal: React.FC<SubmitQuestionModalProps> = ({ open, onClose, onSubmit }) => {
    const [question, setQuestion] = useState("");

    const handleSubmit = () => {
        if (question.trim()) {
            onSubmit(question);
            setQuestion("");
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit a Question</DialogTitle>
                </DialogHeader>
                <Textarea
                    placeholder="Type your question..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="mb-4"
                />
                <Button onClick={handleSubmit} className="bg-blue-600 text-white w-full">
                    Submit
                </Button>
            </DialogContent>
        </Dialog>
    );
};
