export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) {
  const styles = {
    primary:
      "bg-primary text-background shadow-glow-primary hover:bg-primary-dark",
    secondary:
      "border border-primary/40 bg-white/5 text-primary hover:bg-primary/10",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
    dark:
      "bg-white/10 text-white hover:bg-white/20",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold transition-all duration-300 hover:-translate-y-1 active:scale-95 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
