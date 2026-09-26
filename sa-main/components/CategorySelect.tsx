"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Category } from "@/lib/catalog";

export function CategorySelect({
  categories,
  value,
  onChange,
  placeholder = "اختر التصنيف",
  className = "",
}: {
  categories: Category[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = categories.find((c) => c.id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${className} w-full flex items-center justify-between text-right`}
      >
        <span className={selected ? "" : "text-muted"}>{selected ? selected.name : placeholder}</span>
        <ChevronDown size={16} className={`text-ink/50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-card border border-chip rounded-2xl shadow-float overflow-hidden max-h-64 overflow-y-auto">
          {categories.map((c) => {
            const active = c.id === value;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-right hover:bg-chip transition-colors ${
                  active ? "bg-chip font-semibold" : ""
                }`}
              >
                {c.name}
                {active && <Check size={14} className="text-ink" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
