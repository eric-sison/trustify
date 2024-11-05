"use client";

import { Button } from "@trustify/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@trustify/components/ui/Form";
import { Input } from "@trustify/components/ui/Input";
import { Label } from "@trustify/components/ui/Label";
import { UserAddressSchema } from "@trustify/core/schemas/user-schema";
import { type FunctionComponent } from "react";
import { z } from "zod";
import { useProfileAddressForm } from "@trustify/core/hooks/use-profile-address-form";
import { LoadingSpinner } from "@trustify/components/ui/LoadingSpinner";

export const ProfileFormAddress: FunctionComponent<Partial<z.infer<typeof UserAddressSchema>>> = (
  address,
) => {
  const { form, isPending, submit } = useProfileAddressForm(address);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-10">
        <section className="space-y-10">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="country">Country</Label>
                </div>
                <FormControl>
                  <Input
                    id="country"
                    placeholder="(i.e., Philippines)"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>End-User&apos;s country of origin.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="street_address"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="streetAddress">Street Address</Label>
                </div>
                <FormControl>
                  <Input
                    id="streetAddress"
                    placeholder="Please enter user's street address"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Full street address, which may include house number, street name and barangay.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locality"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="locality">City</Label>
                </div>
                <FormControl>
                  <Input
                    id="locality"
                    placeholder="Please enter user's city name"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>End-User&apos;s city name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="region">Region</Label>
                </div>
                <FormControl>
                  <Input
                    id="region"
                    placeholder="Please enter user's region name"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>End-User&apos;s region name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="postalCode">Postal Code</Label>
                </div>
                <FormControl>
                  <Input
                    id="postalCode"
                    placeholder="Please enter user's postal code"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>End-User&apos;s postal code.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="flex items-center justify-end gap-2">
          <Button variant="secondary" type="submit" disabled={isPending}>
            {isPending ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size={18} />
                <span>Please Wait</span>
              </div>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </section>
      </form>
    </Form>
  );
};
