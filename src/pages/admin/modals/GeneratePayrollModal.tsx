import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
// import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useState } from "react";
import { PlusCircle } from "lucide-react";

interface GeneratePayrollModalProps {
  onGenerate: (employeeId?: string) => void;
  isGenerating: boolean;
}

const GeneratePayrollModal = ({onGenerate, isGenerating }: GeneratePayrollModalProps) => {
//   const [employeeId, setEmployeeId] = useState("");
  const [isBulk, setIsBulk] = useState(true);

  const handleGenerate = () => {
    onGenerate();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 text-white">
          <PlusCircle size={16} className="mr-2" />
          Generate Payroll
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Payroll</DialogTitle>
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
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
              />
            </div>
          )} */}
          <div className="pt-4">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "Generating..." : "Generate Payroll"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneratePayrollModal;