"use server";

import { z } from "zod";
import { createSession, deleteSession } from "../lib/session";
import { redirect } from "next/navigation";
import { getPool } from "../backend/database/utils/databaseUtils";

async function checkUser(email: string) {
    const pool = getPool();
    return await pool.query(
        'SELECT userid, userpassword, userrole FROM users WHERE email = $1',
        [email]
    );
}

const loginSchema = z.object({
  email: z.email({ message: "Invalid email address" }).trim(),
  password: z
    .string()
    //.min(8, { message: "Password must be at least 8 characters" })
    .trim(),
});

export async function login(prevState: any, formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password } = result.data;

  // check if user is in DB and return id, password and role
  const testUser = await checkUser(email)

  // check for password
  if (password !== testUser.rows[0].userpassword) {
    console.log(password)
    console.log(testUser.rows[0].userpassword)
    return {
      errors: {
        email: ["Invalid email or password"],
      },
    };
  }

  // creates a JWT session
  await createSession(testUser.rows[0].userid);

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}