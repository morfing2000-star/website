import { cookies } from 'next/headers';
import { getSession, getUserById } from '@/app/lib/data/store';

export async function getCurrentUser() {
  const token = cookies().get('anivex_session')?.value;
  const session = getSession(token);
  if (!session) return null;
  return getUserById(session.userId);
}
