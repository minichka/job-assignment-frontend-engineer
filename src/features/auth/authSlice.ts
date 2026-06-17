import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { AuthUser, LoginCredentials, RegisterCredentials } from "../../api/auth";
import { fetchCurrentUser, postLogin, postRegister } from "../../api/auth";
import { ApiError } from "../../api/client";

const AUTH_TOKEN_STORAGE_KEY = "conduit_token";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  /** `false` until `restoreSession` finishes on app load (or after login/register). */
  initialized: boolean;
};

const initialState: AuthState = {
  user: null,
  token: null,
  initialized: false,
};

export const restoreSession = createAsyncThunk("auth/restoreSession", async () => {
  const stored = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (stored == null || stored === "") {
    return { user: null as AuthUser | null, token: null as string | null };
  }
  try {
    const { user } = await fetchCurrentUser(stored);
    if (user.token !== stored) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, user.token);
    }
    return { user, token: user.token };
  } catch {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return { user: null, token: null };
  }
});

export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const { user } = await postLogin(credentials);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, user.token);
      return user;
    } catch (e) {
      if (e instanceof ApiError) {
        return rejectWithValue(e.body);
      }
      throw e;
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const { user } = await postRegister(credentials);
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, user.token);
      return user;
    } catch (e) {
      if (e instanceof ApiError) {
        return rejectWithValue(e.body);
      }
      throw e;
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.initialized = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.initialized = true;
        state.user = null;
        state.token = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        state.initialized = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload;
        state.token = action.payload.token;
        state.initialized = true;
      });
  },
});

export const { logout } = authSlice.actions;
export type { AuthUser };
export default authSlice.reducer;
