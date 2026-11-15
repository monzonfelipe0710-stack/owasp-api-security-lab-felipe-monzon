export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  role: 'user' | 'admin';
  profile_picture_url?: string;
}