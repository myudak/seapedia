type MyudakkMarkProps = {
  size?: number;
  className?: string;
};

/**
 * "myudakk" author mark. Gradient ids are namespaced so multiple instances on a
 * page don't collide.
 */
export function MyudakkMark({ size = 24, className }: MyudakkMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="19 12 330 209"
      fill="none"
      role="img"
      aria-label="myudakk mark"
      className={className}
    >
      <defs>
        <linearGradient
          id="myudakk-left"
          x1="39"
          y1="28"
          x2="176"
          y2="113"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#424242" />
          <stop offset="1" stopColor="#303030" />
        </linearGradient>
        <linearGradient
          id="myudakk-right"
          x1="211"
          y1="29"
          x2="296"
          y2="177"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#E6DDCF" />
          <stop offset="1" stopColor="#D1C6B6" />
        </linearGradient>
        <linearGradient
          id="myudakk-tri"
          x1="151"
          y1="145"
          x2="151"
          y2="211"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#CC7048" />
          <stop offset="1" stopColor="#C26038" />
        </linearGradient>
      </defs>
      <path d="M29 22H138.5L184.5 110H77.5L29 22Z" fill="url(#myudakk-left)" />
      <path
        d="M233.5 22H338.5L229 197L184.5 110L233.5 22Z"
        fill="url(#myudakk-right)"
      />
      <path d="M151.5 144L189.5 211H113.5L151.5 144Z" fill="url(#myudakk-tri)" />
    </svg>
  );
}
