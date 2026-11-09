import { useContext, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContextValue";

const AdminDashboard = lazy(() => import("./AdminDashboard"));
const ManagerDashboard = lazy(() => import("./ManagerDashboard"));
const SubAdminDashboard = lazy(() => import("./SubAdminDashboard"));
const TechnicianDashboard = lazy(() => import("./TechnicianDashboard"));

export const DashboardHome = () => {
  const auth = useContext(AuthContext);

  if (!auth || auth.isLoading) return null;

  const role = auth.user?.role;

  if (!role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Dashboard...</div>}>
      {role === "admin" && <AdminDashboard />}
      {role === "manager" && <ManagerDashboard />}
      {role === "subadmin" && <SubAdminDashboard />}
      {(role === "technician" || role === "worker") && <TechnicianDashboard />}
      {!["admin", "manager", "subadmin", "technician", "worker"].includes(role) && (
        <Navigate to="/unauthorized" replace />
      )}
    </Suspense>
  );
};

export default DashboardHome;
