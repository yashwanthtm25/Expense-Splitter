import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { formatDistanceToNowStrict } from "date-fns";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");
    const containerRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/notifications`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNotifications(response.data.notifications ?? []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Close dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const unreadCount = notifications.filter(
        (notification) => !notification.isRead
    ).length;

    // Returns a tooltip/toast message when the notification's target has
    // been deleted. We check the reference (group/expense) actually being
    // missing, but only for types where that reference is expected to
    // still be relevant — e.g. no point flagging "Expense not found" for
    // MEMBER_ADDED, which never pointed at an expense in the first place.
    const EXPENSE_RELATED_TYPES = [
        "EXPENSE_ADDED",
        "SPLIT_PAID",
        "EXPENSE_NAME_UPDATED",
        "EXPENSE_DESCRIPTION_UPDATED",
        "EXPENSE_AMOUNT_UPDATED",
        "EXPENSE_SPLIT_UPDATED",
        "EXPENSE_AMOUNT_SPLIT_UPDATED",
        "EXPENSE_DETAILS_UPDATED",
        "PAYMENT_REQUESTED",
        "EXPENSE_DELETED",
    ];

    const GROUP_RELATED_TYPES = [
        "ADMIN_TRANSFERRED",
        "MEMBER_ADDED",
        "MEMBER_REMOVED",
        "MEMBER_LEFT",
        "GROUP_NAME_EDIT",
        "GROUP_DELETED",
    ];

    const getMissingLabel = (notification) => {
        const hadExpenseRef = "expense" in notification;
        const hadGroupRef = "group" in notification;

         if (
            (EXPENSE_RELATED_TYPES.includes(notification.type) ||
                GROUP_RELATED_TYPES.includes(notification.type)) &&
            hadGroupRef &&
            !notification.group?._id
        ) {
            return "Group not found";
        }

        if (
            EXPENSE_RELATED_TYPES.includes(notification.type) &&
            hadExpenseRef &&
            !notification.expense?._id
        ) {
            return "Expense not found";
        }

        return null;
    };

    const markAsRead = async (notification) => {
        if (notification.isRead) return;

        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/notifications/${notification._id}/read`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNotifications((prev) =>
                prev.map((item) =>
                    item._id === notification._id
                        ? { ...item, isRead: true }
                        : item
                )
            );
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to mark notification as read"
            );
        }
    };

    const handleNotificationClick = async (notification) => {
        await markAsRead(notification);

        setOpen(false);

        if (notification.type === "MEMBER_REMOVED") {
            return;
        }

        const missingLabel = getMissingLabel(notification);
        if (missingLabel) {
            toast.error(missingLabel);
            return;
        }

        if (notification.expense?._id) {
            navigate(`/groups/${notification.group._id}/expenses/${notification.expense._id}`);
            return;
        }
        if (notification.group?._id) {
            navigate(`/groups/${notification.group._id}`);
        }
    };

    const markAllAsRead = async () => {
        try {
            setLoading(true);

            await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/notifications/read-all`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                }))
            );

            toast.success("All notifications marked as read");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to mark notifications as read"
            );
        } finally {
            setLoading(false);
        }
    };

    // date-fns replaces the hand-rolled time formatter.
    // formatDistanceToNowStrict avoids the "about" prefix and gives compact units.
    const getTimeAgo = (date) => {
        try {
            return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
        } catch {
            return "";
        }
    };

    return (
        <div ref={containerRef} style={{ position: "relative" }}>
            {/* Bell */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                style={{
                    position: "relative",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "22px",
                }}
            >
                🔔

                {unreadCount > 0 && (
                    <span
                        style={{
                            position: "absolute",
                            top: "-4px",
                            right: "-6px",
                            minWidth: "18px",
                            height: "18px",
                            padding: "0 4px",
                            borderRadius: "999px",
                            background: "#dc2626",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    style={{
                        position: "fixed",
                        right: 0,
                        top: "42px",
                        width: "360px",
                        maxWidth: "calc(100vw - 24px)",
                        maxHeight: "500px",
                        background: "#fff",
                        borderRadius: "12px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        border: "1px solid #e5e7eb",
                        zIndex: 100,
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: "16px",
                            borderBottom: "1px solid #e5e7eb",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: 700,
                            }}
                        >
                            Notifications
                        </h3>

                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                disabled={loading}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#4f46e5",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                {loading ? "Updating..." : "Mark all as read"}
                            </button>
                        )}
                    </div>

                    {/* Notifications */}
                    <div
                        style={{
                            maxHeight: "430px",
                            overflowY: "auto",
                        }}
                    >
                        {notifications.length === 0 ? (
                            <div
                                style={{
                                    padding: "40px 20px",
                                    textAlign: "center",
                                    color: "#6b7280",
                                    fontSize: "14px",
                                }}
                            >
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const missingLabel = getMissingLabel(notification);

                                return (
                                    <div
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        title={missingLabel ?? undefined}
                                        style={{
                                            padding: "14px 16px",
                                            borderBottom: "1px solid #f3f4f6",
                                            background: notification.isRead
                                                ? "#fff"
                                                : "#eef2ff",
                                            cursor: missingLabel
                                                ? "not-allowed"
                                                : notification.isRead
                                                ? "default"
                                                : "pointer",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "10px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "34px",
                                                    height: "34px",
                                                    borderRadius: "50%",
                                                    background: "#e0e7ff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                🔔
                                            </div>

                                            <div style={{ flex: 1 }}>
                                                <p
                                                    style={{
                                                        margin: "0 0 5px",
                                                        fontSize: "13px",
                                                        lineHeight: 1.5,
                                                        color: "#1f2937",
                                                        fontWeight: notification.isRead
                                                            ? 400
                                                            : 600,
                                                    }}
                                                >
                                                    {notification.message}
                                                </p>

                                                <span
                                                    style={{
                                                        fontSize: "11px",
                                                        color: "#9ca3af",
                                                    }}
                                                >
                                                    {getTimeAgo(notification.createdAt)}
                                                </span>
                                            </div>

                                            {!notification.isRead && (
                                                <span
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                        borderRadius: "50%",
                                                        background: "#4f46e5",
                                                        marginTop: "5px",
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;