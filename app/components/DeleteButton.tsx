"use client";

interface DeleteButtonProps {
  onDelete: () => void;
  size?: "sm" | "md";
  className?: string;
  showOnHover?: boolean;
}

export default function DeleteButton({
  onDelete,
  size = "md",
  className = "",
  showOnHover = false,
}: DeleteButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if used within links
    if (window.confirm("Are you sure you want to delete this query?")) {
      onDelete();
    }
  };

  const baseClasses =
    "transition-colors p-1 hover:text-red-600 focus:text-red-600";
  const visibilityClasses = showOnHover
    ? "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
    : "";
  const sizeClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${visibilityClasses} ${className}`}
      title="Delete query"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={sizeClasses}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}
