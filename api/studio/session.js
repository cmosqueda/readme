import { clearSession, session } from "../../lib/studio-auth.js";

export default function handler(request, response) {
  if (request.method === "DELETE") { clearSession(response); return response.status(204).end(); }
  const current = session(request);
  if (!current) return response.status(401).json({ authenticated: false });
  return response.status(200).json({ authenticated: true, login: current.login });
}
