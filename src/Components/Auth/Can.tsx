import type { ReactNode } from "react";
import { useContext } from "react";
import { AuthContext } from "../../Context/AuthContextValue";
import type { Role } from "../../Context/AuthContextValue";

interface CanProps {
  roles?: Role[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * In-page role/permission guard.
 * Conditionally renders children if the current user has any of the allowed roles.
 *
 * Example:
 * <Can roles={["admin", "subadmin"]}>
 *   <button>Add Project</button>
 * </Can>
 */
export const Can = ({ roles, children, fallback = null }: CanProps) => {
  const auth = useContext(AuthContext);
  const userRole = auth?.user?.role;

  if (!roles || roles.length === 0) {
    return <>{children}</>;
  }

  if (userRole && roles.includes(userRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default Can;
