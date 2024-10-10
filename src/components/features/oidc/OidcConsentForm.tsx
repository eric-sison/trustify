"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { rpcClient } from "@trustify/core/libs/rpc-client";
import { LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { InferRequestType, InferResponseType } from "hono";

import { ApiError } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";
import { FunctionComponent, useEffect } from "react";
import { z } from "zod";
import { Button } from "../../ui/Button";

type OidcConsentFormProps = {
  loginRequest: z.infer<typeof LoginRequestSchema>;
};

export const OidcConsentForm: FunctionComponent<OidcConsentFormProps> = ({ loginRequest }) => {
  const $clientUser = rpcClient.api.v1.oidc["get-authentication-details"].$get;

  const $authorize = rpcClient.api.v1.oidc.authorize.$post;

  const $invalidateSession = rpcClient.api.v1.oidc.logout.$post;

  //const params = useSearchParams();

  const router = useRouter();

  const { data: clientUserDetails, error } = useQuery({
    queryKey: ["get_user_client_details"],
    retry: false,
    queryFn: async () => {
      const res = await $clientUser();

      if (!res.ok) {
        throw await res.json();
      }

      return await res.json();
    },
  });

  const authorize = useMutation<
    InferResponseType<typeof $authorize>,
    ApiError,
    InferRequestType<typeof $authorize>["query"]
  >({
    mutationKey: ["authorize_client"],
    mutationFn: async () => {
      const res = await $authorize({
        query: loginRequest,
      });

      if (!res.ok) {
        throw await res.json();
      }

      return await res.json();
    },
    onSuccess: (data) => {
      router.push(data.redirectUri);
    },
    onError: (err) => {
      // TODO: implement error handling
      console.log(err);
    },
  });

  const invalidateSession = useMutation({
    mutationKey: ["invalidate_session_login_another_account"],
    mutationFn: async () => {
      const res = await $invalidateSession();

      if (res.ok) {
        return await res.json();
      }
    },
    onSuccess: () => location.reload(),
  });

  // prevent redirecting while component is still rendering
  useEffect(() => {
    if (error) {
      // throw here so that the error.tsx will catch it
      throw error;
    }
  }, [error]);

  if (clientUserDetails) {
    return (
      <div className="space-y-7">
        <div>
          <h1 className="text-2xl font-bold">{clientUserDetails.client}</h1>
          <p>{clientUserDetails.email}</p>
        </div>
        <div className="flex gap-2 pb-10">
          <Button variant="outline">Deny</Button>
          <Button
            onClick={() => {
              authorize.mutate(loginRequest);
            }}
          >
            Allow
          </Button>
        </div>

        <Button variant="link" onClick={() => invalidateSession.mutate()}>
          Not you? Sign in using another account
        </Button>
      </div>
    );
  }
};
