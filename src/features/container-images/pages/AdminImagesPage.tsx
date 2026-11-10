import { useState } from 'react';
import { useErrorMessage } from '@/shared/hooks/useErrorMessage';
import { Alert } from '@/shared/ui/Alert';
import { useConfirm } from '@/shared/ui/confirm';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageHeader } from '@/shared/ui/PageHeader';
import { QueryContent } from '@/shared/ui/QueryContent';
import { ContainerImageIcon } from '../components/ContainerImageIcon';
import { ImageFormModal } from '../components/ImageFormModal';
import { ImageStatusBadge } from '../components/ImageStatusBadge';
import { useDeleteContainerImage } from '../mutations';
import { interfaceSummary } from '../presentation';
import { useContainerImages } from '../queries';
import type { ContainerImage } from '../types';

type FormTarget = { image?: ContainerImage } | null;

export function AdminImagesPage() {
  const imagesQuery = useContainerImages();
  const deleteImage = useDeleteContainerImage();
  const confirm = useConfirm();
  const { error, report, clear } = useErrorMessage();
  const [formTarget, setFormTarget] = useState<FormTarget>(null);

  const remove = async (image: ContainerImage) => {
    const accepted = await confirm({
      title: 'Eliminar imagen',
      message: `¿Eliminar la imagen "${image.name}"?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!accepted) return;
    clear();
    try {
      await deleteImage.mutateAsync(image.id);
    } catch (reason) {
      report(reason);
    }
  };

  return (
    <>
      <PageHeader
        title="Imágenes de contenedor"
        subtitle="Administra las imágenes disponibles para crear workspaces."
        action={
          <button type="button" className="primary-button" onClick={() => setFormTarget({})}>
            + Nueva imagen
          </button>
        }
      />
      {error && <Alert className="mb-6" message={error} onClose={clear} />}
      <section className="panel">
        <QueryContent
          query={imagesQuery}
          isEmpty={(images) => images.length === 0}
          empty={<EmptyState text="Aún no hay imágenes registradas." />}
        >
          {(images) => (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Referencia Docker</th>
                    <th scope="col">Interfaz</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Orden</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {images.map((image) => (
                    <tr key={image.id}>
                      <td>
                        <div className="items-center gap-3 flex font-medium text-slate-200">
                          <ContainerImageIcon name={image.name} icon={image.icon} />
                          {image.name}
                        </div>
                      </td>
                      <td className="font-mono text-xs">{image.image}</td>
                      <td>{interfaceSummary(image)}</td>
                      <td>
                        <ImageStatusBadge active={image.is_active} />
                      </td>
                      <td>{image.sort_order}</td>
                      <td className="space-x-2">
                        <button
                          type="button"
                          className="small-button"
                          onClick={() => setFormTarget({ image })}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="small-button text-rose-300"
                          disabled={deleteImage.isPending}
                          onClick={() => void remove(image)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </QueryContent>
      </section>
      {formTarget && (
        <ImageFormModal image={formTarget.image} onClose={() => setFormTarget(null)} />
      )}
    </>
  );
}
