import { apiGetJson } from "./client";
import type { ApiRequestOptions } from "./client";

/** Conduit `Profile` (see `docs/schema/swagger.json`). */
export type Profile = {
  username: string;
  bio: string;
  image: string;
  following: boolean;
};

export type ProfileResponse = {
  profile: Profile;
};

/** `GET /profiles/:username` — auth optional (for correct `following`). */
export function fetchProfileByUsername(
  username: string,
  options?: ApiRequestOptions
): Promise<ProfileResponse> {
  return apiGetJson<ProfileResponse>(`/profiles/${encodeURIComponent(username)}`, options);
}
