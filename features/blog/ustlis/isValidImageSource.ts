export function isValidImageSource(source: string): boolean {
  return (
    typeof source === "string" &&
    (/^https?:\/\//.test(source) || source.startsWith("/"))
  );
}
