import currentUser from "@/data/currentUser";

import { profiles } from "@/data/profiles";

export default function getCurrentUserProfile() {
  if (typeof window === "undefined") {
    return profiles.find(
      (profile) =>
        profile.id ===
        currentUser.id
    );
  }

  const savedProfiles =
    localStorage.getItem(
      "envoiture-profiles"
    );

  const parsedProfiles =
    savedProfiles
      ? JSON.parse(savedProfiles)
      : profiles;

  return parsedProfiles.find(
    (profile) =>
      profile.id ===
      currentUser.id
  );
}