import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { DashboardLayout } from "../Layouts/DashboardLayout";
import { Login } from "../Pages/Auth/Login";
import { ProtectedRoute } from "./ProtectedRoutes";
import { Unauthorized } from "../Pages/Auth/Unauthorized";
import { DashboardHome } from "../Pages/Dashboard/DashboardHome";
import { getFlattenedRoutes } from "../config/navigation";

const dynamicRoutes = getFlattenedRoutes();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin", "manager", "subadmin", "technician", "worker"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      ...dynamicRoutes.map((route) => ({
        path: route.path,
        element: (
          <ProtectedRoute allowedRoles={route.allowedRoles}>
            <Suspense
              fallback={
                <div className="p-8 text-center text-gray-500">
                  Loading {route.name}...
                </div>
              }
            >
              {route.element}
            </Suspense>
          </ProtectedRoute>
        ),
      })),
      {
        path: "*",
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);

export default router;
