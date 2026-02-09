"use server";

import { z } from "zod";
import { createSession, deleteSession } from "../../lib/session";
import { redirect } from "next/navigation";
import { IUser, validatePassword } from "../../utils/userUtils";
import { getUserWithEmail } from "../../service";

// used to validate login form
const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

type LoginErrors = {
  email?: string[];
  password?: string[];
  general?: string[];
};

const emptyLoginErrors: LoginErrors = {
  email: undefined,
  password: undefined,
  general: undefined,
};

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: {
        ...emptyLoginErrors,
        ...result.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const userToLogin: IUser = {
      email: result.data.email,
      encrPassword: result.data.password,
    };

    // check if user is in DB and return id, password and role
    const response = await getUserWithEmail(userToLogin);
    const userInDB: IUser = await response?.json();

    if (
      !userInDB ||
      !validatePassword(userToLogin.encrPassword, userInDB.encrPassword)
    ) {
      return {
        errors: {
          ...emptyLoginErrors,
          password: ["Invalid password"],
        },
      };
    }

    if (userInDB.id) {
      // creates a JWT session
      await createSession(userInDB.id);
    }
  } catch (err: any) {
    return {
      errors: {
        ...emptyLoginErrors,
        password: [err.message],
      },
    };
  }
  //redirect to conversation page
  redirect(`${process.env.FULL_URL}/`);
}

export async function logout() {
  await deleteSession();
  redirect(`${process.env.FULL_URL}/login`);
}
