import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { MessageCircle, Users, Send, Search, Plus, ArrowLeft, Image, Video, Paperclip, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "../../../components/ui/sheet";
import { useSocket } from "../../../context/SocketContext";
import { useSelector } from "react-redux";
import { IMessage } from "../../../utils/Interfaces/interfaces";
import { RootState } from "../../../store/store";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../../../components/ui/dropdown-menu";
import { useConfirmModal } from "../../../components/useConfirm";
import GroupFormModal, { GroupFormValues } from "../modals/GroupModal";
import { AddMembersModal } from "../modals/AddMembersModal";
import { enqueueSnackbar } from "notistack";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";

interface ChatRoom {
    id: string;
    name: string;
    type: "personal" | "group";
    lastMessage: string;
    timestamp: string;
    participants?: string[];
    profilePic?: string;
    status?: "online" | "offline" | "away";
    messages: IMessage[];
    createdBy?: string;
}

const Chat = () => {
    const navigate = useNavigate();
    const { socket, employees, fetchEmployees, onlineUsers, fetchUserGroups, userGroups, createGroup, addGroupMembers, removeGroupMember, deleteGroup, fetchPrivateMessages, fetchRoomMessages, sendPrivateMessage, sendRoomMessage, privateMessages, roomMessages, connectionStatus } = useSocket();
    const { employee } = useSelector((state: RootState) => state.employee);
    const [activeChat, setActiveChat] = useState<string>("");
    const [chatType, setChatType] = useState<"personal" | "group">("personal");
    const [newMessage, setNewMessage] = useState("");
    const [showMediaOptions, setShowMediaOptions] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<{ url: File, type: "image" | "video" | "document" } | null>(null);
    const [typingUsers, setTypingUsers] = useState<{ userId: string, roomId?: string }[]>([]);
    const [personalChats, setPersonalChats] = useState<ChatRoom[]>([]);
    const [groupChats, setGroupChats] = useState<ChatRoom[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
    const [removeMemberModalOpen, setRemoveMemberModalOpen] = useState(false);
    const [memberInput, setMemberInput] = useState("");
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [addMembersModalOpen, setAddMembersModalOpen] = useState(false);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { confirm, ConfirmModalComponent } = useConfirmModal();

    // Log socket connection status
    useEffect(() => {
        console.log("Socket connection status:", connectionStatus);
    }, [connectionStatus]);

    // Fetch employees and groups on mount
    useEffect(() => {
        if (!employee?._id) {
            console.warn("No employee ID found, cannot fetch data");
            return;
        }

        fetchEmployees();
        fetchUserGroups(employee._id);
    }, [employee?._id, fetchEmployees, fetchUserGroups]);


    // Initialize personal chats
    useEffect(() => {
        if (!employees.length || !employee?._id) {
            console.warn("No employees or employee ID, skipping personal chats initialization");
            setPersonalChats([]);
            return;
        }

        const initialPersonalChats: ChatRoom[] = employees
            .filter(emp => emp._id !== employee._id)
            .map(emp => ({
                id: emp._id!,
                name: `${emp.fullName}`,
                type: "personal",
                lastMessage: "",
                timestamp: "",
                profilePic: emp.profilePic || `${emp.fullName.charAt(0)}`,
                status: onlineUsers.includes(emp._id) ? "online" : "offline",
                messages: [],
            }));

        setPersonalChats(initialPersonalChats);

        if (initialPersonalChats.length > 0 && !activeChat) {
            setActiveChat(initialPersonalChats[0].id);
        }
    }, [employees, employee?._id, onlineUsers, activeChat]);

    // Update online status
    useEffect(() => {
        setPersonalChats(prev => prev.map(chat => ({
            ...chat,
            status: onlineUsers.includes(chat.id) ? "online" : "offline"
        })));
    }, [onlineUsers]);

    // Initialize group chats
    useEffect(() => {
        const initialGroupChats = userGroups.map(group => ({
            id: String(group._id),
            name: group.name,
            type: "group" as const,
            lastMessage: "",
            timestamp: "",
            participants: [`${group.members.length} members`],
            profilePic: group.name.charAt(0).toUpperCase(),
            messages: [],
            createdBy: group.createdBy
        }));

        setGroupChats(initialGroupChats);
    }, [userGroups]);

    useEffect(() => {
        if (!activeChat || !employee?._id) {
            console.warn("No active chat or employee ID, skipping message fetch");
            return;
        }

        if (chatType === "personal") {
            fetchPrivateMessages(employee._id, activeChat);
        } else {
            fetchRoomMessages(activeChat);
        }
    }, [activeChat, chatType, employee?._id, fetchPrivateMessages, fetchRoomMessages]);

    // Socket event handlers for new messages
    useEffect(() => {
        if (!socket) {
            console.error("Socket is null, cannot listen for messages");
            return;
        }

        const handleNewPrivateMessage = (message: IMessage) => {
            setPersonalChats(prev => prev.map(chat => {
                if (message.sender._id === chat.id || message.recipient === chat.id) {
                    return {
                        ...chat,
                        lastMessage: message.content || (message.media ? `Sent ${message.media.type}` : ""),
                        timestamp: new Date(message.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                }
                return chat;
            }));
        };

        const handleNewRoomMessage = (message: IMessage) => {
            if (!message.roomId) return;

            setGroupChats(prev => prev.map(chat => {
                if (chat.id === message.roomId) {
                    return {
                        ...chat,
                        lastMessage: message.content || (message.media ? `Sent ${message.media.type}` : ""),
                        timestamp: new Date(message.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                }
                return chat;
            }));
        };

        socket.emit('newPrivateMessage', handleNewPrivateMessage);
        socket.emit('newRoomMessage', handleNewRoomMessage);

        return () => {
            socket.off('newPrivateMessage', handleNewPrivateMessage);
            socket.off('newRoomMessage', handleNewRoomMessage);
        };
    }, [socket]);

    // Join/leave group rooms
    useEffect(() => {
        if (!socket || !employee?._id || !activeChat) return;

        if (chatType === 'group') {
            socket.emit('joinRoom', activeChat, employee._id);
        }

        return () => {
            if (chatType === 'group') {
                socket.emit('leaveRoom', activeChat, employee._id);
            }
        };
    }, [socket, employee?._id, activeChat, chatType]);

    // Typing indicators
    useEffect(() => {
        if (!socket) return;

        const handleUserTyping = (userId: string) => {
            if (chatType === 'personal' && userId === activeChat) {
                setTypingUsers(prev => [...prev, { userId }]);
                setTimeout(() => {
                    setTypingUsers(prev => prev.filter(u => u.userId !== userId));
                }, 2000);
            }
        };

        const handleUserTypingRoom = (userId: string, roomId: string) => {
            if (roomId === activeChat) {
                setTypingUsers(prev => [...prev, { userId, roomId }]);
                setTimeout(() => {
                    setTypingUsers(prev => prev.filter(u => u.userId !== userId || u.roomId !== roomId));
                }, 2000);
            }
        };

        socket.on('userTyping', handleUserTyping);
        socket.on('userTypingRoom', handleUserTypingRoom);

        return () => {
            socket.off('userTyping', handleUserTyping);
            socket.off('userTypingRoom', handleUserTypingRoom);
        };
    }, [socket, activeChat, chatType]);

    // Send message
    const handleSendMessage = useCallback(async () => {
        if ((!newMessage.trim() && !selectedMedia) || !socket || !employee?._id) {
            console.warn("Cannot send message: invalid input or missing socket/employee ID");
            return;
        }
        let uploadedMedia = null;
        if (selectedMedia) {
            console.log("Uploading to Cloudinary...");
            uploadedMedia = await uploadToCloudinary(selectedMedia.url);
        }

        const messageData: Omit<IMessage, '_id' | 'createdAt'> = {
            content: newMessage,
            sender: {
                _id: employee._id,
                fullName: employee.fullName,
                email: employee.email,
                profilePic: employee.profilePic,
            },
            ...(uploadedMedia && {
                media: {
                    url: uploadedMedia.url,
                    type: uploadedMedia.type,
                }
            }),
            ...(chatType === 'personal'
                ? { recipient: activeChat }
                : { roomId: activeChat }
            )
        }

        setNewMessage(() => "");
        setSelectedMedia(() => null);
        setMediaPreview(() => null);
        setShowMediaOptions(() => false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (chatType === 'personal') {
            await sendPrivateMessage(messageData);
        } else {
            await sendRoomMessage(messageData);
        }

        // eslint-disable-next-line
    }, [newMessage, selectedMedia, socket, employee?._id, chatType, activeChat, sendPrivateMessage, sendRoomMessage]);

    const handleTyping = useCallback(() => {
        if (!socket || !employee?._id || !activeChat) return;

        if (chatType === 'personal') {
            socket.emit('typingPrivate', activeChat, employee._id);
        } else {
            socket.emit('typingRoom', activeChat, employee._id);
        }
    }, [socket, employee?._id, chatType, activeChat]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [privateMessages, roomMessages, activeChat]);

    // Sync messages with chats
    useEffect(() => {
        if (!employee?._id) return;

        setPersonalChats(prev => prev.map(chat => {
            const key = [employee._id, chat.id].sort().join('_');
            const messages = privateMessages[key] || [];
            const lastMessage = messages[messages.length - 1];
            return {
                ...chat,
                messages: chat.id === activeChat ? messages : chat.messages,
                lastMessage: lastMessage
                    ? lastMessage.content || (lastMessage.media ? `Sent ${lastMessage.media.type}` : "")
                    : "",
                timestamp: lastMessage
                    ? new Date(lastMessage.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "",
            };
        }));

        setGroupChats(prev => prev.map(chat => {
            const messages = roomMessages[chat.id] || [];
            const lastMessage = messages[messages.length - 1];
            return {
                ...chat,
                messages: chat.id === activeChat ? messages : chat.messages,
                lastMessage: lastMessage
                    ? lastMessage.content || (lastMessage.media ? `Sent ${lastMessage.media.type}` : "")
                    : "",
                timestamp: lastMessage
                    ? new Date(lastMessage.createdAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "",
            };
        }));
    }, [privateMessages, roomMessages, activeChat, chatType, employee?._id]);

    const currentChats = chatType === "personal" ? personalChats : groupChats;

    const activeRoom = currentChats.find(chat => chat.id === activeChat) || {
        id: '',
        name: 'No chat selected',
        type: 'personal',
        lastMessage: '',
        timestamp: '',
        participants: [],
        profilePic: '',
        messages: []
    };

    const isMe = (senderId: string | undefined) => {
        if (!senderId || !employee?._id) {
            console.warn(`isMe check failed: senderId=${JSON.stringify(senderId)}, employee._id=${JSON.stringify(employee?._id)}`);
            return false;
        }
        const senderStr = senderId.toString();
        const employeeIdStr = employee._id.toString();
        const result = senderStr === employeeIdStr;
        return result;
    };

    const handleChatSelect = useCallback(async (chatId: string) => {
        setActiveChat(chatId);

        if (!employee?._id) return;

        try {
            if (chatType === "personal") {
                await fetchPrivateMessages(employee._id, chatId);
            } else {
                await fetchRoomMessages(chatId);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            enqueueSnackbar("Failed to fetch messages", { variant: "error" });
        }
    }, [chatType, employee?._id, fetchPrivateMessages, fetchRoomMessages]);

    const handleGoBack = () => navigate(-1);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileType = file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' : 'document';


        const previewUrl = URL.createObjectURL(file);
        setMediaPreview(previewUrl);

        const fileUrl = file;

        setSelectedMedia({ url: fileUrl, type: fileType });
    };

    useEffect(() => {
        return () => {
            if (mediaPreview) {
                URL.revokeObjectURL(mediaPreview);
            }
        };
    }, [mediaPreview]);

    const handleMediaButtonClick = (type: 'image' | 'video' | 'document') => {
        if (fileInputRef.current) {
            fileInputRef.current.accept =
                type === 'image' ? 'image/*' :
                    type === 'video' ? 'video/*' :
                        '.pdf,.doc,.docx,.xls,.xlsx,.txt';
            fileInputRef.current.click();
        }
    };

    const formatMessageTime = (date?: Date | string) => {
        if (!date) return '';
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleAddGroupMembers = async (userIds: string[]) => {
        const group = groupChats.find((g) => g.id === selectedGroupId);
        if (group?.createdBy !== employee?._id) {
            enqueueSnackbar("Only the group creator can add members.", { variant: "error" });
            return;
        }

        try {
            await addGroupMembers(selectedGroupId!, userIds);
            enqueueSnackbar("Members added successfully.", { variant: "success" });
            setAddMembersModalOpen(false);
        } catch (error) {
            console.error("Error adding members:", error);
            enqueueSnackbar("Failed to add members.", { variant: "error" });
        }
    };

    const employeesWithProfilePic = employees.map((emp) => ({
        ...emp,
        profilePic: emp.profilePic || "",
    }));

    const handleRemoveGroupMember = async () => {
        const group = groupChats.find((g) => g.id === selectedGroupId);
        if (group?.createdBy !== employee?._id) {
            enqueueSnackbar("Only the group creator can remove members.", { variant: "error" });
            return;
        }

        if (!memberInput.trim() || !selectedGroupId) return;

        try {
            await removeGroupMember(selectedGroupId, memberInput);
            enqueueSnackbar("Member removed successfully.", { variant: "success" });
            setRemoveMemberModalOpen(false);
            setMemberInput("");
        } catch (error) {
            console.error("Error removing member:", error);
            enqueueSnackbar("Failed to remove member", { variant: "error" });
        }
    };

    const handleDeleteGroup = (groupId: string) => {
        const group = groupChats.find((g) => g.id === groupId);
        if (group?.createdBy !== employee?._id) {
            enqueueSnackbar("Only the group creator can delete the group.", { variant: "error" });
            return;
        }

        confirm({
            title: "Delete Group",
            message: "Are you sure you want to delete this group?",
            onConfirm: async () => {
                try {
                    await deleteGroup(groupId);
                    enqueueSnackbar("Group deleted successfully.", { variant: "success" });
                } catch (error) {
                    console.error("Error deleting group:", error);
                    enqueueSnackbar("Failed to delete group.", { variant: "error" });
                }
            },
        });
    };

    const getAvatarFallback = (chat: ChatRoom) => {
        if (chat.profilePic) return chat.profilePic;
        if (chat.name) return chat.name.charAt(0).toUpperCase();
        return 'U';
    };

    const handleCreateGroupSubmit = async (values: GroupFormValues) => {
        if (!employee?._id) return;

        try {
            await createGroup({
                name: values.name,
                members: values.members,
                createdBy: employee._id,
            });
            enqueueSnackbar("New Group Created", { variant: "success" });
            setGroupModalOpen(false);
        } catch (error) {
            console.error("Error creating group:", error);
            enqueueSnackbar(error instanceof Error ? error.message : "Failed to create group", { variant: "error" });
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar */}
            <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" className="md:hidden p-2 -ml-2">
                            <MessageCircle className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-full sm:max-w-md">
                        <div className="flex flex-col h-full bg-white">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
                                </div>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <Button
                                        variant={chatType === "personal" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setChatType("personal")}
                                        className={`flex-1 ${chatType === "personal" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Personal
                                    </Button>
                                    <Button
                                        variant={chatType === "group" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setChatType("group")}
                                        className={`flex-1 ${chatType === "group" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        Groups
                                    </Button>
                                </div>
                            </div>
                            <div className="p-4 border-b border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Search conversations..."
                                        className="pl-10 bg-gray-50 border-gray-200"
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1 overflow-y-auto">
                                {currentChats.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">
                                        {chatType === "personal"
                                            ? "No employees available. Try refreshing or check your connection."
                                            : "No groups available. Create a new group to start chatting."}
                                    </div>
                                ) : (
                                    currentChats.map((chat) => (
                                        <div
                                            key={chat.id}
                                            onClick={() => handleChatSelect(chat.id)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeChat === chat.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <Avatar className="w-12 h-12">
                                                        <AvatarImage src="" />
                                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                                            {getAvatarFallback(chat)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {chat.type === "personal" && chat.status && (
                                                        <span
                                                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white 
                                                                ${chat.status === 'online' ? 'bg-green-500' : chat.status === 'away' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                                                        ></span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                                                        <span className="text-xs text-gray-500">{chat.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </ScrollArea>
                            {chatType === "group" && (
                                <div className="p-4 border-t border-gray-200">
                                    <Button onClick={() => setGroupModalOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Group
                                    </Button>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <div className="md:block w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
                        <Button variant="outline" size="icon" onClick={handleGoBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <Button
                            variant={chatType === "personal" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setChatType("personal")}
                            className={`flex-1 ${chatType === "personal" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Personal
                        </Button>
                        <Button
                            variant={chatType === "group" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setChatType("group")}
                            className={`flex-1 ${chatType === "group" ? "bg-blue-600 text-white" : "text-gray-600"}`}
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Groups
                        </Button>
                    </div>
                </div>
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search conversations..." className="pl-10 bg-gray-50 border-gray-200" />
                    </div>
                </div>
                <ScrollArea className="flex-1 overflow-y-auto">
                    {currentChats.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            {chatType === "personal"
                                ? "No employees available. Try refreshing or check your connection."
                                : "No groups available. Create a new group to start chatting."}
                        </div>
                    ) : (
                        currentChats.map((chat) => (
                            <div
                                key={chat.id}
                                onClick={() => handleChatSelect(chat.id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${activeChat === chat.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <Avatar className="w-12 h-12">
                                            <AvatarImage src={chat.profilePic || ""} />
                                            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                                {getAvatarFallback(chat)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {chat.type === "personal" && chat.status && (
                                            <span
                                                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white 
                                                    ${chat.status === 'online' ? 'bg-green-500' : chat.status === 'away' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                                            ></span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                                            <span className="text-xs text-gray-500">{chat.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                                        {chat.type === "group" && chat.participants && (
                                            <p className="text-xs text-gray-500 mt-1">{chat.participants[0]}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </ScrollArea>
                {chatType === "group" && (
                    <div className="p-4 border-t border-gray-200">
                        <Button onClick={() => setGroupModalOpen(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            New Group
                        </Button>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Button variant="ghost" size="icon" onClick={handleGoBack} className="md:hidden">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={activeRoom.profilePic || ""} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                {getAvatarFallback(activeRoom)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold text-gray-900">{activeRoom?.name || 'No chat selected'}</h2>
                            {activeRoom?.type === "group" && (
                                <p className="text-sm text-gray-600">{activeRoom.participants?.[0]}</p>
                            )}
                        </div>
                    </div>
                    {activeRoom?.type === "group" && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Manage Group
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {activeRoom.createdBy === employee?._id && (
                                    <>
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedGroupId(activeRoom.id);
                                            setAddMembersModalOpen(true);
                                        }}>
                                            Add Members
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedGroupId(activeRoom.id);
                                            setRemoveMemberModalOpen(true);
                                        }}>
                                            Remove Member
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteGroup(activeRoom.id)}>
                                            Delete Group
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div className="flex flex-col space-y-4">
                        {(chatType === "personal"
                            ? privateMessages[[employee?._id, activeChat].sort().join('_')] || []
                            : roomMessages[activeChat] || []
                        ).map((message) => {
                            return (
                                <div
                                    key={message._id || `${message.sender._id}-${message.createdAt?.toString()}`}
                                    className={`flex ${isMe(message.sender._id) ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex ${isMe(message.sender._id) ? "flex-row-reverse" : "flex-row"} items-end space-x-2`}>
                                        {!isMe(message.sender._id) && (
                                            <Avatar className="w-8 h-8 ml-2">
                                                {message.sender.profilePic && (
                                                    <img
                                                        src={message.sender.profilePic}
                                                        alt={message.sender.fullName}
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                )}
                                                {!message.sender.profilePic && (
                                                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                                        {message.sender.fullName.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                        )}
                                        <Card
                                            className={`p-2 max-w-xs sm:max-w-sm md:max-w-md ${isMe(message.sender._id)
                                                ? "bg-blue-600 text-white ml-2"
                                                : "bg-white border border-gray-200 mr-2"
                                                }`}
                                        >
                                            <div className="flex flex-col gap-0.5">
                                                {message.media && (
                                                    <div>
                                                        {message.media.type === "image" && (
                                                            <img
                                                                src={message.media.url}
                                                                alt="Image"
                                                                className="rounded-md max-w-full max-h-60 object-contain mb-1"
                                                            />
                                                        )}
                                                        {message.media.type === "video" && (
                                                            <div className="relative bg-black rounded-md mb-1">
                                                                <video
                                                                    src={message.media.url}
                                                                    controls
                                                                    className="rounded-md max-w-full max-h-60 object-contain opacity-80"
                                                                />
                                                            </div>
                                                        )}
                                                        {message.media.type === "document" && message.media.url && (
                                                            <a
                                                                href={message.media.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`flex items-center space-x-2 bg-gray-100 p-2 rounded-md mb-1 hover:bg-gray-200 transition-colors ${isMe(message.sender._id) ? "text-white" : "text-gray-700"
                                                                    }`}
                                                            >
                                                                <Paperclip className={`h-4 w-4 ${isMe(message.sender._id) ? "text-white" : "text-gray-500"}`} />
                                                                <span className="text-sm underline cursor-pointer">
                                                                    Document
                                                                </span>
                                                            </a>
                                                        )}

                                                    </div>
                                                )}

                                                {!isMe(message.sender._id) && message.sender.fullName && (
                                                    <span className="text-xs font-medium text-gray-600 capitalize">
                                                        {message.sender.fullName}
                                                    </span>
                                                )}
                                                {isMe(message.sender._id) && (
                                                    <span className="text-xs font-medium text-white-600 capitalize">
                                                        Me
                                                    </span>
                                                )}

                                                {message.content && (
                                                    <p className="text-sm leading-snug">{message.content}</p>
                                                )}

                                                <p
                                                    className={`text-[10px] mt-0.5 ${isMe(message.sender._id) ? "text-blue-100" : "text-gray-500"
                                                        }`}
                                                >
                                                    {formatMessageTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </Card>


                                    </div>
                                </div>
                            );
                        })}
                        {typingUsers.some(u => chatType === 'group' ? u.roomId === activeChat : u.userId === activeChat) && (
                            <div className="flex justify-start">
                                <div className="flex items-end space-x-2">
                                    {chatType === 'personal' && (
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                                {getAvatarFallback(activeRoom)}
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <Card className="p-3 max-w-xs bg-white border border-gray-200">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Selected Media Preview */}
                {(selectedMedia && mediaPreview) && (
                    <div className="p-2 border-t border-gray-200 bg-gray-50">
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {selectedMedia.type === 'image' && (
                                        <div className="flex items-center">
                                            <Image className="h-4 w-4 mr-2 text-blue-600" />
                                            <span className="text-sm text-gray-600">Image preview</span>
                                        </div>
                                    )}
                                    {selectedMedia.type === 'video' && (
                                        <div className="flex items-center">
                                            <Video className="h-4 w-4 mr-2 text-blue-600" />
                                            <span className="text-sm text-gray-600">Video preview</span>
                                        </div>
                                    )}
                                    {selectedMedia.type === 'document' && (
                                        <div className="flex items-center">
                                            <Paperclip className="h-4 w-4 mr-2 text-blue-600" />
                                            <span className="text-sm text-gray-600">Document selected</span>
                                        </div>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setSelectedMedia(null);
                                    setMediaPreview(null);
                                }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Actual preview content */}
                            {selectedMedia.type === 'image' && (
                                <div className="flex justify-center">
                                    <img
                                        src={mediaPreview}
                                        alt="Preview"
                                        className="max-h-40 rounded-md object-contain border border-gray-200"
                                    />
                                </div>
                            )}
                            {selectedMedia.type === 'video' && (
                                <div className="flex justify-center">
                                    <video
                                        src={mediaPreview}
                                        controls
                                        className="max-h-40 rounded-md object-contain border border-gray-200"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex space-x-3">
                        <div className="flex space-x-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowMediaOptions(!showMediaOptions)}
                                className="text-gray-600"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                            {showMediaOptions && (
                                <div className="flex space-x-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleMediaButtonClick('image')}
                                        className="text-gray-600"
                                    >
                                        <Image className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleMediaButtonClick('video')}
                                        className="text-gray-600"
                                    >
                                        <Video className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleMediaButtonClick('document')}
                                        className="text-gray-600"
                                    >
                                        <Paperclip className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileInputChange}
                            />
                        </div>
                        <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                if (e.target.value) {
                                    handleTyping();
                                }
                            }}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            className="flex-1 border-gray-200 focus:border-blue-500"
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                            disabled={!newMessage.trim() && !selectedMedia}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Modals */}
                <AddMembersModal
                    isOpen={addMembersModalOpen}
                    onClose={() => setAddMembersModalOpen(false)}
                    groupId={selectedGroupId!}
                    allUsers={employeesWithProfilePic}
                    onAddMembers={handleAddGroupMembers}
                />
                {removeMemberModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Remove Member</h2>
                            <Input
                                placeholder="Enter member ID to remove"
                                value={memberInput}
                                onChange={(e) => setMemberInput(e.target.value)}
                            />
                            <Button onClick={handleRemoveGroupMember}>Remove</Button>
                            <Button variant="ghost" onClick={() => setRemoveMemberModalOpen(false)}>Cancel</Button>
                        </div>
                    </div>
                )}
                <ConfirmModalComponent />
                {groupModalOpen && (
                    <GroupFormModal
                        isOpen={groupModalOpen}
                        onClose={() => setGroupModalOpen(false)}
                        onSubmit={handleCreateGroupSubmit}
                    />
                )}
            </div>
        </div>
    );
};

export default Chat;