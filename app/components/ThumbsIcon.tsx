interface ThumbsIconProps {
  direction: "up" | "down";
  selected: boolean;
  className?: string;
}

export default function ThumbsIcon({
  direction,
  selected,
  className = "w-5 h-5",
}: ThumbsIconProps) {
  const isDown = direction === "down";
  const baseClass = `${className} inline-block`;
  const rotateClass = isDown ? "rotate-180" : "";
  const fillColor = selected
    ? isDown
      ? "text-red-100"
      : "text-green-100"
    : "text-gray-300";
  const strokeColor = selected ? (isDown ? "#fca5a5" : "#86efac") : "none";

  return (
    <svg
      className={`${baseClass} ${rotateClass} ${fillColor}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke={strokeColor}
      strokeWidth={1.5}
    >
      <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  );
}
