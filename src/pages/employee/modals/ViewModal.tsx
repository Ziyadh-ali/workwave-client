import { FC } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";

interface Member {
    _id: string;
    fullName: string;
}

interface ViewMembersModalProps {
    isOpen: boolean;
    members: Member[];
    onClose: () => void;
}

const ViewMembersModal: FC<ViewMembersModalProps> = ({ isOpen, members, onClose }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Project Members</DialogTitle>
                </DialogHeader>

                <div className="max-h-64 overflow-y-auto space-y-2 p-2 border rounded">
                    {members.length === 0 ? (
                        <p className="text-gray-500">No members assigned to this project.</p>
                    ) : (
                        members.map((member) => (
                            <div key={member._id} className="border-b pb-1">
                                {member.fullName}
                            </div>
                        ))
                    )}
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewMembersModal;
