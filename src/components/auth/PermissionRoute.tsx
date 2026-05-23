import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { PermissionKey } from '../../context/AppContext';

interface PermissionRouteProps {
  permission: PermissionKey;
  redirectTo?: string;
  children: ReactElement;
}

export function PermissionRoute({ permission, redirectTo = '/dashboard', children }: PermissionRouteProps) {
  const { canAccess } = useAppContext();
  return canAccess(permission) ? children : <Navigate to={redirectTo} replace />;
}
