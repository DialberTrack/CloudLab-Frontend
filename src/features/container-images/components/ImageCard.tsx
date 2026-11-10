import { interfaceSummary } from '../presentation';
import type { ContainerImage } from '../types';
import { ContainerImageIcon } from './ContainerImageIcon';
import { ImageStatusBadge } from './ImageStatusBadge';

type ImageCardProps = {
  image: ContainerImage;
  /** Los administradores pueden usar imágenes inactivas (p. ej. para pruebas). */
  isAdmin: boolean;
  onUse: () => void;
};

export function ImageCard({ image, isAdmin, onUse }: ImageCardProps) {
  return (
    <article className="panel flex flex-col h-full">
      <div className="items-center justify-between gap-3 flex">
        <div className="items-center gap-3 flex min-w-0">
          <ContainerImageIcon name={image.name} icon={image.icon} />
          <h2 className="truncate font-semibold">{image.name}</h2>
        </div>
        <ImageStatusBadge active={image.is_active} className="shrink-0" />
      </div>
      <p className="mt-3 font-mono text-xs text-slate-500">{image.image}</p>
      <p className="mt-1 text-xs text-slate-500">{interfaceSummary(image)}</p>
      {image.description && <p className="mt-3 text-sm text-slate-400">{image.description}</p>}
      <div className="mt-auto pt-5">
        {image.is_active || isAdmin ? (
          <button type="button" className="primary-button w-full" onClick={onUse}>
            {image.is_active ? 'Usar en workspace' : 'Usar como administrador'}
          </button>
        ) : (
          <span
            className="block px-4 py-2.5 text-center text-sm text-slate-600 rounded-xl border border-white/10"
            title="Activa esta imagen desde administración para usarla"
          >
            No disponible
          </span>
        )}
      </div>
    </article>
  );
}
