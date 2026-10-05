const VERSION_LENGTH = 8;

/** Short commit hash of the running build; `0` when it was built without one (e.g. locally). */
export const currentVersion = ((import.meta.env.VERSION as string | undefined) || '0').substring(0, VERSION_LENGTH);
