import { genSaltSync, hashSync, compareSync } from "bcrypt-ts";

export interface IUser {
  id?: string;
  email: string;
  encrPassword: string;
  role?: string;
}

// cost factor
const salt = genSaltSync(16);

// TODO crypting password
export function encryptPassword(password: string) {
    // hash password
    const encrPassword = hashSync(password, salt);
    return encrPassword;

}

export function validatePassword(password: string, passwordDb: string) {
  return compareSync(password, passwordDb); // true or false
}