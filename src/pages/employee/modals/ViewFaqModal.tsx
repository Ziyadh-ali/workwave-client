import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogPortal,
    DialogOverlay,
} from "../../../components/ui/dialog";

interface FaqData {
    _id?: string;
    topic: string;
    description: string;
    questions: {
      question: string;
      answer: string;
    }[];
  }

export const ViewFaqModal = ({
    open,
    onClose,
    faq,
}: {
    open: boolean;
    onClose: () => void;
    faq: FaqData | null;
}) => {
    if (!faq) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogPortal>
                {/* ⛔️ Default is bg-black/50 — override it */}
                <DialogOverlay className="bg-transparent" />

                <DialogContent className="rounded-xl max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{faq.topic}</DialogTitle>
                        <p className="text-sm text-gray-500">{faq.description}</p>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                        {faq.questions.map((q, index) => (
                            <div key={index}>
                                <p className="font-semibold">{q.question}</p>
                                <p className="text-sm text-gray-600">{q.answer}</p>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};


