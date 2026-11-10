import { useState } from 'react';
import type { FormEvent } from 'react';
import { messageOf } from '@/shared/api/errors';
import { Alert } from '@/shared/ui/Alert';
import { CheckboxField, SelectField, TextAreaField, TextField } from '@/shared/ui/Fields';
import { Modal } from '@/shared/ui/Modal';
import { useCreateContainerImage, useUpdateContainerImage } from '../mutations';
import { interfaceTypeLabel } from '../presentation';
import type {
  ContainerImage,
  CreateContainerImageInput,
  InterfaceType,
  UpdateContainerImageInput,
} from '../types';

type FormState = {
  name: string;
  image: string;
  description: string;
  icon: string;
  interface_type: InterfaceType;
  has_terminal: boolean;
  is_active: boolean;
  sort_order: number;
};

const INTERFACE_TYPES = Object.keys(interfaceTypeLabel) as InterfaceType[];

const emptyForm: FormState = {
  name: '',
  image: '',
  description: '',
  icon: '',
  interface_type: 'desktop',
  has_terminal: false,
  is_active: true,
  sort_order: 0,
};

const formFor = (image?: ContainerImage): FormState =>
  image
    ? {
        name: image.name,
        image: image.image,
        description: image.description ?? '',
        icon: image.icon ?? '',
        interface_type: image.interface_type,
        has_terminal: image.has_terminal,
        is_active: image.is_active,
        sort_order: image.sort_order,
      }
    : emptyForm;

/** Los campos opcionales vacíos se envían como `null`, no como cadena vacía. */
const toUpdateInput = (form: FormState): UpdateContainerImageInput => ({
  name: form.name.trim(),
  image: form.image.trim(),
  description: form.description.trim() || null,
  icon: form.icon.trim() || null,
  is_active: form.is_active,
  sort_order: form.sort_order,
});

/** Solo al crear se envían `interface_type` y `has_terminal`; después ya no se editan. */
const toCreateInput = (form: FormState): CreateContainerImageInput => ({
  name: form.name.trim(),
  image: form.image.trim(),
  description: form.description.trim() || null,
  icon: form.icon.trim() || null,
  is_active: form.is_active,
  sort_order: form.sort_order,
  interface_type: form.interface_type,
  has_terminal: form.interface_type === 'terminal' ? true : form.has_terminal,
});

type ImageFormModalProps = {
  /** Con `image` el formulario edita; sin ella, registra una nueva. */
  image?: ContainerImage;
  onClose: () => void;
};

export function ImageFormModal({ image, onClose }: ImageFormModalProps) {
  const createImage = useCreateContainerImage();
  const updateImage = useUpdateContainerImage();
  const [form, setForm] = useState(() => formFor(image));
  const mutation = image ? updateImage : createImage;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (image) {
      updateImage.mutate({ id: image.id, input: toUpdateInput(form) }, { onSuccess: onClose });
    } else {
      createImage.mutate(toCreateInput(form), { onSuccess: onClose });
    }
  };

  return (
    <Modal
      title={image ? 'Editar imagen' : 'Registrar imagen'}
      subtitle="Configura la imagen que estará disponible para los workspaces."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={submit}>
        {mutation.isError && (
          <Alert message={messageOf(mutation.error)} onClose={() => mutation.reset()} />
        )}
        <TextField
          label="Nombre"
          placeholder="Nombre"
          required
          minLength={3}
          maxLength={100}
          value={form.name}
          onChange={(event) => set('name', event.target.value)}
        />
        <TextField
          label="Referencia Docker"
          placeholder="docker.io/org/imagen:tag"
          required
          maxLength={255}
          value={form.image}
          onChange={(event) => set('image', event.target.value)}
        />
        <TextAreaField
          label="Descripción"
          className="min-h-24 resize-y"
          placeholder="Descripción"
          maxLength={65535}
          value={form.description}
          onChange={(event) => set('description', event.target.value)}
        />
        <TextField
          label="Icono"
          placeholder="URL o referencia del icono"
          maxLength={255}
          value={form.icon}
          onChange={(event) => set('icon', event.target.value)}
        />
        <SelectField
          label="Tipo de interfaz"
          value={form.interface_type}
          disabled={Boolean(image)}
          onChange={(event) => set('interface_type', event.target.value as InterfaceType)}
        >
          {INTERFACE_TYPES.map((type) => (
            <option key={type} value={type}>
              {interfaceTypeLabel[type]}
            </option>
          ))}
        </SelectField>
        <CheckboxField
          label="Incluye terminal"
          checked={form.interface_type === 'terminal' || form.has_terminal}
          disabled={Boolean(image) || form.interface_type === 'terminal'}
          onChange={(event) => set('has_terminal', event.target.checked)}
        />
        {image && (
          <p className="text-xs text-slate-500">
            El tipo de interfaz y la terminal no se pueden cambiar: los workspaces existentes
            dependen de ellos.
          </p>
        )}
        <TextField
          label="Orden de clasificación"
          type="number"
          min={0}
          step={1}
          value={form.sort_order}
          onChange={(event) => set('sort_order', Math.max(0, Number(event.target.value) || 0))}
        />
        <CheckboxField
          label="Disponible para usuarios"
          checked={form.is_active}
          onChange={(event) => set('is_active', event.target.checked)}
        />
        <div className="justify-end gap-2 flex">
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={mutation.isPending}>
            {image ? 'Guardar cambios' : 'Crear imagen'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
