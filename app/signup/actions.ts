"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { IUser, encryptPassword } from "../utils/userUtils";
import { createUser } from "../service";
import { createSession } from "../lib/session";
import { isEmailVerified, sendVerificationCode, verifyCode } from "./verificationService";

// step 1 : sign up
const signupSchema = z
  .object({
    email: z.email({ message: "Invalid email address. " }).trim().toLowerCase(),

    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters. " })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter. ",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter. ",
      })
      .regex(/[0-9]/, { message: "Password must contain at least one number. " })
      .regex(/[^A-Za-z0-9]/, {
        message: "Password must contain at least one special character. ",
      }),

    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // This shows error on confirmPassword field
  });

type SignupErrors = {
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
  general?: string[];
};

const emptySignupErrors: SignupErrors = {
  email: undefined,
  password: undefined,
  confirmPassword: undefined,
  general: undefined,
};

export async function signup(prevState: any, formData: FormData) {
  const result = signupSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      temporaryData: undefined,
      errors: { 
        ...emptySignupErrors, 
        ...result.error.flatten().fieldErrors
      }
    };
  }

  try {
    const { email, password } = result.data;

    // check if email already exists
    if (await isEmailVerified(email)) {
      return {
        success: true,
        temporaryData: undefined,
        errors: {
          ...emptySignupErrors, 
          email: ["This email is already used. Please, login or try with another email address. "]
        },
      };
    }

    // encrypt password before storing it
    const encrPassword = encryptPassword(password);

    // send verification code
    const responseCode = await sendVerificationCode(email);
    if (responseCode.success) {
      return {
        success: true,
        temporaryData: {
          email: email,
          encrPassword: encrPassword,
        },
        errors: emptySignupErrors,
      };
    }

    // Error if didn't returned before
    return {
      success: false,
      temporaryData: undefined,
      errors: { 
        ...emptySignupErrors, 
        general: ["An error occurred. Please try again. "] },
    };
  } catch (err) {
    return {
      success: false,
      errors: {
        ...emptySignupErrors, 
        general: [ String(err) ]
      },
    };
  }
}

// Step 2: Verify code and complete registration
const signupStep2Schema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
  email: z.email(), // Hidden field
  encrPassword: z.string().min(1), // Hidden field
});

export async function verifyAndRegister(prevState: any, formData: FormData) {
  const validatedFields = signupStep2Schema.safeParse(
    Object.fromEntries(formData)
  );

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { code, encrPassword, email } = validatedFields.data;
  let success = false;

  try {
    // Verify the code
    const verificationResult = await verifyCode(email, code);

    if (!verificationResult.success) {
      return {
        errors: { code: [verificationResult.message || "Invalid code"] },
      };
    }

    // create new user
    const userToCreate: IUser = {
      email: email,
      encrPassword: encrPassword,
    };

    if (!userToCreate) {
      return {
        errors: { code: ["Session expired. Please start over."] },
      };
    }

    // create user in DB and return id, password and role
    const responseUser = await createUser(userToCreate);
    const newUser: IUser = await responseUser?.json();

    // check if response is ok
    if (responseUser?.ok && newUser.id) {
      success = true;
      await createSession(newUser.id);
    } 

  } catch (error) {
    return {
      errors: { code: ["An error occurred. Please try again. " + error] },
    };
  }
  //redirect to conversation page
  if (success)
    redirect(`${process.env.FULL_URL}/`);
}
