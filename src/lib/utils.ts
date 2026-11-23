const isProd = process.env.NODE_ENV === "production";
export const BASE_PATH = isProd ? "/sepanta-co" : "";

export function getAssetPath(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${cleanPath}`;
}
