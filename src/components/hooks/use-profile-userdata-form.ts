"use client";

import { UpdateUserDataFormSchema } from "@trustify/core/schemas/user-schema";
import { UserData } from "@trustify/core/types/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { rpcClient } from "@trustify/utils/rpc-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono/client";
import { OidcError } from "@trustify/core/types/oidc-error";
import { toast } from "sonner";

export const useProfileUserdataForm = (user: UserData) => {
  const $userDataUpdate = rpcClient.api.v1.users["user-data"][":userid"].$patch;

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof UpdateUserDataFormSchema>>({
    resolver: zodResolver(UpdateUserDataFormSchema),
    // TODO: user birthdate
    defaultValues: {
      familyName: user.familyName ?? "",
      givenName: user.givenName ?? "",
      middleName: user.middleName ?? "",
      nickname: user.nickname ?? "",
      profile: user.profile ?? "",
      picture: user.picture ?? "",
      website: user.website ?? "",
      gender: user.gender ?? "Male",
      locale: user.locale ?? "",
      zoneinfo: user.zoneinfo ?? "",
    },
  });

  const { data, isPending, mutate } = useMutation<
    InferResponseType<typeof $userDataUpdate>,
    OidcError,
    InferRequestType<typeof $userDataUpdate>["json"]
  >({
    mutationKey: ["update_user_data"],
    mutationFn: async (data) => {
      const res = await $userDataUpdate({ json: data, param: { userid: user.id } });

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

      toast.success(`User data successfully updated!`);

      document.querySelector("body")?.scrollTo(0, 0);

      return data;
    },

    onError: (error) => {
      toast.error(`${error.message}`);

      return error;
    },
  });

  const submit = (values: z.infer<typeof UpdateUserDataFormSchema>) => {
    mutate(values);
  };

  return { form, submit, data, isPending };
};
