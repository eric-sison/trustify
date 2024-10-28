"use client";

import { useMutation } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { useRouter } from "next/navigation";
import { useForm, UseFormReturn } from "react-hook-form";
import { LoginFormSchema, LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import { OidcError } from "@trustify/core/types/oidc-error";
import { rpcClient } from "@trustify/utils/rpc-client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const useOIDCLogin = (loginRequest: z.infer<typeof LoginRequestSchema>) => {
  // initialize login rpc client
  const $login = rpcClient.api.v1.oidc.login.$post;

  // Initialize login form
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // initialize router - to be used to redirect user to /consent once login is successful
  const router = useRouter();

  const { data, error, mutate } = useMutation<
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
      // Transform redirect_uri into a URL object
      const redirectUri = new URL(loginRequest.redirect_uri);

      // Transform the generated url into a URL object
      const url = new URL(data.url);

      // Check if loginRequest.display is "popup"
      if (loginRequest.display === "popup") {
        // Check if the generated url is the redirect_uri
        if (url.pathname === redirectUri.pathname) {
          // If so, allow the child popup window to post a message to the parent window.
          // Pass sucess flag to true, and the generated url data
          window.opener.postMessage(
            {
              success: true,
              url: url.href,
            },
            "*",
          );

          // Once data has been passed to the parent window, close the popup window
          window.close();
        }

        // Redirect to the next url. Note that when the window.close() has been called,
        // this line will no longer be invoked.
        router.push(url.href);
      }

      // Check if display is not provided, or if its value is "page"
      if (!loginRequest.display || loginRequest.display === "page") {
        // If so, redirect to the generated url right away.
        router.push(url.href);
      }
    },

    // handle the error event
    onError: () => {
      // reset the password field
      form.resetField("password");

      // preserve focus on the password field
      form.setFocus("password");
    },
  });

  const submit = (values: z.infer<typeof LoginFormSchema>) => {
    mutate(values);
  };

  return { data, error, form, submit };
};
