import { useCallback, useEffect, useState } from 'react';
import { Alert } from '../../components/Alert';
import { ContainerImageIcon } from '../../components/ContainerImageIcon';
import { Modal } from '../../components/Modal';
import { PageHeader } from '../../components/PageHeader';
import { imageApi } from '../../lib/api';
import { messageOf } from '../../lib/errors';
import type { ContainerImage } from '../../types/api';

const emptyForm = {
    name: '',
    image: '',
    description: '',
    icon: '',
    is_active: true,
    sort_order: 0,
};

export function AdminImagesPage() {
    const [items, setItems] = useState<ContainerImage[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editing, setEditing] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const load = useCallback(() => imageApi.list().then((response) => setItems(response.data)), []);
    useEffect(() => { load().catch((reason) => setError(messageOf(reason))); }, [load]);
    const save = async () => {
        try {
            if (editing) {
                await imageApi.update(editing, form);
            } else {
                await imageApi.create(form);
            }
            setForm(emptyForm);
            setEditing(null);
            setModalOpen(false);
            setModalError('');
            await load();
        } catch (reason) { setModalError(messageOf(reason)); }
    };
    const remove = async (item: ContainerImage) => {
        if (!window.confirm(`¿Eliminar la imagen ${item.name}?`)) return;
        try { await imageApi.remove(item.id); await load(); } catch (reason) { setError(messageOf(reason)); }
    };
    return <>
        <PageHeader
            title="Imágenes de contenedor"
            subtitle="Administra las imágenes disponibles para crear workspaces."
            action={<button className="primary-button" onClick={() => { setEditing(null); setForm(emptyForm); setModalError(''); setModalOpen(true); }}>+ Nueva imagen</button>}
        />
        {error && <div className="mb-6"><Alert message={error} onClose={() => setError('')} /></div>}
        <section className="panel"><div className="overflow-x-auto"><table className="data-table"><thead><tr><th>Nombre</th><th>Referencia Docker</th><th>Estado</th><th>Orden</th><th>Acciones</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><div className="flex items-center gap-3 font-medium text-slate-200"><ContainerImageIcon name={item.name} icon={item.icon} />{item.name}</div></td><td className="font-mono text-xs">{item.image}</td><td>{item.is_active ? 'Activa' : 'Inactiva'}</td><td>{item.sort_order}</td><td className="space-x-2"><button className="small-button" onClick={() => { setEditing(item.id); setModalError(''); setForm({ name: item.name, image: item.image, description: item.description ?? '', icon: item.icon ?? '', is_active: item.is_active, sort_order: item.sort_order }); setModalOpen(true); }}>Editar</button><button className="small-button text-rose-300" onClick={() => remove(item)}>Eliminar</button></td></tr>)}</tbody></table></div></section>
        {modalOpen && (
            <Modal title={editing ? 'Editar imagen' : 'Registrar imagen'} subtitle="Configura la imagen que estará disponible para los workspaces." onClose={() => { setEditing(null); setForm(emptyForm); setModalError(''); setModalOpen(false); }}>
                {modalError && <div className="mb-4"><Alert message={modalError} onClose={() => setModalError('')} /></div>}
                <div className="space-y-4"><label className="field-label">Nombre<input className="field" placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="field-label">Referencia Docker<input className="field" placeholder="docker.io/org/imagen:tag" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} /></label><label className="field-label">Descripción<textarea className="field min-h-24 resize-y" placeholder="Descripción" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="field-label">Icono<input className="field" placeholder="URL o referencia del icono" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} /></label><label className="field-label">Orden de clasificación<input className="field" type="number" min="0" step="1" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Math.max(0, Number(event.target.value) || 0) })} /></label><label className="flex items-center gap-3 text-sm text-slate-300"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Disponible para usuarios</label><div className="flex justify-end gap-2"><button className="ghost-button" onClick={() => { setEditing(null); setForm(emptyForm); setModalError(''); setModalOpen(false); }}>Cancelar</button><button className="primary-button" onClick={save}>{editing ? 'Guardar cambios' : 'Crear imagen'}</button></div></div>
            </Modal>
        )}
    </>;
}
