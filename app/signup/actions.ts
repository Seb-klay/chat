"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { IUser, encryptPassword } from "../utils/userUtils";
import { createUser } from "../service";
import { createSession } from "../lib/session";

const signupSchema = z
  .object({
    email: z
      .email({ message: "Invalid email address" })
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character",
      }),

    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // This shows error on confirmPassword field
  });

export async function signup(prevState: any, formData: FormData) {
  const result = signupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // encrypt password before storing it
  const encrPassword = encryptPassword(password);

  const userToCreate: IUser = {
    email: email,
    encrPassword: encrPassword,
  };

  // create user in DB and return id, password and role
  const response = await createUser(userToCreate);
  const newUser: IUser = await response?.json();

  // check if response is ok
  if (response?.ok && newUser.id) {
    await createSession(newUser.id);
  }

  //redirect to conversation page
  redirect(`${process.env.FULL_URL}/`);
}