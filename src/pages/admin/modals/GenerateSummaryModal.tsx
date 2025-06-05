import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
// import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
// import { useSnackbar } from "notistack";
import { FileText } from "lucide-react";

interface GenerateSummaryModalProps {
  month: number;
  year: number;
  onGenerate: (month: number, year: number, employeeId?: string) => void;
  isGenerating: boolean;
}

const GenerateSummaryModal = ({ 
  month, 
  year, 
  onGenerate, 
  isGenerating 
}: GenerateSummaryModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
//   const [employeeId, setEmployeeId] = useState("");
  const [isBulk, setIsBulk] = useState(true);
//   const { enqueueSnackbar } = useSnackbar();

  const handleGenerate = () => {

    onGenerate(month, year,);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <FileText size={16} className="mr-2" /> Generate Summary
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Attendance Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="bulk"
              checked={isBulk}
              onChange={() => setIsBulk(true)}
            />
            <Label htmlFor="bulk">Generate for all employees</Label>
          </div>
          {/* <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="single"
              checked={!isBulk}
              onChange={() => setIsBulk(false)}
            />
            <Label htmlFor="single">Generate for specific employee</Label>
          </div>
          {!isBulk && (
            <Input
              placeholder="Enter Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
          )} */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateSummaryModal;