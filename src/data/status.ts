import { useEffect, useState } from "react";
import initialStatusData from "./status.json";

export interface ProfileStatus {
  emoji: string;
  message: string;
}

const STORAGE_KEY = "portfolio_profile_status";
const EVENT_KEY = "portfolio:status_change";

export const defaultStatus: ProfileStatus = {
  emoji: initialStatusData.emoji ?? "coffee",
  message: initialStatusData.message ?? "nabubuang",
};

export function getStoredStatus(): ProfileStatus {
  if (typeof window === "undefined") return defaultStatus;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStatus;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.message === "string" || typeof parsed?.emoji === "string") {
      return {
        emoji: typeof parsed.emoji === "string" ? parsed.emoji : defaultStatus.emoji,
        message: typeof parsed.message === "string" ? parsed.message : defaultStatus.message,
      };
    }
  } catch {
    // fallback to default
  }
  return defaultStatus;
}

export function saveStoredStatus(status: ProfileStatus) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: status }));
  } catch {
    // Ignore localStorage write failures
  }
}

export function clearStoredStatus() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: defaultStatus }));
  } catch {
    // Ignore localStorage write failures
  }
}

export function useProfileStatus(): [ProfileStatus, (next: ProfileStatus) => void] {
  const [status, setStatus] = useState<ProfileStatus>(getStoredStatus);

  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<ProfileStatus>;
      if (custom.detail) {
        setStatus(custom.detail);
      } else {
        setStatus(getStoredStatus());
      }
    };

    window.addEventListener(EVENT_KEY, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT_KEY, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const update = (next: ProfileStatus) => {
    saveStoredStatus(next);
    setStatus(next);
  };

  return [status, update];
}
