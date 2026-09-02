export function getRoleHomePath(user) {
    if (!user) return '/';
    if (user.is_platform_admin) return '/admin';
    if (user.role === 'owner') return '/dono';
    if (user.role === 'member') return '/questionarios';

    return '/';
}
