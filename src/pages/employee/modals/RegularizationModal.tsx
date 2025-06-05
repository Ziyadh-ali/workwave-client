import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  selectedDate: Date | null;
}

const RegularizationModal: React.FC<Props> = ({ open, onClose, onSubmit, selectedDate }) => {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason.trim());
      setReason("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regularization Request</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 mb-2">
          Request regularization for <strong>{selectedDate?.toDateString()}</strong>
        </p>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter your reason..."
          rows={4}
        />
        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegularizationModal;
