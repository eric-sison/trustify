"use client";

import React from "react";
import { type FunctionComponent, type PropsWithChildren, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRQDevtoolsInProd } from "../hooks/use-rq-devtools-prod";

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import("@tanstack/react-query-devtools/build/modern/production.js").then((d) => ({
    default: d.ReactQueryDevtools,
  })),
);

export const QueryClientProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(new QueryClient());

  const show = useRQDevtoolsInProd((state) => state.show);
  const toggleDevtools = useRQDevtoolsInProd((state) => state.toggleDevtools);

  useEffect(() => {
    // @ts-expect-error - this is a custom function
    window.toggleDevtools = () => toggleDevtools();
  }, [toggleDevtools, show]);

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />

      {show && (
        <React.Suspense fallback={null}>
          <ReactQueryDevtoolsProduction />
        </React.Suspense>
      )}
    </ReactQueryClientProvider>
  );
};
