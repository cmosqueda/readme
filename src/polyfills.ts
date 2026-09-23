import { Buffer } from "buffer";

const browserWindow = window as typeof window & { Buffer: typeof Buffer };
browserWindow.Buffer = Buffer;
