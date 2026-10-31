import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import { Loading } from '../components/Loading';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { WorkspacesPage } from '../pages/workspaces/WorkspacesPage';
import { WorkspaceDetailPage } from '../pages/workspaces/WorkspaceDetailPage';
import { ImagesPage } from '../pages/images/ImagesPage';
import { ProfilePage } from '../pages/profile/ProfilePage';
import { AdminPage } from '../pages/admin/AdminPage';
import { AdminWorkspacesPage } from '../pages/admin/AdminWorkspacesPage';
import { AdminImagesPage } from '../pages/admin/AdminImagesPage';
import { AdminUserDetailPage } from '../pages/admin/AdminUserDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';

function ProtectedRoute() {
    const { user, loading } = useAuth();
    if (loading) return <Loading label="Restaurando sesión..." />;
    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
    const { user } = useAuth();
    return user?.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}

export function AppRouter() {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="workspaces" element={<WorkspacesPage />} />
                    <Route path="workspaces/:id" element={<WorkspaceDetailPage />} />
                    <Route path="images" element={<ImagesPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route element={<AdminRoute />}>
                        <Route path="admin/users" element={<AdminPage />} />
                        <Route path="admin/users/:id" element={<AdminUserDetailPage />} />
                        <Route path="admin/workspaces" element={<AdminWorkspacesPage />} />
                        <Route path="admin/images" element={<AdminImagesPage />} />
                    </Route>
                </Route>
            </Route>
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
}
