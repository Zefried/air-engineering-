import { useState, useContext, useMemo } from "react";
import { Sidebar } from "../Components/Sidebar";
import { Navbar } from "../Components/Navbar";
import { getSidebarNavigation } from "../config/navigation";
import { Outlet } from "react-router-dom";
import { AuthContext } from "../Context/AuthContextValue";
import "../Components/Style/Dashboard.css";

export const DashboardLayout = () => {
  const auth = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [dark, setDark] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const user = auth?.user;
  const isLoading = auth?.isLoading;
  const menu = useMemo(() => getSidebarNavigation(user?.role), [user?.role]);

  if (!auth || isLoading || !user?.role) return null;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex h-screen relative app">

        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          menu={menu}
          setSidebarOpen={setSidebarOpen}
          sidebarOpen={sidebarOpen}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />

        {/* Right */}
        <div className="flex flex-col flex-1">
          <Navbar
            setSidebarOpen={setSidebarOpen}
            dark={dark}
            setDark={setDark}
            showNotif={showNotif}
            setShowNotif={setShowNotif}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
          />

          {/* Main */}
          <div className="flex-1 overflow-y-auto main-div">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
};