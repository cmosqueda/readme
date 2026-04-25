import { Buffer } from "buffer";

// This handles the global assignment safely
(window as any).Buffer = Buffer;
