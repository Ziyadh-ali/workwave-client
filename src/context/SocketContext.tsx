import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Employee, IGroup, IMessage, INotification } from '../utils/Interfaces/interfaces';
import { getProfileDetails } from '../services/user/userService';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
    reconnect: () => void;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    employees: Employee[];
    fetchEmployees: () => void;
    userGroups: IGroup[];
    fetchUserGroups: (userId: string) => void;
    createGroup: (groupData: { name: string; members: string[]; createdBy: string }) => Promise<IGroup>;
    addGroupMembers: (groupId: string, userIds: string[]) => Promise<void>;
    removeGroupMember: (groupId: string, memberId: string) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;
    privateMessages: Record<string, IMessage[]>;
    roomMessages: Record<string, IMessage[]>;
    fetchPrivateMessages: (user1: string, user2: string) => Promise<void>;
    fetchRoomMessages: (roomId: string) => Promise<void>;
    sendPrivateMessage: (message: Omit<IMessage, '_id' | 'createdAt'>) => Promise<IMessage>;
    sendRoomMessage: (message: Omit<IMessage, '_id' | 'createdAt'>) => Promise<IMessage>;
    notifications: INotification[];
    unreadNotifications: INotification[];
    fetchNotifications: (userId: string) => Promise<void>;
    fetchUnreadNotifications: (userId: string) => Promise<void>;
    sendNotification: (notification: Omit<INotification, '_id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    markNotificationsAsRead: (userId: string, notificationIds: string[]) => Promise<void>;
    sendLeaveStatusUpdate: (data: {
        employeeId: string;
        status: 'approved' | 'rejected';
        leaveId: string;
        managerId: string;
    }) => Promise<void>;
    sendLeaveRequestApplied: (data: {
        employeeName: string;
        employeeId: string;
        leaveId: string;
        managerId: string;
    }) => Promise<void>;
    sendMeetingScheduled: (data: {
        participants: string[];
        meetingId: string;
        scheduledBy: string;
        meetingTitle: string;
        time: string;
    }) => Promise<void>;
    sendMeetingUpdated: (data: {
        participants: string[];
        meetingId: string;
        updatedBy: string;
        meetingTitle: string;
        changes: string;
    }) => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: [],
    reconnect: () => { },
    connectionStatus: 'disconnected',
    employees: [],
    fetchEmployees: () => { },
    userGroups: [],
    fetchUserGroups: () => { },
    createGroup: async () => ({ _id: "", name: "", members: [], createdBy: "" }),
    addGroupMembers: async () => { },
    removeGroupMember: async () => { },
    deleteGroup: async () => { },
    privateMessages: {},
    roomMessages: {},
    fetchPrivateMessages: async () => { },
    fetchRoomMessages: async () => { },
    sendPrivateMessage: async () => ({ _id: '', content: '', sender: { _id: "", fullName: "", email: "" , profilePic : "" }, createdAt: new Date() }),
    sendRoomMessage: async () => ({ _id: '', content: '', sender: { _id: "", fullName: "", email: "" , profilePic : ""}, roomId: '', createdAt: new Date() }),
    notifications: [],
    unreadNotifications: [],
    fetchNotifications: async () => { },
    fetchUnreadNotifications: async () => { },
    sendNotification: async () => { },
    markNotificationsAsRead: async () => { },
    sendLeaveStatusUpdate: async () => { },
    sendLeaveRequestApplied: async () => { },
    sendMeetingScheduled: async () => { },
    sendMeetingUpdated: async () => { }
});

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children, userId }: { children: React.ReactNode, userId: string }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [retryCount, setRetryCount] = useState(0);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [userGroups, setUserGroups] = useState<IGroup[]>([]);
    const [privateMessages, setPrivateMessages] = useState<Record<string, IMessage[]>>({});
    const [roomMessages, setRoomMessages] = useState<Record<string, IMessage[]>>({});
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState<INotification[]>([]);

    useEffect(() => {
        console.log(userId)
    }, [userId])

    const reconnect = useCallback(() => {
        if (socket) {
            console.log("Attempting to reconnect socket");
            socket.connect();
            setConnectionStatus('connecting');
        }
    }, [socket]);

    const socketInstance = useMemo(() => {
        if (!userId) {
            console.warn("No userId provided, socket not initialized");
            return null;
        }

        console.log("Initializing socket with userId:", userId);
        return io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            withCredentials: true,
            autoConnect: false,
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            transports: ['websocket']
        });
    }, [userId]);

    const fetchUserGroups = useCallback((userId: string) => {
        if (socketInstance && connectionStatus === 'connected') {
            console.log("Emitting requestUserGroups for user:", userId);
            socketInstance.emit('requestUserGroups', userId);
        } else {
            console.warn("Cannot fetch user groups, socket not connected or status:", connectionStatus);
        }
    }, [socketInstance, connectionStatus]);

    const createGroup = useCallback((groupData: { name: string; members: string[]; createdBy: string }) => {
        return new Promise<IGroup>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }

            console.log("Creating group:", groupData);
            socketInstance.emit('createGroup', groupData, (response: { success: boolean; group?: IGroup; error?: string }) => {
                if (response.success && response.group) {
                    resolve(response.group);
                } else {
                    reject(new Error(response.error || 'Failed to create group'));
                }
            });
        });
    }, [socketInstance]);

    const addGroupMembers = useCallback((groupId: string, userIds: string[]) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }

            console.log("Adding members to group:", groupId, userIds);
            socketInstance.emit('addGroupMembers', groupId, userIds, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.error || 'Failed to add members'));
                }
            });
        });
    }, [socketInstance]);

    const removeGroupMember = useCallback((groupId: string, memberId: string) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }

            console.log("Removing member from group:", groupId, memberId);
            socketInstance.emit('removeGroupMember', groupId, memberId, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.error || 'Failed to remove member'));
                }
            });
        });
    }, [socketInstance]);

    const deleteGroup = useCallback((groupId: string) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }

            console.log("Deleting group:", groupId);
            socketInstance.emit('deleteGroup', groupId, (response: { success: boolean; error?: string }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.error || 'Failed to delete group'));
                }
            });
        });
    }, [socketInstance]);

    const fetchEmployees = useCallback(() => {
        if (socketInstance && connectionStatus === 'connected') {
            console.log("Emitting requestEmployees");
            socketInstance.emit('requestEmployees');
        } else {
            console.warn("Cannot fetch employees, socket not connected or status:", connectionStatus);
        }
    }, [socketInstance, connectionStatus]);

    const fetchPrivateMessages = useCallback(async (user1: string, user2: string) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }

            console.log("Fetching private messages between:", user1, user2);
            const key = [user1, user2].sort().join('_');
            socketInstance.emit('fetchPrivateMessages', { user1, user2 }, (messages: IMessage[]) => {
                console.log("messagegeegegege", messages)
                const validMessages = messages.map(msg => ({
                    ...msg,
                    _id: msg._id?.toString(),
                    sender: {
                        _id: msg.sender._id.toString(),
                        fullName: msg.sender.fullName.toString(),
                        email: msg.sender.email.toString(),
                        profilePic: msg.sender.profilePic.toString(),
                    },
                    recipient: msg.recipient?.toString(),
                    roomId: msg.roomId?.toString(),
                    createdAt: new Date(msg.createdAt!),
                }));
                setPrivateMessages(prev => ({
                    ...prev,
                    [key]: validMessages
                }));
                resolve();
            });
        });
    }, [socketInstance]);

    const fetchRoomMessages = useCallback(async (roomId: string) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }

            console.log("Fetching room messages for:", roomId);
            socketInstance.emit('fetchRoomMessages', roomId, (messages: IMessage[]) => {
                const validMessages = messages.map(msg => ({
                    ...msg,
                    _id: msg._id?.toString(),
                    sender: {
                        _id: msg.sender._id.toString(),
                        fullName: msg.sender.fullName.toString(),
                        email: msg.sender.email.toString(),
                        profilePic: msg.sender.profilePic.toString(),
                    },
                    recipient: msg.recipient?.toString(),
                    roomId: msg.roomId?.toString(),
                    createdAt: new Date(msg.createdAt!),
                }));
                setRoomMessages(prev => ({
                    ...prev,
                    [roomId]: validMessages
                }));
                resolve();
            });
        });
    }, [socketInstance]);

    const sendPrivateMessage = useCallback(async (message: Omit<IMessage, '_id' | 'createdAt'>) => {
        return new Promise<IMessage>((resolve, reject) => {
            if (!socketInstance || !message.sender || !message.recipient) {
                reject(new Error('Socket not connected or invalid message data'));
                return;
            }

            console.log("Sending private message:", message);
            socketInstance.emit('privateMessage', message, (response: { success: boolean; message?: IMessage; error?: string }) => {
                if (response.success && response.message) {
                    const key = [message.sender.toString(), message.recipient!.toString()].sort().join('_');
                    const normalizedMessage = {
                        ...response.message,
                        _id: response.message._id?.toString(),
                        sender: {
                            _id: response.message.sender._id.toString(),
                            fullName: response.message.sender.fullName.toString(),
                            email: response.message.sender.email.toString(),
                            profilePic: response.message.sender.profilePic.toString()
                        },
                        recipient: response.message.recipient?.toString(),
                        roomId: response.message.roomId?.toString(),
                        createdAt: new Date(response.message.createdAt!),
                    };
                    setPrivateMessages(prev => ({
                        ...prev,
                        [key]: [...(prev[key] || []), normalizedMessage]
                    }));
                    resolve(normalizedMessage);
                } else {
                    reject(new Error(response.error || 'Failed to send message'));
                }
            });
        });
    }, [socketInstance]);

    const sendRoomMessage = useCallback(async (message: Omit<IMessage, '_id' | 'createdAt'>) => {
        return new Promise<IMessage>((resolve, reject) => {
            if (!socketInstance || !message.roomId) {
                reject(new Error('Socket not connected or invalid message data'));
                return;
            }

            console.log("Sending room message:", message);
            socketInstance.emit('roomMessage', message, (response: { success: boolean; message?: IMessage; error?: string }) => {
                console.log("repsosmsmsjsjsjssj", response.message)
                if (response.success && response.message) {
                    const roomId = message.roomId as string;
                    const normalizedMessage = {
                        ...response.message,
                        _id: response.message._id?.toString(),
                        sender: {
                            _id: response.message.sender._id.toString(),
                            fullName: response.message.sender.fullName.toString(),
                            email: response.message.sender.email.toString(),
                            profilePic: response.message.sender.profilePic!
                        },
                        recipient: response.message.recipient,
                        roomId: response.message.roomId?.toString(),
                        createdAt: new Date(response.message.createdAt!),
                    };
                    setRoomMessages(prev => ({
                        ...prev,
                        [roomId]: [...(prev[roomId] || []), normalizedMessage]
                    }));
                    resolve(normalizedMessage);
                } else {
                    reject(new Error(response.error || 'Failed to send message'));
                }
            });
        });
    }, [socketInstance]);

    const fetchNotifications = useCallback(async (userId: string) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketInstance.emit('getUserNotifications', userId, (notifications: INotification[]) => {
                setNotifications(notifications);
                resolve();
            });
        });
    }, [socketInstance]);

    const fetchUnreadNotifications = useCallback(async (userId: string) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketInstance.emit('getUnreadNotifications', userId, (notifications: INotification[]) => {
                setUnreadNotifications(notifications);
                resolve();
            });
        });
    }, [socketInstance]);

    const sendNotification = useCallback(async (notification: Omit<INotification, '_id' | 'createdAt' | 'updatedAt'>) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketInstance.emit('sendNotification', notification, (response: { success: boolean }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error('Failed to send notification'));
                }
            });
        });
    }, [socketInstance]);

    const markNotificationsAsRead = useCallback(async (userId: string, notificationIds: string[]) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketInstance.emit('markNotificationsAsRead', userId, notificationIds, (response: { success: boolean }) => {
                if (response.success) {
                    // Update local state
                    setNotifications(prev =>
                        prev.map(n =>
                            notificationIds.includes(n._id.toString()) ? { ...n, read: true } : n
                        )
                    );
                    setUnreadNotifications(prev =>
                        prev.filter(n => !notificationIds.includes(n._id.toString()))
                    );
                    resolve();
                } else {
                    reject(new Error('Failed to mark notifications as read'));
                }
            });
        });
    }, [socketInstance]);

    const sendLeaveRequestApplied = useCallback(async (data: {
        employeeName: string;
        employeeId: string;
        leaveId: string;
        managerId: string;
    }) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketInstance.emit('leaveRequestApplied', data, (response: { success: boolean }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error('Failed to send leave status update'));
                }
            });
        });
    }, [socketInstance]);
    const sendLeaveStatusUpdate = useCallback(async (data: {
        employeeId: string;
        status: 'approved' | 'rejected';
        leaveId: string;
        managerId: string;
    }) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketInstance.emit('leaveStatusUpdate', data, (response: { success: boolean }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error('Failed to send leave status update'));
                }
            });
        });
    }, [socketInstance]);

    const sendMeetingScheduled = useCallback(async (data: {
        participants: string[];
        meetingId: string;
        scheduledBy: string;
        meetingTitle: string;
        time: string;
    }) => {
        return new Promise<void>((resolve, reject) => {
            alert("hrllo")
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            alert("hoooi")
            socketInstance.emit('meetingScheduled', data, (response: { success: boolean }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error('Failed to send meeting scheduled notification'));
                }
            });
        });
    }, [socketInstance]);


    const sendMeetingUpdated = useCallback(async (data: {
        participants: string[];
        meetingId: string;
        updatedBy: string;
        meetingTitle: string;
        changes: string;
    }) => {
        return new Promise<void>((resolve, reject) => {
            if (!socketInstance) {
                reject(new Error('Socket not connected'));
                return;
            }
            socketInstance.emit('meetingUpdated', data, (response: { success: boolean }) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error('Failed to send meeting updated notification'));
                }
            });
        });
    }, [socketInstance]);

    useEffect(() => {
        if (!socketInstance) return;

        const onConnect = () => {
            console.log("Socket connected, registering user:", userId);
            setConnectionStatus('connected');
            socketInstance.emit('register', userId);
            setRetryCount(0);
        };

        const onDisconnect = () => {
            console.log("Socket disconnected");
            setConnectionStatus('disconnected');
        };

        const onConnectError = (error: Error) => {
            console.error('Socket connection error:', error);
            setConnectionStatus('error');
            setRetryCount(prev => prev + 1);
        };

        const onOnlineUsers = (users: string[]) => {
            console.log("Received online users:", users);
            setOnlineUsers(users);
        };

        const onEmployeeList = (employeeList: Employee[]) => {
            console.log("Received employee list:", employeeList);
            setEmployees(employeeList);
        };

        const onUserGroups = (groups: IGroup[]) => {
            console.log("Received user groups:", groups);
            setUserGroups(groups);
        };

        const onGroupCreated = (newGroup: IGroup) => {
            console.log("Group created:", newGroup);
            setUserGroups(prev => [...prev, newGroup]);
        };

        const onAddedToGroup = (groupId: string) => {
            console.log("Added to group:", groupId);
            fetchUserGroups(userId);
        };

        const onGroupMembersUpdated = (data: { groupId: string; newMembers: string[] }) => {
            console.log("Group members updated:", data);
            setUserGroups(prev => prev.map(group =>
                group._id === data.groupId
                    ? { ...group, members: [...new Set([...group.members, ...data.newMembers])] }
                    : group
            ));
        };

        const onRemovedFromGroup = (groupId: string) => {
            console.log("Removed from group:", groupId);
            setUserGroups(prev => prev.filter(g => g._id !== groupId));
        };

        const onGroupDeleted = (groupId: string) => {
            console.log("Group deleted:", groupId);
            setUserGroups(prev => prev.filter(g => g._id !== groupId));
        };

        const onNewPrivateMessage = async (message: IMessage) => {
            console.log("New private message received:", message);
            const response = await getProfileDetails(message.sender.toString());
            const sender = response.details;
            const recipient = message.recipient?.toString();
            if (!recipient) return;
            const key = [sender._id, recipient].sort().join('_');
            const normalizedMessage = {
                ...message,
                _id: message._id?.toString(),
                sender: {
                    _id: sender._id,
                    fullName: sender.fullName,
                    email: sender.email,
                    profilePic: sender.profilePic!
                },
                recipient: recipient,
                roomId: message.roomId?.toString(),
                createdAt: new Date(message.createdAt!),
            };
            setPrivateMessages(prev => ({
                ...prev,
                [key]: [...(prev[key] || []), normalizedMessage]
            }));
        };

        const onNewRoomMessage = async (message: IMessage) => {
            console.log("New room message received:", message);
            const roomId = message.roomId;
            const response = await getProfileDetails(message.sender.toString());
            const sender = response.details;
            if (!roomId) return;

            const normalizedMessage = {
                ...message,
                _id: message._id?.toString(),
                sender: {
                    _id: sender._id.toString(),
                    fullName: sender.fullName,
                    email: sender.email,
                    profilePic: sender.profilePic!
                },
                recipient: message.recipient,
                roomId: roomId,
                createdAt: new Date(message.createdAt!),
            };
            setRoomMessages(prev => ({
                ...prev,
                [roomId]: [...(prev[roomId] || []), normalizedMessage]
            }));
        };

        const onNewNotification = (notification: INotification) => {
            setNotifications(prev => [notification, ...prev]);
            if (!notification.read) {
                setUnreadNotifications(prev => [notification, ...prev]);
            }
        };

        const onNotificationsRead = (notificationIds: string[]) => {
            setNotifications(prev =>
                prev.map(n =>
                    notificationIds.includes(n._id.toString()) ? { ...n, read: true } : n
                )
            );
            setUnreadNotifications(prev =>
                prev.filter(n => !notificationIds.includes(n._id.toString()))
            );
        };

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);
        socketInstance.on('connect_error', onConnectError);
        socketInstance.on('onlineUsers', onOnlineUsers);
        socketInstance.on('employeeList', onEmployeeList);
        socketInstance.on('userGroups', onUserGroups);
        socketInstance.on('groupCreated', onGroupCreated);
        socketInstance.on('addedToGroup', onAddedToGroup);
        socketInstance.on('groupMembersUpdated', onGroupMembersUpdated);
        socketInstance.on('removedFromGroup', onRemovedFromGroup);
        socketInstance.on('groupDeleted', onGroupDeleted);
        socketInstance.on('newPrivateMessage', onNewPrivateMessage);
        socketInstance.on('newRoomMessage', onNewRoomMessage);
        socketInstance.on('newNotification', onNewNotification);
        socketInstance.on('notificationsRead', onNotificationsRead);

        setSocket(socketInstance);
        setConnectionStatus('connecting');
        socketInstance.connect();

        return () => {
            socketInstance.off('connect', onConnect);
            socketInstance.off('disconnect', onDisconnect);
            socketInstance.off('connect_error', onConnectError);
            socketInstance.off('onlineUsers', onOnlineUsers);
            socketInstance.off('employeeList', onEmployeeList);
            socketInstance.off('userGroups', onUserGroups);
            socketInstance.off('groupCreated', onGroupCreated);
            socketInstance.off('addedToGroup', onAddedToGroup);
            socketInstance.off('groupMembersUpdated', onGroupMembersUpdated);
            socketInstance.off('removedFromGroup', onRemovedFromGroup);
            socketInstance.off('groupDeleted', onGroupDeleted);
            socketInstance.off('newPrivateMessage', onNewPrivateMessage);
            socketInstance.off('newRoomMessage', onNewRoomMessage);
            socketInstance.off('newNotification', onNewNotification);
            socketInstance.off('notificationsRead', onNotificationsRead);
            socketInstance.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketInstance, userId,]);

    useEffect(() => {
        if (connectionStatus === 'error' && retryCount < 3) {
            console.log(`Connection error, retrying (${retryCount + 1}/3)`);
            const timer = setTimeout(() => {
                reconnect();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [connectionStatus, retryCount, reconnect]);

    const value = useMemo(() => ({
        socket,
        isConnected: connectionStatus === 'connected',
        onlineUsers,
        reconnect,
        employees,
        fetchEmployees,
        userGroups,
        fetchUserGroups,
        createGroup,
        addGroupMembers,
        removeGroupMember,
        deleteGroup,
        connectionStatus,
        privateMessages,
        roomMessages,
        fetchPrivateMessages,
        fetchRoomMessages,
        sendPrivateMessage,
        sendRoomMessage,
        notifications,
        unreadNotifications,
        fetchNotifications,
        fetchUnreadNotifications,
        sendNotification,
        markNotificationsAsRead,
        sendLeaveStatusUpdate,
        sendLeaveRequestApplied,
        sendMeetingScheduled,
        sendMeetingUpdated,
    }), [
        socket,
        connectionStatus,
        onlineUsers,
        reconnect,
        employees,
        fetchEmployees,
        userGroups,
        fetchUserGroups,
        createGroup,
        addGroupMembers,
        removeGroupMember,
        deleteGroup,
        privateMessages,
        roomMessages,
        fetchPrivateMessages,
        fetchRoomMessages,
        sendPrivateMessage,
        sendRoomMessage,
        notifications,
        unreadNotifications,
        fetchNotifications,
        fetchUnreadNotifications,
        sendNotification,
        markNotificationsAsRead,
        sendLeaveStatusUpdate,
        sendLeaveRequestApplied,
        sendMeetingScheduled,
        sendMeetingUpdated,
    ]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};