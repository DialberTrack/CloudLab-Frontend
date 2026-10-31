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
        <main className="relative grid h-[100dvh] place-items-center overflow-hidden bg-[#080b14] px-6 text-slate-100">
            <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
            <form
                onSubmit={submit}
                className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl"
            >
                <div className="mb-10">
                    <div className="mb-7 flex items-center gap-3">
                        <Logo />
                        <span className="text-lg font-semibold tracking-tight">CloudLab</span>
                    </div>
                    <p className="mb-2 text-sm font-medium text-cyan-300">Panel de control</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Administra tus entornos desde un solo lugar.
                    </p>
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
