export interface UserPayload {
  idx: number;
  email: string;
  name: string;
  phone: string | null;
  birthDate: Date | null;
  status: number;
  emailVerifiedAt: Date | null;
}
