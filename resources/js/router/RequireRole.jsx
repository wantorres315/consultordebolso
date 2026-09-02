import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomePath } from './roleHome';

const CHECKS = {
    admin: (user) => user.is_platform_admin,
    owner: (user) => user.role === 'owner',
    member: (user) => user.role === 'member',
};

export default function RequireRole({ role, children }) {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/" replace />;
    if (!CHECKS[role](user)) return <Navigate to={getRoleHomePath(user)} replace />;

    if (
        (role === 'owner' || role === 'member') &&
        user.account?.plan_id &&
        user.account.subscription_status !== 'active'
    ) {
        return <Navigate to="/pagamento-pendente" replace />;
    }

    return children;
}
