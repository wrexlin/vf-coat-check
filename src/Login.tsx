import { Component } from "solid-js";
import { pb, useAuthMethods } from "./api";
import { createForm, SubmitHandler, zodForm } from "@modular-forms/solid";
import z from "zod";
import { TextInput } from "./components/form";
import { Center } from "./components/center";

export const Login: Component = () => {
   const authMethods = useAuthMethods();

   const hasPassword = () => authMethods()?.password.enabled;

   return <Center>
      <h2>Welcome to </h2>
      <h1> Vancoufur Coat Check </h1>
      {hasPassword() && <PasswordLogin />}
   </Center>
}

const LoginSchema = z.object({
   email: z.string().email(),
   password: z.string().min(3),
});

type LoginForm = z.infer<typeof LoginSchema>;

const PasswordLogin: Component = () => {
   const [loginForm, { Form, Field }] = createForm<LoginForm>({
      validate: zodForm(LoginSchema),
   })

   const handleSubmit: SubmitHandler<LoginForm> = async (values, event) => {
      try {
         let res = await pb.collection("users").authWithPassword(values.email, values.password);
         console.log(res);
      } catch (e) {
         console.error(e);
         throw new Error("Login failed");
      }
   }

   return <Form onSubmit={handleSubmit}>
      <fieldset>
         <legend>Login</legend>
         <Field name="email">
            {(field, props) => <TextInput field={field} props={props} label="E-Mail" type="email" />}
         </Field>

         <Field name="password">
            {(field, props) => <TextInput field={field} props={props} label="Password" type="password" />}
         </Field>
         {loginForm.response.message && <div class="terminal-alert terminal-alert-error">{loginForm.response.message}</div>}
         <button class="btn btn-default" style={{ width: "100%" }} type="submit">Login</button>
      </fieldset>
   </Form>
}