"use client";

import { LoginFormSchema, LoginRequestSchema } from "@trustify/core/schemas/auth-schema";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOIDCLogin } from "@trustify/core/hooks/use-oidc-login";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@trustify/components/ui/Form";
import { Label } from "@trustify/components/ui/Label";
import Link from "next/link";
import { PasswordInput } from "@trustify/components/ui/PasswordInput";
import { Alert, AlertDescription } from "@trustify/components/ui/Alert";
import { Input } from "@trustify/components/ui/Input";
import { LoadingSpinner } from "@trustify/components/ui/LoadingSpinner";
import { Button } from "@trustify/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@trustify/components/ui/Card";

export type OidcLoginFormProps = z.infer<typeof LoginRequestSchema>;

export const OidcLoginForm: React.FC<OidcLoginFormProps> = (loginRequest) => {
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = useOIDCLogin(form, loginRequest);

  const onSubmit = (values: z.infer<typeof LoginFormSchema>) => {
    login.mutate(values);
  };

  return (
    <div className="space-y-5">
      {login.error && (
        <Alert variant="destructive" className="flex animate-shake items-center">
          <AlertDescription className="font-semibold">{login.error.message}</AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Trustify</CardTitle>
              <CardDescription className="text-md">Welcome back! 👋</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-7">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="email">
                      Email <span className="text-rose-600">*</span>
                    </Label>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="select-none">
                      Please make sure to enter your active email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">
                        Password <span className="text-rose-600">*</span>
                      </Label>
                      <Link
                        tabIndex={-1}
                        href="/"
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>

                    <FormControl>
                      <PasswordInput
                        id="password"
                        placeholder="at least 8 characters long"
                        className="placeholder:select-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="select-none">Please enter your password.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="my-5">
              <Button disabled={login.data !== undefined} className="w-full space-x-2" type="submit">
                {login.data ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size={18} />
                    <span>Please Wait</span>
                  </div>
                ) : (
                  <span>Sign in</span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};
