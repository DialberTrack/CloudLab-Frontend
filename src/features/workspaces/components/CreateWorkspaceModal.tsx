import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { messageOf } from '@/shared/api/errors';
import { paths } from '@/shared/config/routes';
import { Alert } from '@/shared/ui/Alert';
import { TextField } from '@/shared/ui/Fields';
import { Modal } from '@/shared/ui/Modal';
import { useCreateWorkspace } from '../mutations';

const MIN_NAME_LENGTH = 3;

type CreateWorkspaceModalProps = {
  image: { id: string; name: string };
  onClose: () => void;
};

export function CreateWorkspaceModal({ image, onClose }: CreateWorkspaceModalProps) {
  const navigate = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = name.trim();
    if (normalized.length < MIN_NAME_LENGTH) {
      setValidationError(`El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres.`);
      return;
    }
    createWorkspace.mutate(
      { name: normalized, container_image_id: image.id },
      { onSuccess: (workspace) => navigate(paths.workspace(workspace.id)) }
    );
  };

  const error =
    validationError || (createWorkspace.isError ? messageOf(createWorkspace.error) : '');

  return (
    <Modal title="Crear workspace" subtitle={`Usando la imagen ${image.name}.`} onClose={onClose}>
      <form onSubmit={submit}>
        {error && (
          <Alert
            className="mb-4"
            message={error}
            onClose={() => {
              setValidationError('');
              createWorkspace.reset();
            }}
          />
        )}
        <TextField
          label="Nombre del workspace"
          value={name}
          maxLength={100}
          onChange={(event) => {
            setName(event.target.value);
            setValidationError('');
          }}
          placeholder="Mi workspace"
          autoFocus
        />
        <div className="justify-end gap-2 flex mt-6">
          <button
            type="button"
            className="ghost-button"
            onClick={onClose}
            disabled={createWorkspace.isPending}
          >
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={createWorkspace.isPending}>
            {createWorkspace.isPending ? 'Creando...' : 'Crear workspace'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
