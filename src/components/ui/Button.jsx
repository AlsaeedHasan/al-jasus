import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-500 hover:to-orange-400 text-white",
  secondary:
    "bg-dark-700 hover:bg-dark-600 text-white border border-purple-500/30",
  danger:
    "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white",
  success:
    "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white",
  ghost: "bg-transparent hover:bg-white/10 text-white",
  outline:
    "bg-transparent border-2 border-purple-500 hover:bg-purple-500/20 text-white",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  xl: "px-10 py-5 text-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = "start",
  onClick,
  ...props
}) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        rounded-xl font-bold
        flex items-center justify-center gap-2
        transition-all duration-200
        shadow-lg
        ${className}
      `}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {Icon && iconPosition === "start" && (
        <Icon size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
      )}
      {children}
      {Icon && iconPosition === "end" && (
        <Icon size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
      )}
    </motion.button>
  );
}
