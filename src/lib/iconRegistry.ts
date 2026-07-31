// iconRegistry.ts
// Central icon-key registry. Data files reference icons by string key so
// content (src/data/*.ts) never has to import or embed JSX/lucide components.
import {
  CheckCircle,
  Cpu,
  Database,
  FileCode,
  Terminal,
  Presentation,
  Network,
  Search,
  Mail,
  Globe,
  Github,
  type LucideIcon,
} from "lucide-react";

export const iconRegistry = {
  "check-circle": CheckCircle,
  cpu: Cpu,
  database: Database,
  "file-code": FileCode,
  terminal: Terminal,
  presentation: Presentation,
  network: Network,
  search: Search,
  email: Mail,
  linkedin: Globe,
  github: Github,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof iconRegistry;
