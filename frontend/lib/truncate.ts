export function truncateString(str: string, startChars = 4, endChars = 4) {
  // If the string is short enough, return it as is
  if (str.length <= startChars + endChars) {
    return str;
  }
  // Return the truncated string with ellipsis in the middle
  return (
    str.substring(0, startChars) + "..." + str.substring(str.length - endChars)
  );
}
