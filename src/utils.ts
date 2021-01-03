export const BASE_URL = "https://swapi.dev/api/people/";
export const https = (url?: string | null) => url?.replace("http", "https");
export const search = (query?: string | null) =>
  get(`${BASE_URL}?search=${query || ""}`);

export const get = async (url: string) => {
  const result = await fetch(url);

  if (!result.ok) {
    throw Error(`Fetching "${url}" failed.`);
  }

  return result.json();
};
