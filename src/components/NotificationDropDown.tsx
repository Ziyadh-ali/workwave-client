import { useEffect, useState } from "react";
import { Bell, MessageCircle, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useSocket } from "../context/SocketContext";
import { INotification } from "../utils/Interfaces/interfaces";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

export const NotificationDropdown = () => {
    const { 
        notifications, 
        unreadNotifications, 
        fetchNotifications, 
        fetchUnreadNotifications,
        markNotificationsAsRead,
        isConnected
    } = useSocket();
    const {employee} = useSelector((state : RootState)=>state.employee)
    const {admin} = useSelector((state : RootState)=>state.admin)
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const userId = employee ? employee?._id : admin?._id;

    const unreadCount = unreadNotifications.length;

    useEffect(() => {
        if (isConnected && userId) {
            setIsLoading(true);
            console.log(admin)
            Promise.all([
                fetchNotifications(userId),
                fetchUnreadNotifications(userId)
            ]).finally(() => setIsLoading(false));
        }
    }, [isConnected, userId, fetchNotifications, fetchUnreadNotifications]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message': 
                return <MessageCircle className="h-4 w-4" />;
            case 'leave_approval': 
                return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'leave_rejection': 
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'meeting_scheduled': 
            case 'meeting_updated': 
                return <Calendar className="h-4 w-4 text-blue-500" />;
            default: 
                return <Bell className="h-4 w-4" />;
        }
    };

    const handleNotificationClick = async (notificationId: string) => {
        await markNotificationsAsRead(userId!, [notificationId]);
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount > 0) {
            const unreadIds = unreadNotifications.map(n => n._id.toString());
            await markNotificationsAsRead(userId!, unreadIds);
        }
    };

    const formatNotificationContent = (notification: INotification) => {
        switch (notification.type) {
            case 'message':
                return notification.content || 'You have a new message';
            case 'leave_approval':
                return notification.content || 'Your leave request has been approved';
            case 'leave_rejection':
                return notification.content || 'Your leave request has been rejected';
            case 'meeting_scheduled':
                return notification.content || 'A new meeting has been scheduled';
            case 'meeting_updated':
                return notification.content || 'A meeting has been updated';
            default:
                return notification.content || 'New notification';
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <div className="relative cursor-pointer">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </div>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-0 max-h-[400px] flex flex-col"
                align="end"
                sideOffset={10}
            >
                <div className="p-3 border-b flex justify-between items-center shrink-0">
                    <h4 className="font-semibold">Notifications</h4>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={unreadCount === 0}
                    >
                        Mark all as read
                    </Button>
                </div>
                <ScrollArea className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Loading notifications...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id.toString()}
                                    className={cn(
                                        "p-3 hover:bg-muted/50 transition-colors cursor-pointer",
                                        !notification.read && "bg-muted/30"
                                    )}
                                    onClick={() => handleNotificationClick(notification._id.toString())}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <p className={cn(
                                                    "text-sm",
                                                    !notification.read && "font-semibold"
                                                )}>
                                                    {formatNotificationContent(notification)}
                                                </p>
                                                {!notification.read && (
                                                    <span className="h-2 w-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};