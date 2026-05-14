import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Profile } from "../../api/profiles";
import { fetchProfileByUsername } from "../../api/profiles";

export type LoadProfileArg = {
  username: string;
  /** When set, `following` reflects the logged-in viewer */
  token?: string | null;
};

export const loadProfile = createAsyncThunk(
  "profile/loadProfile",
  async (arg: LoadProfileArg) => {
    const { username, token } = arg;
    return fetchProfileByUsername(username, token != null ? { token } : undefined);
  }
);

type ProfileState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
};

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.profile = null;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.profile = action.payload.profile;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load profile";
      });
  },
});

export type { Profile };
export default profileSlice.reducer;
