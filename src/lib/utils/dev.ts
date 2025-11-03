export const DEV_UID = process.env.NEXT_PUBLIC_DEV_UID || "dev-user-0000001"
export const getUid = (uid?: string | null) => uid ?? DEV_UID

