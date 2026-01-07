"use server";

import { z } from "zod";
import { createSession, deleteSession } from "../lib/session";
import { redirect } from "next/navigation";
import { IUser } from "../utils/userUtils";
import { getUser } from "../service";

// used to validate login form
const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

function validatePassword(password: string, passwordDb: string) {
  if (password !== passwordDb) {
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  } else {
    return true;
  }
}

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const userToLogin: IUser = {
    email: result.data.email,
    encrPassword: result.data.password,
  };

  // check if user is in DB and return id, password and role
  const response = await getUser(userToLogin);
  const userInDB: IUser = await response?.json();

  if (
    userInDB &&
    validatePassword(userToLogin.encrPassword, userInDB.encrPassword)
  ) {
    if (userInDB.id) {
      // creates a JWT session
      await createSession(userInDB.id);
    }
  }
  //redirect to conversation page
  redirect(`${process.env.FULL_URL}/`);
}

export async function logout() {
  await deleteSession();
  redirect(`${process.env.FULL_URL}/login`);
}
