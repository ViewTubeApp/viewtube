export function getRandomUsername(prefix = "user", separator = "_") {
  return `${prefix}${separator}${Math.random().toString(36).substring(2, 15)}`;
}
