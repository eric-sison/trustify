"use client";

import { FunctionComponent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@trustify/components/ui/Dialog";
import { Button } from "@trustify/components/ui/Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@trustify/components/ui/Form";
import { UserPlus } from "lucide-react";
import { Input } from "@trustify/components/ui/Input";
import { PasswordInput } from "@trustify/components/ui/PasswordInput";
import { Switch } from "@trustify/components/ui/Switch";
import { Label } from "@trustify/components/ui/Label";
import { useUserRegistration } from "@trustify/core/hooks/use-user-registration";
import { LoadingSpinner } from "@trustify/components/ui/LoadingSpinner";

export const CreateUserDialog: FunctionComponent = () => {
  const [open, setOpen] = useState(false);

  const { form, isPending, submit } = useUserRegistration({ controlledDialogSetter: setOpen });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Create User</span>
        </Button>
      </DialogTrigger>
      <DialogContent onClose={() => form.reset()} onInteractOutside={() => form.reset()}>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-2">
              <h3>Create User</h3>
            </div>
          </DialogTitle>
          <DialogDescription>Register a new user.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="mt-2" onSubmit={form.handleSubmit(submit)}>
            <section className="space-y-4">
              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">Email Address</Label>
                    <FormControl>
                      <Input
                        id="email"
                        placeholder="email@example.com"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emailVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-1">
                      <FormLabel>Verify Email</FormLabel>
                      <FormDescription className="text-orange-600 dark:text-orange-400">
                        This will bypass email verification process.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="phoneNumber"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <FormControl>
                      <Input
                        id="phoneNumber"
                        placeholder="The user's currently active mobile number"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="preferredUsername"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="preferredUsername">Username</Label>
                    <FormControl>
                      <Input
                        id="preferredUsername"
                        placeholder="@preferred_username"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="password">Password</Label>
                    <FormControl>
                      <PasswordInput
                        id="password"
                        placeholder="At least 8 characters long"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="mt-10 flex items-center justify-end gap-2">
              <Button disabled={isPending} className="w-full space-x-2" type="submit">
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size={18} />
                    <span>Please Wait</span>
                  </div>
                ) : (
                  <span>Create User</span>
                )}
              </Button>
            </section>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
