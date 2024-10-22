export type PageProps<T, K> = {
  params: Promise<T>;
  searchParams: Promise<K>;
};

export type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};
