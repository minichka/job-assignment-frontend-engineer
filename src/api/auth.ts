import { apiGetJson, apiPostJson } from "./client";

/** Conduit `User` from login / register / `GET /user` (see `docs/schema/swagger.json`). */
export type AuthUser = {
  email: string;
  token: string;
  username: string;
  bio: string;
  image: string;
};

export type UserResponse = {
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  username: string;
  email: string;
  password: string;
};

/** `GET /user` — requires auth. */
export function fetchCurrentUser(token: string): Promise<UserResponse> {
  return apiGetJson<UserResponse>("/user", { token });
}

/** `POST /users/login` */
export function postLogin(credentials: LoginCredentials): Promise<UserResponse> {
  return apiPostJson<UserResponse>("/users/login", {
    user: {
      email: credentials.email,
      password: credentials.password,
    },
  });
}

/** `POST /users` — register; response status 201. */
export function postRegister(credentials: RegisterCredentials): Promise<UserResponse> {
  return apiPostJson<UserResponse>("/users", {
    user: {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
    },
  });
}
