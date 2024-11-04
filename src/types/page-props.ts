export type PageProps<T = void, K = void> = {
  params?: Promise<T>;
  searchParams?: Promise<K>;
};

export type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};
