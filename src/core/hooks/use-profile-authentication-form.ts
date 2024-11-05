"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateAuthenticationFormSchema } from "@trustify/core/schemas/user-schema";
import { OidcError } from "@trustify/core/types/oidc-error";
import { UserData } from "@trustify/core/types/user";
import { rpcClient } from "@trustify/utils/rpc-client";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const useProfileAuthenticationForm = (user: UserData) => {
  const $userAuthUpdate = rpcClient.api.v1.users["authentication-details"][":userid"].$patch;

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof UpdateAuthenticationFormSchema>>({
    resolver: zodResolver(UpdateAuthenticationFormSchema),
    defaultValues: {
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      preferredUsername: user.preferredUsername,
      suspended: user.suspended,
      phoneNumberVerified: user.phoneNumberVerified,
    },
  });

  const { data, isPending, mutate } = useMutation<
    InferResponseType<typeof $userAuthUpdate>,
    OidcError,
    InferRequestType<typeof $userAuthUpdate>["json"]
  >({
    mutationKey: ["update_user_auth_details"],
    mutationFn: async (data) => {
      const res = await $userAuthUpdate({ json: data, param: { userid: user.id } });

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
    onSuccess: (data) => {
      queryClient.invalidateQueries();

      toast.success(`Authentication details successfully updated!`);

      return data;
    },
    onError: (error) => {
      toast.error(`${error.message}`);
      return error;
    },
  });

  const submit = (values: z.infer<typeof UpdateAuthenticationFormSchema>) => {
    mutate(values);
  };

  const refresh = () => {
    form.setValue("email", user.email);
    form.setValue("phoneNumber", user.phoneNumber);
    form.setValue("emailVerified", user.emailVerified);
    form.setValue("preferredUsername", user.preferredUsername);
    form.setValue("suspended", user.suspended);
    form.setValue("phoneNumberVerified", user.phoneNumberVerified);
  };

  return { form, refresh, submit, data, isPending };
};
