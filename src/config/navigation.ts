import React, { lazy } from "react";
import {
  Home,
  Briefcase,
  Users,
  Wrench,
  Package,
  FileText,
  PlusSquare,
  FolderTree,
  CalendarCheck,
  CalendarDays,
  BellRing,
} from "lucide-react";
import type { Role } from "../Context/AuthContextValue";

// Lazy-load feature pages for optimal code splitting
const Projects = lazy(() => import("../Pages/Projects/Projects"));
const AddProject = lazy(() => import("../Pages/Projects/AddProject"));
const Activities = lazy(() => import("../Pages/Activities/ActivitiesPage"));
const Attendance = lazy(() => import("../Pages/Attendance/AttendancePage"));
const PaymentReminders = lazy(() => import("../Pages/PaymentReminders/PaymentRemindersPage"));
const Tools = lazy(() => import("../Pages/Tools/Tools"));
const AddTool = lazy(() => import("../Pages/Tools/AddTool"));
const Materials = lazy(() => import("../Pages/Materials/Materials"));
const AddMaterial = lazy(() => import("../Pages/Materials/AddMaterial"));
const Products = lazy(() => import("../Pages/Products/Products"));
const AddProduct = lazy(() => import("../Pages/Products/AddProduct"));
const Categories = lazy(() => import("../Pages/Categories/Categories"));
const Team = lazy(() => import("../Pages/Team/Team"));
const AddEmployee = lazy(() => import("../Pages/Team/AddEmployee"));
const Contracts = lazy(() => import("../Pages/Contracts/Contracts"));
const AddContract = lazy(() => import("../Pages/Contracts/AddContract"));

export interface NavigationItem {
  name: string;
  path?: string;
  icon: React.ElementType;
  element?: React.ReactNode;
  allowedRoles: Role[];
  showInSidebar?: boolean;
  children?: {
    name: string;
    path: string;
    icon: React.ElementType;
    element?: React.ReactNode;
    allowedRoles: Role[];
    showInSidebar?: boolean;
  }[];
}

/**
 * Single source of truth for:
 * 1. React Router Route configuration
 * 2. Sidebar Navigation items per role
 * 3. Page header titles in Navbar
 */
