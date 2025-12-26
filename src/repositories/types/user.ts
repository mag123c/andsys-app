export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AuthState =
  | { status: "guest"; guestId: string }
  | { status: "authenticated"; user: User }
  | { status: "loading" };
