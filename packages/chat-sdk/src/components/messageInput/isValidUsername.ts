export function isValidUsername(username: string) {
  return /^@\w{1,15}$/.test(username);
}
