import crypto from 'node:crypto';

export type AppRole = 'OWNER' | 'ADMIN' | 'MODERATOR' | 'USER';

export type DemoUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: AppRole;
  isBanned: boolean;
  banExpiresAt: string | null;
  verificationCode: string | null;
  resetToken: string | null;
  verified: boolean;
  discordId?: string;
};

export type DemoAnime = {
  id: string;
  title: string;
  description: string;
  genres: string[];
  year: number;
  status: 'ONGOING' | 'COMPLETED';
  rating: number;
};

const users = new Map<string, DemoUser>();
const sessions = new Map<string, { userId: string; expiresAt: number }>();
const animeList: DemoAnime[] = [
  { id: 'a1', title: 'Solo Leveling', description: 'Hunters and gates.', genres: ['Action', 'Fantasy'], year: 2026, status: 'ONGOING', rating: 9.1 },
  { id: 'a2', title: 'Frieren', description: 'Journey after the journey.', genres: ['Adventure', 'Drama'], year: 2024, status: 'COMPLETED', rating: 9.3 },
  { id: 'a3', title: 'Demon Slayer', description: 'Demon hunters.', genres: ['Action'], year: 2023, status: 'ONGOING', rating: 8.8 }
];

export function newToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function getUserByEmail(email: string) {
  return [...users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function saveUser(user: DemoUser) {
  users.set(user.id, user);
  return user;
}

export function getUserById(id: string) {
  return users.get(id) || null;
}

export function createSession(userId: string, maxAgeSec = 60 * 60 * 24 * 7) {
  const token = newToken();
  sessions.set(token, { userId, expiresAt: Date.now() + maxAgeSec * 1000 });
  return token;
}

export function getSession(token: string | undefined) {
  if (!token) return null;
  const record = sessions.get(token);
  if (!record) return null;
  if (record.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return record;
}

export function listAnime(params: { query?: string; genre?: string; year?: number; status?: 'ONGOING' | 'COMPLETED' }) {
  return animeList.filter((anime) => {
    if (params.query && !anime.title.toLowerCase().includes(params.query.toLowerCase())) return false;
    if (params.genre && !anime.genres.includes(params.genre)) return false;
    if (params.year && anime.year !== params.year) return false;
    if (params.status && anime.status !== params.status) return false;
    return true;
  });
}

export function seedOwner(hash: string) {
  if (getUserByEmail('owner@anivex.studio')) return;
  saveUser({
    id: 'u_owner',
    email: 'owner@anivex.studio',
    passwordHash: hash,
    role: 'OWNER',
    isBanned: false,
    banExpiresAt: null,
    verificationCode: null,
    resetToken: null,
    verified: true
  });
}
