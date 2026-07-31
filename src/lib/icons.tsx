// icons.tsx
import { iconRegistry, type IconKey } from "./iconRegistry";

export type { IconKey };

export function Icon({ name, size = 16, className }: { name: IconKey; size?: number; className?: string }) {
  const Component = iconRegistry[name];
  return <Component size={size} className={className} />;
}
