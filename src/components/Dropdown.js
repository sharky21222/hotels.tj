import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Dropdown({
  value,
  options,
  onChange,
  label,
  className = "",
  dark = false
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const selected = options.find((o) => o.value === value)?.label || options[0].label;
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className} select-none`}
      style={{ minWidth: 130, fontFamily: "'Montserrat', Arial, sans-serif" }}
    >
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className={`w-full px-4 py-3 md:px-6 md:py-4 rounded-lg border transition-all font-semibold text-left flex justify-between items-center gap-2
        ${dark ? "bg-zinc-900 text-white border-yellow-400" : "bg-white text-black border-yellow-400"}
        shadow hover:scale-105`}
        whileHover={{ scale: 1.03, boxShadow: dark ? "0 0 0 2px #ffd70033" : "0 0 0 2px #ffd70055" }}
        whileTap={{ scale: 0.97 }}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{selected}</span>
        <span className="ml-2 text-xl">{open ? "▲" : "▼"}</span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -7 }}
            animate={{ opacity: 1, y: 2 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.14 }}
            className={`absolute left-0 mt-2 w-full z-30 rounded-lg shadow-2xl border
            ${dark ? "bg-zinc-900 border-yellow-400 text-white" : "bg-white border-yellow-400 text-black"}
            `}
            style={{ overflow: "hidden" }}
            role="listbox"
          >
            {options.map((o) => (
              <li
                key={o.value}
                className={`px-5 py-3 cursor-pointer transition-all font-semibold hover:bg-yellow-200/80
                ${dark ? "hover:text-black" : "hover:text-black"}
                ${value === o.value ? (dark ? "bg-yellow-400/80 text-black" : "bg-yellow-300/70") : ""}
                `}
                onClick={() => { onChange(o.value); setOpen(false); }}
                role="option"
                aria-selected={value === o.value}
                tabIndex={0}
              >
                {o.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
