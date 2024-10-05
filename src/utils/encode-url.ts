type Url = {
  base: string;
  path?: string;
  params?: Record<string, string | undefined>;
};

export function encodeUrl(url: Url): string {
  // Build the query string if params are provided, else it will be an empty string
  const queryString = url.params
    ? Object.entries(url.params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
        .join("&")
    : "";

  // Construct the full URL, handling the optional path and query string

  // Add path only if it exists
  const fullPath = url.path ? `${url.path}` : "";

  // Add query string only if it exists
  const query = queryString ? `?${queryString}` : "";

  // Return the final encoded url
  return `${url.base}${fullPath}${query}`;
}
