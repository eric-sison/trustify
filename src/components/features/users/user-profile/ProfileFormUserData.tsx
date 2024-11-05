"use client";

import { useEffect, type FunctionComponent } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@trustify/components/ui/Form";
import { Label } from "@trustify/components/ui/Label";
import { UserData } from "@trustify/core/types/user";
import { Input } from "@trustify/components/ui/Input";
import { Button } from "@trustify/components/ui/Button";
import { useProfileUserdataForm } from "@trustify/core/hooks/use-profile-userdata-form";
import { LoadingSpinner } from "@trustify/components/ui/LoadingSpinner";

export const ProfileFormUserData: FunctionComponent<UserData> = (user) => {
  const { form, isPending, refresh, submit } = useProfileUserdataForm(user);

  useEffect(() => {
    refresh();
  }, [user.id, refresh]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submit)} className="space-y-10">
        <section className="space-y-10">
          <FormField
            control={form.control}
            name="givenName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="givenName">First Name</Label>
                </div>
                <FormControl>
                  <Input
                    id="givenName"
                    placeholder="Please enter user's first name"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="select-none">
                  Given name(s) or first name(s) of the End-User.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="middleName">Middle Name</Label>
                </div>
                <FormControl>
                  <Input
                    id="middleName"
                    placeholder="Please enter user's middle name"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Middle name(s) of the End-User.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="familyName"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="familyName">Family Name</Label>
                </div>
                <FormControl>
                  <Input
                    id="familyName"
                    placeholder="Please enter user's family name"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Surname(s) or last name(s) of the End-User.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="nickname">Nickname</Label>
                </div>
                <FormControl>
                  <Input
                    id="nickname"
                    placeholder="Please enter user's nickname"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Casual name of the End-User that may or may not be the same as the Given Name.{" "}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="picture"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="picture">Avatar URL</Label>
                </div>
                <FormControl>
                  <Input
                    id="picture"
                    placeholder="https://myavatar.me"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL of the End-User&apos;s profile picture. This URL MUST refer to an image file.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="profile"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="profile">Profile page</Label>
                </div>
                <FormControl>
                  <Input
                    id="profile"
                    placeholder="https://myprofile.me"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL of the End-User&apos;s profile page. The contents of this Web page should be about the
                  End-User.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <Label htmlFor="website">Website URL</Label>
                </div>
                <FormControl>
                  <Input
                    id="website"
                    placeholder="https://mywebsite.me"
                    className="placeholder:select-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>URL of the End-User&apos;s Web page or blog.</FormDescription>
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
