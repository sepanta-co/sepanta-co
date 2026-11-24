const RAW_BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();
export const BASE_PATH = RAW_BASE
  ? (RAW_BASE.startsWith("/") ? RAW_BASE : `/${RAW_BASE}`).replace(/\/+$/, "")
  : "";

export function assetPath(path: string): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (BASE_PATH && (cleanPath === BASE_PATH || cleanPath.startsWith(`${BASE_PATH}/`))) {
    return cleanPath;
  }

  return `${BASE_PATH}${cleanPath}`;
}

export const getAssetPath = assetPath;
