export default function Card({
  children,
  className = "",
  hoverEffect = true,
}) {
  const effectClasses = hoverEffect
    ? "transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl"
    : "";

  return (
    <div
      className={`glass-card ${effectClasses} ${className}`}
    >
      {children}
    </div>
  );
}
