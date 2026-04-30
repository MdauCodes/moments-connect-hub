import { ReactNode, useEffect } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({
        to: "/account/login",
        state: { returnUrl: location.pathname } as never,
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, location.pathname]);

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
