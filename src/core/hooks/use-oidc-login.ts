"use client";

import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { UseFormReturn } from "react-hook-form";
import { LoginFormSchema, LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { OidcError } from "@trustify/core/types/oidc-error";
import { rpcClient } from "@trustify/core/libs/rpc-client";
import { z } from "zod";

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
    onSuccess: (data) => {
      //redirect to consent page
      router.push(data.url);
    },

    // handle the error event
    onError: () => {
      // reset the password field
      form.resetField("password");

      // preserve focus on the password field
      form.setFocus("password");
    },
  });

  return { isLoading: isPending, error, mutate };
};
