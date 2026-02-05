"use server";

import { encryptPassword, IUser } from "@/app/utils/userUtils";
import { validatePassword } from "../../utils/userUtils";
import z from "zod";
import { getUserWithEmail, updatePasswordUser } from "@/app/service";

const updatePasswordSchema = z
  .object({
    email: z.email(),

    currentPassword: z.string().min(1, {
      message: "Current password is required",
    }),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, { message: "Must include uppercase letter" })
      .regex(/[a-z]/, { message: "Must include lowercase letter" })
      .regex(/[0-9]/, { message: "Must include a number" })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must include a special character",
      }),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdateErrors = {
  email?: string[];
  currentPassword?: string[];
  password?: string[];
  confirmPassword?: string[];
  general?: string[];
};

const emptyUpdateErrors: UpdateErrors = {
  email: undefined,
  currentPassword: undefined,
  password: undefined,
  confirmPassword: undefined,
  general: undefined,
};

export async function updatePassword(prevState: any, formData: FormData) {
  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: {
        ...emptyUpdateErrors,
        ...result.error.flatten().fieldErrors,
      },
    };
  }

  try {
    const { email, currentPassword, password, confirmPassword } = result.data;

    const checkUser: IUser = {
      email: email,
      encrPassword: currentPassword, // raw password !
    };

    // check if user is in DB and return id, password and role
    const response = await getUserWithEmail(checkUser);
    const userInDB: IUser = await response?.json();

    if (
      !userInDB ||
      !(await validatePassword(checkUser.encrPassword, userInDB.encrPassword))
    ) {
      return {
        errors: {
          ...emptyUpdateErrors,
          currentPassword: ["Invalid password."],
        },
      };
    }
    // save new password in DB
    const encrPassword = encryptPassword(password);
    const responsePsw = await updatePasswordUser(encrPassword);

    if (responsePsw?.ok) {
      return {
        success: true,
        errors: emptyUpdateErrors,
      };
    } else {
      return {
        success: false,
        errors: {
          ...emptyUpdateErrors,
          password: ["Password could not be changed. Try again please. "],
        },
      };
    }
  } catch (err) {
    return {
      errors: {
        ...emptyUpdateErrors,
        general: ["A problem arose. Try again please."],
      },
    };
  }
}
