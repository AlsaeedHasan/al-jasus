import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-white/80 text-sm mb-2 font-medium">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full px-4 py-3
          bg-dark-700/50 
          border border-purple-500/30
          rounded-xl
          text-white text-right
          placeholder:text-white/30
          focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
          transition-all duration-200
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
