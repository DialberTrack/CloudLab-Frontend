import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../app/AuthContext';
import { Alert } from '../../components/Alert';
import { Logo } from '../../components/Logo';
import { messageOf } from '../../lib/errors';

export function LoginPage() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
        } catch (reason) {
            setError(messageOf(reason));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="background-orb background-orb-violet" />
            <div className="background-orb background-orb-cyan" />
            <form onSubmit={submit} className="auth-card">
                <div className="auth-header">
                    <div className="auth-brand">
                        <Logo />
                        <span className="text-lg font-semibold tracking-tight">CloudLab</span>
                    </div>
                    <p className="auth-eyebrow">Panel de control</p>
                    <h1 className="auth-title">Bienvenido de vuelta</h1>
                    <p className="auth-description">Administra tus entornos desde un solo lugar.</p>
                </div>
                {error && <Alert message={error} />}
                <label className="field-label">
                    Correo electrónico
                    <input
                        className="field"
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="tu@empresa.com"
                    />
                </label>
                <label className="field-label mt-4">
                    Contraseña
                    <input
                        className="field"
                        type="password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                    />
                </label>
                <button className="primary-button mt-7 w-full" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                </button>
            </form>
        </main>
    );
}
