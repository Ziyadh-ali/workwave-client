import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { addFaqService, deleteFaqService, editFaqService, getFaqService, getHrQuestionService, getMyQuestionsService, submitQuestionService } from "../services/user/userService";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ViewFaqModal } from "../pages/employee/modals/ViewFaqModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import AddEditFaqModal from "../pages/employee/modals/AddFaqModal";
import { useLocation, useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { AxiosError } from "axios";
import { useConfirmModal } from "./useConfirm";
import { Header } from "./HeaderComponent";
import Sidebar from "./SidebarComponent";
import { IQuestion } from "../utils/Interfaces/interfaces";
import { SubmitQuestionModal } from "../pages/employee/modals/SubmitQuestionModal";
import { getQuestionsForAdminService } from "../services/admin/adminService";
import AnswerQuestionModal from "../pages/employee/modals/AnswerQuestionModal";

interface FAQCategory {
    _id?: string;
    topic: string;
    description: string;
    questions: {
        question: string;
        answer: string;
    }[];
}

interface HelpCenterPageProps {
    role: "admin" | "employee";
}

const HelpCenterPage: React.FC<HelpCenterPageProps> = ({ role }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { employee } = useSelector((state: RootState) => state.employee);
    const [searchQuery, setSearchQuery] = useState("");
    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [faqs, setFaqs] = useState<FAQCategory[]>([]);
    const [selectedFaq, setSelectedFaq] = useState<FAQCategory | null>(null);
    const [editabeFaq, setEditabeFaq] = useState<FAQCategory>();
    const [openFaqModal, setOpenFaqModal] = useState(false);
    const { confirm, ConfirmModalComponent } = useConfirmModal();
    const [openQuestionModal, setOpenQuestionModal] = useState(false);
    const [openAnswerModal, setOpenAnswerModal] = useState<boolean>(false);
    const [myQuestions, setMyQuestions] = useState<IQuestion[]>([]);
    const [userQuestions, setUserQuestions] = useState<IQuestion[]>([]);
    const [questionToAnswer, setQuestionToAnswer] = useState<IQuestion | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            const response = await getFaqService(searchQuery);
            setFaqs(response.faqs);
        };

        const fetchMyQuestions = async () => {
            if (role === "employee" && employee?.role === "developer") {
                const response = await getMyQuestionsService(employee._id || "");
                setMyQuestions(response.questions);
            }
        };

        const fetchUserQuestions = async () => {
            try {
                if (role === "admin") {
                    const response = await getQuestionsForAdminService();
                    setUserQuestions(response.questions);
                } else if (role === "employee" && employee?.role === "hr") {
                    const response = await getHrQuestionService();
                    console.log(response)
                    setUserQuestions(response.questions);
                }
            } catch (error) {
                console.error("Error fetching user questions:", error);
            }
        };

        fetchFaqs();
        fetchMyQuestions();
        fetchUserQuestions();
    }, [searchQuery, location]);

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        const trimmed = text.slice(0, maxLength);
        return trimmed.slice(0, trimmed.lastIndexOf(" ")) + "...";
    };

    const handleQuestionSubmit = async (question: string) => {
        await submitQuestionService(question);
        navigate(role === "employee" ? "/help-desk" : "/admin/help");
    };

    const handleAddFaq = async (data: {
        topic: string;
        description: string;
        questions: {
            question: string;
            answer: string;
        }[];
    }) => {
        await addFaqService(data);
        const response = await getFaqService(searchQuery);
        setFaqs(response.faqs);
        navigate(role === "employee" ? "/help-desk" : "/admin/help");
    };

    const handleEditFaqModal = (faqData: FAQCategory) => {
        setOpenEditModal(true);
        setEditabeFaq(faqData);
    };

    const handleEditFaq = async (id: string, faqData: FAQCategory) => {
        if (!id) return;
        await editFaqService(id, faqData);
        const response = await getFaqService(searchQuery);
        setFaqs(response.faqs);
        navigate(role === "employee" ? "/help-desk" : "/admin/help");
    };

    const handleViewFaqs = (faq: FAQCategory) => {
        setSelectedFaq(faq);
        setOpenFaqModal(true);
    };

    const handleDeleteFaqs = async (faq: FAQCategory) => {
        try {
            const faqId = faq._id;
            if (!faqId) return;
            const response = await deleteFaqService(faqId);
            navigate(role === "employee" ? "/help-desk" : "/admin/help");
            enqueueSnackbar(response.message, { variant: "success" });
            const updatedFaqs = await getFaqService(searchQuery);
            setFaqs(updatedFaqs.faqs);
        } catch (error) {
            enqueueSnackbar(
                error instanceof AxiosError ? error.response?.data.message : "Error in delete",
                { variant: "error" }
            );
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar role={role} />

            <div className="flex-1 p-6 space-y-6">
                <Header heading="FAQs" role={role} />

                {/* Search and Add FAQ Button */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                    <Input
                        type="text"
                        placeholder="Search in FAQs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-1/2"
                    />

                    {(role === "admin" || (role === "employee" && employee?.role !== "developer")) && (
                        <Button className="bg-blue-600 text-white" onClick={() => setOpenAddModal(true)}>
                            Add FAQ
                        </Button>
                    )}
                </div>

                {/* FAQ Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {faqs.map((category) => (
                        <Card key={category._id} className="shadow-sm relative">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-800 pr-10">
                                    {category.topic}
                                </CardTitle>

                                {(role === "admin" || (role === "employee" && employee?.role !== "developer")) && (
                                    <div className="absolute top-4 right-4">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-5 w-5 text-gray-500" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44 shadow-lg">
                                                <DropdownMenuItem onClick={() => handleEditFaqModal(category)}>
                                                    ✏️ Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        confirm({
                                                            title: "Delete FAQ?",
                                                            message: "Are you sure you want to delete this FAQ?",
                                                            onConfirm: () => handleDeleteFaqs(category),
                                                        })
                                                    }
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    🗑️ Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm mb-2">{category.description}</p>

                                {category.questions[0] && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium text-gray-700">
                                            Q: {category.questions[0].question}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            A: {truncateText(category.questions[0].answer, 40)}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={() => handleViewFaqs(category)}
                                    className="w-full bg-blue-600 text-white"
                                >
                                    View FAQs
                                </Button>

                            </CardContent>
                        </Card>
                    ))}
                </div>

                {(role === "admin" || (role === "employee" && employee?.role === "hr")) && (
                    <div className="border-t border-gray-300 pt-8 mt-10 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-800">Submitted Questions</h2>
                        {userQuestions && userQuestions?.length === 0 ? (
                            <p className="text-sm text-gray-500">No questions submitted yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {userQuestions?.map((q) => (
                                    <Card key={q._id}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{q.question}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {q.isAnswered ? (
                                                <p className="text-sm text-gray-700">
                                                    <strong>Answer:</strong> {q.answer}
                                                </p>
                                            ) : (
                                                <>
                                                    <p className="text-sm text-yellow-600">Pending answer...</p>
                                                    <Button
                                                        onClick={() => {
                                                            setQuestionToAnswer(q); // This will open the modal to answer the question
                                                            setOpenAnswerModal(true);
                                                        }}
                                                        className="mt-2 bg-blue-600 text-white"
                                                    >
                                                        Answer the Question
                                                    </Button>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Developer Questions Section */}
                {role === "employee" && employee?.role === "developer" && (
                    <>
                        <div className="border-t border-gray-300 pt-8 mt-10 space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-800">Your Submitted Questions</h2>
                                <Button className="bg-blue-600 text-white" onClick={() => setOpenQuestionModal(true)}>
                                    Ask a Question
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myQuestions.map((q) => (
                                    <Card key={q._id}>
                                        <CardHeader>
                                            <CardTitle className="text-base">{q.question}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {q.isAnswered ? (
                                                <p className="text-sm text-gray-700">
                                                    <strong>Answer:</strong> {q.answer}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-yellow-600">Pending answer...</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <SubmitQuestionModal
                            open={openQuestionModal}
                            onClose={() => setOpenQuestionModal(false)}
                            onSubmit={handleQuestionSubmit}
                        />
                    </>
                )}

                {/* Modals */}
                <AddEditFaqModal
                    mode="add"
                    onSubmit={handleAddFaq}
                    onClose={() => setOpenAddModal(false)}
                    open={openAddModal}
                />

                <AddEditFaqModal
                    mode="edit"
                    initialData={editabeFaq}
                    onSubmit={(data, id) => (id ? handleEditFaq(id, data) : Promise.resolve())}
                    onClose={() => setOpenEditModal(false)}
                    open={openEditModal}
                />

                <ViewFaqModal
                    faq={selectedFaq}
                    onClose={() => setOpenFaqModal(false)}
                    open={openFaqModal}
                />

                {questionToAnswer &&
                    <AnswerQuestionModal
                        open={openAnswerModal}
                        onClose={() => setOpenAnswerModal(false)}
                        questionId={questionToAnswer._id}
                        questionText={questionToAnswer.question}
                        userRole={role}
                        existingAnswer={questionToAnswer.answer}
                    />
                }


                <ConfirmModalComponent />
            </div>
        </div>
    );
};

export default HelpCenterPage;