interface LoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_MAP = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

export function Loader({ size = "md", className = "" }: LoaderProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent text-blue-600 ${SIZE_MAP[size]} ${className}`}
    />
  );
}
