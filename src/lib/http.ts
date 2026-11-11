/**
 * Reads a JSON API response without crashing on an empty or non-JSON body
 * (e.g. a server error page), so the user sees a friendly message instead of
 * "Unexpected end of JSON input".
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function readJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return { error: "Something went wrong. Please try again in a moment." };
  }
}
