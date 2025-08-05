// src/components/Logo.tsx
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32Z"
        fill="#4F46E5"
      />
      <path
        d="M19.5 12.5L16 8L12.5 12.5L16 17L19.5 12.5Z"
        fill="white"
      />
      <path
        d="M19.5 19.5L16 24L12.5 19.5L16 15L19.5 19.5Z"
        fill="white"
      />
    </svg>
  );
}