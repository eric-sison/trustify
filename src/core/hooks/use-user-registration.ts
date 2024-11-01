"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rpcClient } from "@trustify/utils/rpc-client";
import { useForm } from "react-hook-form";
import { UserRegistrationFormSchema } from "../schemas/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { InferRequestType, InferResponseType } from "hono";
import { OidcError } from "../types/oidc-error";
import { toast } from "sonner";
import { z } from "zod";
import { Dispatch, SetStateAction } from "react";

type UserRegistrationHook = {
  controlledDialogSetter: Dispatch<SetStateAction<boolean>>;
};

export const useUserRegistration = ({ controlledDialogSetter }: UserRegistrationHook) => {
  const queryClient = useQueryClient();

  const $register = rpcClient.api.v1.users.register.$post;

  const form = useForm<z.infer<typeof UserRegistrationFormSchema>>({
    resolver: zodResolver(UserRegistrationFormSchema),
    defaultValues: {
      email: "",
      password: "",
      preferredUsername: "",
      phoneNumber: "",
      emailVerified: false,
    },
  });

  const { data, isPending, mutate } = useMutation<
    InferResponseType<typeof $register>,
    OidcError,
    InferRequestType<typeof $register>["json"]
  >({
    mutationKey: ["register_user"],
    mutationFn: async (userInfo) => {
      const res = await $register({ json: userInfo });

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

      form.reset();

      controlledDialogSetter(false);

      toast.success(`Successfully registered ${data.preferredUsername}`);

      return data;
    },
    onError: (error) => {
      toast.error(`${error.message}`);

      return error;
    },
  });

  const submit = (values: z.infer<typeof UserRegistrationFormSchema>) => {
    mutate(values);
  };

  return { submit, form, data, isPending };
};
