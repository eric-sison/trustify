"use client";

import { FunctionComponent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@trustify/components/ui/Dialog";
import { Separator } from "@trustify/components/ui/Separator";
import { Button } from "@trustify/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@trustify/components/ui/Select";
import { useTheme } from "next-themes";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@trustify/components/ui/Form";
import { useForm } from "react-hook-form";
import { UserPlus } from "lucide-react";
import { Input } from "../ui/Input";

export const CreateUserDialog: FunctionComponent = () => {
  const { theme } = useTheme();

  const form = useForm();

  return (
    <Dialog modal>
      <DialogTrigger asChild>
        <Button variant={theme === "dark" ? "secondary" : "default"}>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <div className="flex items-center gap-2">
              <UserPlus />
              <h3>Create User</h3>
            </div>
          </DialogTitle>
          {/* <DialogDescription>
            Please enter the necessary information to complete the registration of a new user.
          </DialogDescription> */}
        </DialogHeader>

        <Separator />

        <Form {...form}>
          <form>
            <section className="space-y-4">
              {/* <FormField
                name="given_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="user_role">User Role</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger id="user_role">
                            <SelectValue placeholder="Select the role for this user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              /> */}

              <FormField
                name="given_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="given_name">First Name</FormLabel>
                    <FormControl>
                      <Input
                        id="given_name"
                        placeholder="Your given name"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="middle_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="middle_name">Middle Name</FormLabel>
                    <FormControl>
                      <Input
                        id="middle_name"
                        placeholder="Your middle name"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="family_name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="family_name">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        id="family_name"
                        placeholder="Your last name"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="mail@example.com"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              /> */}

              <Button type="button">Next</Button>
            </section>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
