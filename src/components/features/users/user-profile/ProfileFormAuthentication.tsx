"use client";

import { type FunctionComponent } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@trustify/components/ui/Form";
import { useForm } from "react-hook-form";
import { Label } from "@trustify/components/ui/Label";
import { Input } from "@trustify/components/ui/Input";
import { z } from "zod";
import { UserRegistrationFormSchema } from "@trustify/core/schemas/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserData } from "@trustify/core/types/user";
import { Switch } from "@trustify/components/ui/Switch";
import { Button } from "@trustify/components/ui/Button";

export const ProfileFormAuthentication: FunctionComponent<UserData> = (user) => {
  const form = useForm<z.infer<typeof UserRegistrationFormSchema>>({
    resolver: zodResolver(UserRegistrationFormSchema),
    defaultValues: {
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      preferredUsername: user.preferredUsername,
      suspended: user.suspended,
      phoneNumberVerified: user.phoneNumberVerified,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={() => console.log("ok")} className="space-y-10">
        <section className="space-y-10">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email</Label>
                </div>
                <FormControl>
                  <Input
                    id="email"
                    placeholder="johndoe@example.com"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>End-User's preferred e-mail address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                </div>
                <FormControl>
                  <Input
                    id="phoneNumber"
                    placeholder="@username"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>End-User's preferred contact number.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredUsername"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="preferredUsername">Username</Label>
                </div>
                <FormControl>
                  <Input
                    id="preferredUsername"
                    placeholder="@username"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Shorthand name by which the End-User wishes to be referred to at the Requesting Party.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-1">
                <Label htmlFor="resetPassword">Password</Label>
                <p className="text-sm text-muted-foreground">Password is already set!</p>
              </div>

              <Button id="resetPassword" variant="secondary" type="button">
                Reset
              </Button>
            </div>

            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-1">
                    <Label htmlFor="emailVerified">Verify Email</Label>
                    <FormDescription>Bypass email verification process.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="emailVerified"
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumberVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-1">
                    <Label htmlFor="phoneNumberVerified">Verify Phone Number</Label>
                    <FormDescription>Bypass phone number verification process.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      id="phoneNumberVerified"
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="suspended"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-1">
                    <Label id="suspend">Suspend User</Label>
                    <FormDescription>Prevent the user from logging in.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch id="suspend" checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="flex items-center justify-end gap-2">
          <Button variant="ghost">Discard</Button>
          <Button variant="secondary">Save Changes</Button>
        </section>
      </form>
    </Form>
  );
};
