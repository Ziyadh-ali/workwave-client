import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import ScheduleMeetingModal from "../modals/ScheduleMeetingModal";
import { changeMeetingStatusService, deleteMeetingService, editMeetingService, getMeetingsService, scheduleMeetingService } from "../../../services/user/userService";
import { ErrorBoundary } from "react-error-boundary";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import AddMeetingLinkModal from "../modals/AddLinkModal";
import EditMeetingModal from "../modals/editMeetingModal";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/SidebarComponent";
import { Header } from "../../../components/HeaderComponent";
import { useSocket } from "../../../context/SocketContext";

interface Meeting {
    _id: string;
    title: string;
    description: string;
    date: string;
    startTime: string; // expected in "HH:mm" 24hr format
    duration: number;
    status: "completed" | "upcoming";
    createdBy: {
        _id: string;
        fullName: string;
        email: string;
    };
    link?: string;
}

const MeetingPage = () => {
    const [openEditModal, setOpenEditModal] = useState(false);
    const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { employee } = useSelector((state: RootState) => state.employee);
    const [openModal, setOpenModal] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const { sendMeetingScheduled } = useSocket();

    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                const response = await getMeetingsService(employee ? employee._id.toString() : "");
                setMeetings(response.meetings);
            } catch (error) {
                console.log(error);
            }
        };
        fetchMeetings();
    }, [employee, location]);

    const handleMeetingSchedule = async (
        meeting: {
            title: string;
            description: string;
            date: string;
            startTime: string;
            duration: number;
        },
        filter: {
            role?: string;
            department?: string;
        }
    ) => {
        const response = await scheduleMeetingService(meeting, filter);
        sendMeetingScheduled({
            participants: response.createdMeeting.participants,
            meetingId: response.createdMeeting._id,
            meetingTitle: response.createdMeeting.title,
            scheduledBy: response.createdMeeting.createdBy,
            time: response.createdMeeting.startTime
        });
    };

    const handleMarkAsCompleted = async (meetingId: string) => {
        try {
            const response = await changeMeetingStatusService(meetingId);
            enqueueSnackbar(response.message, { variant: "success" });
            navigate("/meeting");
        } catch (error) {
            enqueueSnackbar((error instanceof AxiosError) ? error.response?.data?.message : "Error in changing status", { variant: "error" });
        }
    };

    const handleEditMeeting = (meeting: Meeting) => {
        setMeetingToEdit(meeting);
        setOpenEditModal(true);
    };

    const handleDeleteMeeting = async (meetingId: string) => {
        try {
            const response = await deleteMeetingService(meetingId);
            enqueueSnackbar(response.message, { variant: "success" });
            navigate("/meeting");
        } catch (error) {
            enqueueSnackbar((error instanceof AxiosError) ? error.response?.data?.message : "Error in changing status", { variant: "error" });
        }
    };

    const happenedMeetings = meetings.filter((m) => m.status === "completed");
    const upcomingMeetings = meetings.filter((m) => m.status === "upcoming");

    const renderMeetingCard = (meeting: Meeting) => {
        const isHost = employee?._id === meeting.createdBy._id;

        // Proper time parsing
        const [hours, minutes] = meeting.startTime.split(":").map(Number);
        const meetingStart = new Date(meeting.date);
        meetingStart.setHours(hours, minutes, 0, 0);
        const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);

        const isMeetingOver = new Date() > meetingEnd;

        return (
            <Card key={meeting._id} className="shadow-md border relative">
                <CardHeader className="relative">
                    <CardTitle className="text-lg font-semibold text-gray-800">{meeting.title}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                        {new Date(meeting.date).toISOString().split("T")[0]} | {meeting.startTime} | {meeting.duration} min
                    </p>

                    {isHost && meeting.status !== "completed" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="absolute top-4 right-4 p-1 rounded-md hover:bg-gray-100">
                                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem onClick={() => handleEditMeeting(meeting)}>Edit</DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleDeleteMeeting(meeting._id)}
                                    className="text-red-600 focus:text-red-600"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </CardHeader>

                <CardContent>
                    {meeting.description && (
                        <p className="text-gray-600 mb-3 text-sm line-clamp-3">{meeting.description}</p>
                    )}

                    {meeting.status === "completed" && (
                        <Button className="w-full bg-gray-700 text-white mb-2" disabled>
                            Completed
                        </Button>
                    )}

                    {meeting.status === "upcoming" && (
                        <>
                            {meeting.link ? (
                                <Button
                                    className="w-full bg-green-600 text-white mb-2"
                                    onClick={() => window.open(meeting.link, "_blank")}
                                >
                                    Join Now
                                </Button>
                            ) : isHost ? (
                                <AddMeetingLinkModal meetingId={meeting._id} />
                            ) : (
                                <p className="text-sm text-gray-500 mb-2">Upcoming (Waiting for host to add link)</p>
                            )}

                            {isHost && isMeetingOver && (
                                <Button
                                    className="w-full bg-blue-600 text-white"
                                    onClick={() => handleMarkAsCompleted(meeting._id)}
                                >
                                    Mark as Completed
                                </Button>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <ErrorBoundary
            fallback={<div>Something went wrong</div>}
            onError={(error, info) => {
                console.error("Error caught by boundary:", error);
                console.error("Component stack:", info);
            }}
        >
            <div className="flex min-h-screen bg-gray-100">
                <Sidebar role="employee" />
                <div className="flex-1 p-6">
                    <Header role="employee" heading="Meeting Details" />
                    <div className="flex justify-between items-center mb-6">
                        <div />
                        <Button onClick={() => setOpenModal(true)} className="bg-blue-600 text-white">
                            Schedule Meeting
                        </Button>
                        <ScheduleMeetingModal
                            open={openModal}
                            onClose={() => setOpenModal(false)}
                            onAdd={handleMeetingSchedule}
                        />
                    </div>

                    <h2 className="text-xl font-semibold mb-3">Upcoming Meetings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {upcomingMeetings.length > 0 ? (
                            upcomingMeetings.map(renderMeetingCard)
                        ) : (
                            <p className="text-gray-500 col-span-full">No upcoming meetings</p>
                        )}
                    </div>

                    <h2 className="text-xl font-semibold mb-3">Happened Meetings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {happenedMeetings.length > 0 ? (
                            happenedMeetings.map(renderMeetingCard)
                        ) : (
                            <p className="text-gray-500 col-span-full">No past meetings</p>
                        )}
                    </div>
                </div>
            </div>
            {meetingToEdit && (
                <EditMeetingModal
                    open={openEditModal}
                    onClose={() => setOpenEditModal(false)}
                    meeting={meetingToEdit}
                    onUpdate={async (updatedMeeting: {
                        _id: string;
                        title: string;
                        description: string;
                        date: string;
                        startTime: string;
                        duration: number;
                    },
                        filter: {
                            role?: string;
                            department?: string;
                        }) => {
                        await editMeetingService(employee?._id ? employee?._id : "", updatedMeeting, filter)
                        setOpenEditModal(false);
                    }}
                />
            )}
        </ErrorBoundary>
    );
};

export default MeetingPage;
