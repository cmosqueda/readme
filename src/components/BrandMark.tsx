type Props = {
  size?: number;
  className?: string;
};

/** 4-tile stepped diagonal pixel-diamond mark echoing the orbital banner. */
export default function BrandMark({ size = 20, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="6" height="6" rx="1.5" fill="#e2e8f0" />
      <rect x="7" y="7" width="6" height="6" rx="1.5" fill="#94a3b8" />
      <rect x="11" y="11" width="6" height="6" rx="1.5" fill="#60a5fa" />
      <rect x="15" y="15" width="6" height="6" rx="1.5" fill="#2563eb" />
    </svg>
  );
}
