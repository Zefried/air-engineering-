import { Bell, Moon, Sun, PanelLeft, User, LogOut } from "lucide-react";
import "./Style/Navbar.css";
import { useContext, useEffect, useState, useCallback, useRef } from "react";
import { AuthContext } from "../Context/AuthContextValue";
import { useNavigate, useLocation } from "react-router-dom";
import { getPageTitle } from "../config/navigation";
import { activitiesApi, type NotificationItem } from "../api/activitiesApi";

type NavbarProps = {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  setShowNotif: React.Dispatch<React.SetStateAction<boolean>>;
  dark: boolean;
  showNotif: boolean;
  showProfile: boolean;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Navbar = ({
  setSidebarOpen,
  dark,
  setDark,
  showNotif,
  setShowNotif,
  showProfile,
  setShowProfile,
}: NavbarProps) => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const shownPushNotifsRef = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    if (!auth?.user) return;
    try {
      const res = await activitiesApi.getNotifications();
      if (res.status) {
        const notifs = res.data || [];
        setNotifications(notifs);
        setUnreadCount(res.unread_count || 0);

        // Native HTML5 Desktop Push Notification trigger
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          notifs.forEach((n) => {
            if (
              !n.read_at &&
              (n.data as any)?.type === "payment_reminder" &&
              !shownPushNotifsRef.current.has(n.id)
            ) {
              shownPushNotifsRef.current.add(n.id);
              new Notification(n.data.title || "Payment Pending Reminder", {
                body: n.data.message,
              });
            }
          });
        }
      }
    } catch {
      // Silently catch in navbar
    }
  }, [auth?.user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (item: NotificationItem) => {
    try {
      if (!item.read_at) {
        await activitiesApi.markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setShowNotif(false);

      if ((item.data as any)?.type === "payment_reminder") {
        navigate("/dashboard/payment-reminders");
      } else if (item.data?.activity_id) {
        if (auth?.user?.role === "technician" || auth?.user?.role === "worker") {
          navigate("/dashboard");
        } else {
          navigate("/dashboard/activities");
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await activitiesApi.markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div
      className={`navbar ${dark ? "dark" : ""}`}
      style={{ color: dark ? "white" : "black" }}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <PanelLeft
          size={18}
          className="cursor-pointer"
          onClick={() => setSidebarOpen((prev) => !prev)}
        />
        <span className="nav-title">{pageTitle}</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 extra-margin">
        <button
          onClick={() => setDark((prev) => !prev)}
          className="icon-btn"
          aria-label="Toggle theme"
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <div className="relative">
          <div
            style={{ position: "relative", cursor: "pointer", display: "inline-flex" }}
            onClick={() => setShowNotif((prev) => !prev)}
          >
            <Bell size={18} className="icon-btn-bell" />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
            )}
          </div>

          {showNotif && (
            <div className="notif-box">
              <div className="notif-header">
                <h3 className="notif-title">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="notif-mark-all"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications yet</p>
                ) : (
                  notifications.map((item) => {
                    const isUnread = !item.read_at;
                    return (
                      <div
                        key={item.id}
                        className={`notif-item ${isUnread ? "is-unread" : ""}`}
                        onClick={() => handleMarkRead(item)}
                      >
                        <div className="notif-item-top">
                          <span className="notif-item-title">
                            {item.data?.title || "Task Notification"}
                          </span>
                          {isUnread && <span className="notif-item-unread-dot" />}
                        </div>
                        <p className="notif-item-msg">{item.data?.message}</p>
                        <span className="notif-item-time">
                          {new Date(item.created_at).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* AVATAR */}
        <div
          className="avatar cursor-pointer"
          onClick={() => setShowProfile((prev) => !prev)}
        />

        {/* PROFILE DROPDOWN */}
        {showProfile && (
          <div className="profile-box">
            <div className="profile-item">
              <User size={16} />
              <span>Profile</span>
            </div>

            <div
              className="profile-item"
              onClick={() => {
                auth?.logout();
                navigate("/login");
              }}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};