"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAddressSchema } from "@trustify/core/schemas/user-schema";
import { OidcError } from "@trustify/core/types/oidc-error";
import { rpcClient } from "@trustify/utils/rpc-client";
import { InferRequestType, InferResponseType } from "hono/client";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const useProfileAddressForm = (address: Partial<z.infer<typeof UserAddressSchema>>) => {
  const $userAddressUpdate = rpcClient.api.v1.users["user-address"][":userid"].$patch;

  const queryClient = useQueryClient();

  const params = useParams<{ userid: string }>();

  const form = useForm<z.infer<typeof UserAddressSchema>>({
    resolver: zodResolver(UserAddressSchema),
    defaultValues: {
      country: address.country ?? "",
      formatted: address.formatted ?? "",
      locality: address.locality ?? "",
      postal_code: address.postal_code ?? "",
      region: address.region ?? "",
      street_address: address.street_address ?? "",
    },
  });

  const { data, isPending, mutate } = useMutation<
    InferResponseType<typeof $userAddressUpdate>,
    OidcError,
    InferRequestType<typeof $userAddressUpdate>["json"]
  >({
    mutationKey: ["update_user_auth_details"],
    mutationFn: async (data) => {
      const res = await $userAddressUpdate({ json: data, param: { userid: params.userid } });

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

      toast.success(`User address successfully updated!`);

      return data;
    },
    onError: (error) => {
      toast.error(`${error.message}`);
      return error;
    },
  });

  const submit = (values: z.infer<typeof UserAddressSchema>) => {
    mutate(values);
  };

  const refresh = () => {
    form.setValue("country", address.country ?? "");
    form.setValue("formatted", address.formatted ?? "");
    form.setValue("locality", address.locality ?? "");
    form.setValue("postal_code", address.postal_code ?? "");
    form.setValue("region", address.region ?? "");
    form.setValue("street_address", address.street_address ?? "");
  };

  return { form, refresh, submit, data, isPending };
};
