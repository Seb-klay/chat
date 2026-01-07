export interface IUser {
  id?: string;
  email: string;
  encrPassword: string;
  role?: string;
}

// TODO crypting password