"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { useForm } from "react-hook-form";
import { z } from "zod";

export const ProfileFormAddress: FunctionComponent<Partial<z.infer<typeof UserAddressSchema>>> = (
  address,
) => {
  const form = useForm<z.infer<typeof UserAddressSchema>>({
    resolver: zodResolver(UserAddressSchema),
    defaultValues: {
      ...address,
    },
  });

  return (
    <Form {...form}>
      <form className="space-y-10">
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
                <FormDescription>End-User's country of origin.</FormDescription>
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
                <FormDescription>End-User's city name.</FormDescription>
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
                <FormDescription>End-User's region name.</FormDescription>
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
                <FormDescription>End-User's postal code.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="flex items-center justify-end gap-2">
          <Button variant="ghost">Discard</Button>
          <Button variant="secondary">Save Changes</Button>
        </section>
      </form>
    </Form>
  );
};