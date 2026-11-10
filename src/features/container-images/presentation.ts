import type { ContainerImage, InterfaceType } from './types';

export const interfaceTypeLabel: Record<InterfaceType, string> = {
  desktop: 'Escritorio',
  terminal: 'Terminal',
};

/** Interfaces que ofrece una imagen: las de escritorio pueden sumar terminal. */
export const interfaceSummary = (image: Pick<ContainerImage, 'interface_type' | 'has_terminal'>) =>
  image.interface_type === 'desktop' && image.has_terminal
    ? `${interfaceTypeLabel.desktop} + ${interfaceTypeLabel.terminal}`
    : interfaceTypeLabel[image.interface_type];
