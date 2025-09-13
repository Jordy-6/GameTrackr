export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  password?: string;
}
