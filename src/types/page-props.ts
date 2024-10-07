export type PageProps<T, K> = {
  params: T;
  searchParams: K;
};

export type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};
