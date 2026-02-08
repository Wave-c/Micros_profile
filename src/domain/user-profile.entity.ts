import { Role } from './role';

export interface UserProfile {
  userId: number;
  roles: Role[];
  stack: string[];
  specialization: string[];
  telegramId?: number;
  status: 'ACTIVE' | 'BLOCKED';
}