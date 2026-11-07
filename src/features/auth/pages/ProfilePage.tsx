import { Avatar } from '@/shared/ui/Avatar';
import { PageHeader } from '@/shared/ui/PageHeader';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { useAuth } from '../AuthContext';
import { ChangePasswordForm } from '../ChangePasswordForm';
import { roleLabel, roleTone } from '../roles';

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Administra tu información y seguridad." />
      <div className="gap-6 grid max-w-3xl md:grid-cols-2">
        <section className="panel">
          <Avatar name={user.name} large />
          <h2 className="mt-5 text-xl font-semibold">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          <StatusBadge tone={roleTone[user.role]} className="mt-4">
            {roleLabel[user.role]}
          </StatusBadge>
        </section>
        <section className="panel">
          <ChangePasswordForm />
        </section>
      </div>
    </>
  );
}
