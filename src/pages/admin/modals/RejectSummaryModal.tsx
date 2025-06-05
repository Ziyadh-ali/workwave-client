import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Textarea } from "../../../components/ui/textarea";
import { useSnackbar } from "notistack";
import { XCircle } from "lucide-react";

interface RejectSummaryModalProps {
  onReject: (reason: string) => void;
}

const RejectSummaryModal = ({ onReject }: RejectSummaryModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleReject = async () => {
    if (!reason.trim()) {
      enqueueSnackbar("Please provide a rejection reason", { variant: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(reason);
      onReject(reason);
      setIsOpen(false);
      enqueueSnackbar("Summary rejected successfully", { variant: "success" });
    } catch (error) {
      console.error("Error rejecting summary:", error);
      enqueueSnackbar("Failed to reject summary", { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <XCircle size={16} className="mr-1" /> Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Attendance Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter rejection reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Confirm Reject"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RejectSummaryModal;