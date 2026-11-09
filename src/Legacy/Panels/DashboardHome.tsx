// Render dashboard panels based on the user's role

import { useContext, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContextValue";

const AdminPanel = lazy(() => import("./AdminPanel"));

export const DashboardHome = () => {
  const auth = useContext(AuthContext);

  if (!auth || auth.isLoading) return null;

  const role = auth.user?.role;

  if (!role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {role === "admin" && <AdminPanel />}

    </Suspense>
  );
};