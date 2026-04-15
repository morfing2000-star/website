const blacklist = ['badword1', 'badword2'];

export function containsProfanity(text: string) {
  const value = text.toLowerCase();
  return blacklist.some((word) => value.includes(word));
}
