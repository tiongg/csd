import { useLocation } from '@tanstack/react-router';
import type { Account } from '@/context/AuthContext';

export default function useActiveRole() {
  const roles = ['ADMIN', 'CONTRIBUTOR', 'LEARNER'];

  const location = useLocation();
  const dir = location.href.split('/')[1]?.toUpperCase() ?? 'LEARNER';
  if (!roles.includes(dir)) return null;
  return dir as Account['role'];
}
