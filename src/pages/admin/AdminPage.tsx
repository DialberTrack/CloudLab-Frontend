import { useCallback, useEffect, useState } from 'react';
import { Alert } from '../../components/Alert';
import { Loading } from '../../components/Loading';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { adminApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { User } from '../../types/api';

export function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [q, setQ] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalError, setModalError] = useState('');
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' as User['role'] });
    const load = useCallback(() => adminApi.users({ q }).then((response) => setUsers(response.data)), [q]);
    useEffect(() => { load().catch((reason) => setError(messageOf(reason))).finally(() => setLoading(false)); }, [load]);
    const create = async () => { try { await adminApi.createUser(form); setForm({ name: '', email: '', password: '', role: 'user' }); setModalOpen(false); setModalError(''); await load(); } catch (reason) { setModalError(messageOf(reason)); } };
    const toggle = async (user: User) => { try { await adminApi.updateUser(user.id, { is_active: !user.is_active }); await load(); } catch (reason) { setError(messageOf(reason)); } };
    const remove = async (user: User) => { if (!window.confirm(`¿Eliminar a ${user.name}?`)) return; try { await adminApi.removeUser(user.id); await load(); } catch (reason) { setError(messageOf(reason)); } };
    const reset = async (user: User) => { try { const response = await adminApi.resetPassword(user.id); window.alert(`Contraseña temporal de ${response.user.email}: ${response.user.newPassword}`); } catch (reason) { setError(messageOf(reason)); } };
    return <>
        <PageHeader
            title="Administración"
            subtitle="Gestiona usuarios y permisos de la plataforma."
            action={<button className="primary-button" onClick={() => { setModalError(''); setModalOpen(true); }}>+ Nuevo usuario</button>}
        />
        {error && <div className="mb-6"><Alert message={error} onClose={() => setError('')} /></div>}
        <section className="panel"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><h2 className="section-title">Usuarios</h2><input className="field mt-0 max-w-xs" placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} /></div>{loading ? <Loading /> : <div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{users.map((user) => { const isAdmin = user.role === 'admin'; return <tr key={user.id}><td><p className="font-medium text-slate-200">{user.name}</p><p className="text-xs">{user.email}</p></td><td>{user.role}</td><td>{user.is_active === false ? 'Inactivo' : 'Activo'}</td><td className="space-x-2"><button className="small-button" disabled={isAdmin} title={isAdmin ? 'Los administradores no se pueden desactivar' : undefined} onClick={() => toggle(user)}>{user.is_active === false ? 'Activar' : 'Desactivar'}</button><button className="small-button" disabled={isAdmin} title={isAdmin ? 'No se puede restablecer la clave de un administrador' : undefined} onClick={() => reset(user)}>Reset clave</button><button className="small-button text-rose-300" disabled={isAdmin} title={isAdmin ? 'Los administradores no se pueden eliminar' : undefined} onClick={() => remove(user)}>Eliminar</button></td></tr>; })}</tbody></table></div>}</section>
        {modalOpen && <Modal title="Crear usuario" subtitle="Registra una cuenta nueva en CloudLab." onClose={() => { setModalOpen(false); setModalError(''); }}><div className="space-y-4">{modalError && <Alert message={modalError} onClose={() => setModalError('')} />}<label className="field-label">Nombre<input className="field" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label className="field-label">Correo<input className="field" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label className="field-label">Contraseña<input className="field" type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><label className="field-label">Rol<select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as User['role'] })}><option value="user">Usuario</option><option value="admin">Administrador</option></select></label><div className="flex justify-end gap-2"><button className="ghost-button" onClick={() => setModalOpen(false)}>Cancelar</button><button className="primary-button" onClick={create}>Crear usuario</button></div></div></Modal>}
    </>;
}
