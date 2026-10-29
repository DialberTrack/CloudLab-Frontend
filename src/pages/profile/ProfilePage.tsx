import { useState } from 'react';
import { Alert } from '../../components/Alert';
import { Avatar } from '../../components/Avatar';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../app/AuthContext';
import { authApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';

export function ProfilePage() {
    const { user } = useAuth();
    const [current, setCurrent] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    if (!user) return null;
    const submit = async () => { try { await authApi.changePassword(current, password); setCurrent(''); setPassword(''); setMessage('Contraseña actualizada correctamente.'); } catch (reason) { setError(messageOf(reason)); } };
    return <>
        <PageHeader title="Mi perfil" subtitle="Administra tu información y seguridad." />
        <div className="grid max-w-3xl gap-6 md:grid-cols-2"><section className="panel"><Avatar user={user} large /><h2 className="mt-5 text-xl font-semibold">{user.name}</h2><p className="mt-1 text-sm text-slate-500">{user.email}</p><span className="status mt-4 bg-violet-500/10 text-violet-300 ring-violet-500/20">{user.role}</span></section><section className="panel"><h2 className="section-title">Cambiar contraseña</h2>{message && <p className="mt-4 text-sm text-emerald-300">{message}</p>}{error && <div className="mt-4"><Alert message={error} /></div>}<input className="field" type="password" value={current} onChange={(event) => setCurrent(event.target.value)} placeholder="Contraseña actual" /><input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Nueva contraseña" /><button className="primary-button mt-4" onClick={submit}>Actualizar contraseña</button></section></div>
    </>;
}