export const navigationConfig: NavigationItem[] = [
  {
    name: "Dashboard",
    icon: Home,
    path: "/dashboard",
    allowedRoles: ["admin", "manager", "subadmin", "technician", "worker"],
    showInSidebar: true,
  },
  {
    name: "Projects",
    icon: Briefcase,
    allowedRoles: ["admin", "manager", "subadmin"],
    showInSidebar: true,
    children: [
      {
        name: "All Projects",
        icon: Briefcase,
        path: "/dashboard/projects",
        element: React.createElement(Projects),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
      {
        name: "Add Project",
        icon: PlusSquare,
        path: "/dashboard/add-project",
        element: React.createElement(AddProject),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
    ],
  },
  {
    name: "Payment Reminders",
    icon: BellRing,
    path: "/dashboard/payment-reminders",
    element: React.createElement(PaymentReminders),
    allowedRoles: ["admin"],
    showInSidebar: true,
  },
  {
    name: "Daily Activities",
    icon: CalendarCheck,
    path: "/dashboard/activities",
    element: React.createElement(Activities),
    allowedRoles: ["admin", "manager", "subadmin"],
    showInSidebar: true,
  },
  {
    name: "Attendance & Salary",
    icon: CalendarDays,
    path: "/dashboard/attendance",
    element: React.createElement(Attendance),
    allowedRoles: ["admin", "manager", "subadmin"],
    showInSidebar: true,
  },
  {
    name: "Products & Stock",
    icon: Package,
    allowedRoles: ["admin", "manager", "subadmin"],
    showInSidebar: true,
    children: [
      {
        name: "Products & Sizes",
        icon: Package,
        path: "/dashboard/products",
        element: React.createElement(Products),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
      {
        name: "Add Product",
        icon: PlusSquare,
        path: "/dashboard/add-product",
        element: React.createElement(AddProduct),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
      {
        name: "Categories / Taxonomy",
        icon: FolderTree,
        path: "/dashboard/categories",
        element: React.createElement(Categories),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
      {
        name: "Materials Overview",
        icon: Package,
        path: "/dashboard/materials",
        element: React.createElement(Materials),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: false, // Accessible directly, but streamlined under Products in sidebar
      },
      {
        name: "Add Material",
        icon: PlusSquare,
        path: "/dashboard/add-material",
        element: React.createElement(AddMaterial),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: false,
      },
    ],
  },
  {
    name: "Tools",
    icon: Wrench,
    allowedRoles: ["admin", "manager", "subadmin"],
    showInSidebar: true,
    children: [
      {
        name: "All Tools",
        icon: Wrench,
        path: "/dashboard/tools",
        element: React.createElement(Tools),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
      {
        name: "Add Tool",
        icon: PlusSquare,
        path: "/dashboard/add-tool",
        element: React.createElement(AddTool),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
    ],
  },
  {
    name: "Team",
    icon: Users,
    allowedRoles: ["admin", "manager", "subadmin"],
    showInSidebar: true,
    children: [
      {
        name: "All Members",
        icon: Users,
        path: "/dashboard/employees",
        element: React.createElement(Team),
        allowedRoles: ["admin", "manager", "subadmin"],
        showInSidebar: true,
      },
      {
        name: "Add Member",
        icon: PlusSquare,
        path: "/dashboard/add-employee",
        element: React.createElement(AddEmployee),
        allowedRoles: ["admin", "manager"],
        showInSidebar: true,
      },
    ],
  },
  {
    name: "Contracts",
    icon: FileText,
    allowedRoles: ["admin", "manager"],
    showInSidebar: true,
    children: [
      {
        name: "All Contracts",
        icon: FileText,
        path: "/dashboard/contracts",
        element: React.createElement(Contracts),
        allowedRoles: ["admin", "manager"],
        showInSidebar: true,
      },
      {
        name: "New Contract",
        icon: PlusSquare,
        path: "/dashboard/add-contract",
        element: React.createElement(AddContract),
        allowedRoles: ["admin", "manager"],
        showInSidebar: true,
      },
    ],
  },
];

export interface FlattenedRoute {
  path: string;
  element: React.ReactNode;
  allowedRoles: Role[];
  name: string;
}

/**
 * Extracts all leaf routes that should be registered in React Router.
 */
export const getFlattenedRoutes = (): FlattenedRoute[] => {
  const routes: FlattenedRoute[] = [];

  for (const item of navigationConfig) {
    if (item.children) {
      for (const child of item.children) {
        if (child.path && child.element) {
          // Strip leading '/dashboard/' to make child paths relative to parent '/dashboard'
          const relativePath = child.path.replace(/^\/dashboard\/?/, "");
          routes.push({
            path: relativePath,
            element: child.element,
            allowedRoles: child.allowedRoles,
            name: child.name,
          });
        }
      }
    } else if (item.path && item.element) {
      const relativePath = item.path.replace(/^\/dashboard\/?/, "");
      routes.push({
        path: relativePath,
        element: item.element,
        allowedRoles: item.allowedRoles,
        name: item.name,
      });
    }
  }

  return routes;
};

/**
 * Filters the navigation hierarchy for the sidebar according to the user's role.
 */
export const getSidebarNavigation = (role?: Role) => {
  if (!role) return [];

  return navigationConfig
    .filter((item) => item.showInSidebar !== false && item.allowedRoles.includes(role))
    .map((item) => {
      if (!item.children) {
        return {
          name: item.name,
          icon: item.icon,
          path: item.path,
        };
      }

      // Filter children by user's role
      const visibleChildren = item.children
        .filter((child) => child.showInSidebar !== false && child.allowedRoles.includes(role))
        .map((child) => ({
          name: child.name,
          icon: child.icon,
          path: child.path,
        }));

      // If no children remain visible, omit this parent
      if (visibleChildren.length === 0 && !item.path) {
        return null;
      }

      return {
        name: item.name,
        icon: item.icon,
        path: item.path,
        children: visibleChildren.length > 0 ? visibleChildren : undefined,
      };
    })
    .filter(Boolean) as {
      name: string;
      icon: React.ElementType;
      path?: string;
      children?: { name: string; path?: string; icon?: React.ElementType }[];
    }[];
};

/**
 * Resolves the display title for any given route pathname.
 */
export const getPageTitle = (pathname: string): string => {
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return "Dashboard";
  }

  for (const item of navigationConfig) {
    if (item.path === pathname) return item.name;
    if (item.children) {
      for (const child of item.children) {
        if (child.path === pathname) return child.name;
      }
    }
  }

  return "Dashboard";
};
