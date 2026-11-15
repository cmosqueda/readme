import React from "react";
import {
  Brain,
  Briefcase,
  Code2,
  Coffee,
  Flame,
  Globe,
  Heart,
  Laptop,
  MessageSquare,
  Moon,
  Palmtree,
  Rocket,
  Sparkles,
  Sun,
  Target,
  Terminal,
  Utensils,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface StatusIconOption {
  key: string;
  label: string;
  icon: LucideIcon;
}

export const statusIconList: StatusIconOption[] = [
  { key: "coffee", label: "Coffee", icon: Coffee },
  { key: "laptop", label: "Working", icon: Laptop },
  { key: "code", label: "Coding", icon: Code2 },
  { key: "terminal", label: "Terminal", icon: Terminal },
  { key: "rocket", label: "Shipping", icon: Rocket },
  { key: "target", label: "Focus", icon: Target },
  { key: "zap", label: "Building", icon: Zap },
  { key: "brain", label: "Thinking", icon: Brain },
  { key: "workflow", label: "Systems", icon: Workflow },
  { key: "sparkles", label: "Inspiring", icon: Sparkles },
  { key: "palmtree", label: "Away", icon: Palmtree },
  { key: "utensils", label: "Food", icon: Utensils },
  { key: "flame", label: "Urgent", icon: Flame },
  { key: "heart", label: "Passion", icon: Heart },
  { key: "moon", label: "Night owl", icon: Moon },
  { key: "sun", label: "Daylight", icon: Sun },
];

export const statusIconMap: Record<string, LucideIcon> = {
  coffee: Coffee,
  "☕": Coffee,
  laptop: Laptop,
  "💻": Laptop,
  code: Code2,
  terminal: Terminal,
  rocket: Rocket,
  "🚀": Rocket,
  target: Target,
  "🎯": Target,
  zap: Zap,
  "⚡": Zap,
  brain: Brain,
  "🧠": Brain,
  workflow: Workflow,
  "⚙️": Workflow,
  sparkles: Sparkles,
  "✨": Sparkles,
  palmtree: Palmtree,
  "🌴": Palmtree,
  utensils: Utensils,
  "🥣": Utensils,
  "🍕": Utensils,
  flame: Flame,
  "🔥": Flame,
  heart: Heart,
  moon: Moon,
  sun: Sun,
  globe: Globe,
  briefcase: Briefcase,
  "message-square": MessageSquare,
  "💬": MessageSquare,
};

export function renderStatusIcon(
  keyOrEmoji?: string,
  size = 14,
  className = "shrink-0"
): React.ReactNode {
  if (!keyOrEmoji) {
    return <Coffee size={size} className={className} aria-hidden="true" />;
  }

  const normalized = keyOrEmoji.trim().toLowerCase();
  const IconComponent = statusIconMap[normalized] || statusIconMap[keyOrEmoji.trim()];

  if (IconComponent) {
    return <IconComponent size={size} className={className} aria-hidden="true" />;
  }

  // Fallback for custom unicode text/emoji
  return (
    <span className={`inline-block leading-none ${className}`} aria-hidden="true">
      {keyOrEmoji}
    </span>
  );
}
