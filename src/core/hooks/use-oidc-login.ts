"use client";

import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { LoginFormSchema, LoginRequestSchema } from "../schemas/auth-schema";
import { OidcError } from "@trustify/types/oidc-error";
import { encodeUrl } from "@trustify/utils/encode-url";
import { rpcClient } from "@trustify/utils/rpc-client";

export const useOIDCLogin = (
  form: UseFormReturn<z.infer<typeof LoginFormSchema>, unknown, undefined>,
  loginRequest: z.infer<typeof LoginRequestSchema>,
) => {
  // initialize login rpc client
  const $login = rpcClient.api.v1.oidc.login.$post;

  // initialize router - to be used to redirect user to /consent once login is successful
  const router = useRouter();

  const { isPending, error, mutate } = useMutation<
    InferResponseType<typeof $login>,
    OidcError,
    InferRequestType<typeof $login>["form"]
  >({
    mutationKey: ["login_user_oidc"],
    mutationFn: async (credentials) => {
      const res = await $login({
        form: credentials,
        query: loginRequest,
      });

      // turn the response from the server into json
      const response = await res.json();

      // if there was an error, throw it
      if (!res.ok) {
        // console.log(res.headers.get("ratelimit-remaining"));
        throw response;
      }

      // otherwise, return the resulting login details
      return response;
    },

    // handle the success event
    onSuccess: () => {
      //construct the consent url
      const consentUrl = encodeUrl({
        base: process.env.NEXT_PUBLIC_ADMIN_HOST!,
        path: "/consent",
        params: { ...loginRequest },
      });

      //redirect to consent page
      router.push(consentUrl);
    },

    // handle the error event
    onError: () => {
      // reset the password field
      form.resetField("password");
    },
  });

  return { isLoading: isPending, error, mutate };
};
