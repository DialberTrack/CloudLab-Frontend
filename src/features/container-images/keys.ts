export const containerImageKeys = {
  all: ['container-images'] as const,
  list: () => [...containerImageKeys.all, 'list'] as const,
  detail: (id: string) => [...containerImageKeys.all, 'detail', id] as const,
};
