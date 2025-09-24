import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleRoute({ children, allow }: { children: JSX.Element; allow: string | string[] }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/pages/login" replace />;
  const allowed = Array.isArray(allow) ? allow : [allow];
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}


