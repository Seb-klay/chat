import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";

export interface IUser {
  id?: string;
  email: string;
  encrPassword: string;
  role?: string;
}

// cost factor
const salt = genSaltSync(16);

export function encryptPassword(password: string) {
    // hash password
    const encrPassword = hashSync(password, salt);
    return encrPassword;
}

export async function validatePassword(password: string, passwordDb: string) {
    try{
      return await compareSync(password, passwordDb); // true or false
    } catch (err) {
      throw new Error("Email or password could not be compared. ");
    }
}