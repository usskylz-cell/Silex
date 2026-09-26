"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Eye, Heart, ImagePlus, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { uploadCover } from "@/lib/image";
import { getCategories, type Category } from "@/lib/catalog";
import { CategorySelect } from "@/components/CategorySelect";
import type { MerchantProduct, Profile } from "@/lib/types";

type Row = MerchantProduct & { product_likes: { count: number }[] };

const COLORS = [
  "#111111",
  "#FFFFFF",
  "#D8CFC0",
  "#8B5E3C",
  "#C0A16B",
  "#43503B",
  "#1D4ED8",
  "#9D174D",
  "#B45309",
  "#6D28D9",
];

const inp = "w-full bg-chip rounded-2xl px-4 py-3 text-sm outline-none";
const iconBtn = "w-9 h-9 rounded-full bg-chip flex items-center justify-center";
const emptyForm = {
  title: "",
  description: "",
  hashtags: "",
  price: "",
  oldPrice: "",
  category: "",
  colors: [] as string[],
  sizes: "",
};

const parseTags = (raw: string) =>
  Array.from(new Set(raw.split(/[\s,،#]+/).filter(Boolean))).slice(0, 10);
const parseSizes = (raw: string) =>
  Array.from(new Set(raw.split(/[\s,،]+/).filter(Boolean))).slice(0, 12);

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};
const toEnglishDigits = (s: string) => s.replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGITS[d] ?? d);

export function ProductStudio({ profile }: { profile: Profile }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [f, setF] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("products")
      .select("*, product_likes(count)")
      .eq("merchant_id", profile.id)
      .order("created_at", { ascending: false });
    setRows((data ?? []) as unknown as Row[]);
  }, [profile.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getCategories().then(setCats);
  }, []);

  useEffect(() => {
    if (open) formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open, editing]);

  function startNew() {
    setEditing(null);
    setF(emptyForm);
    setFile(null);
    setPreview(null);
    setErr("");
    setOpen(true);
  }

  function startEdit(r: Row) {
    setEditing(r);
    setF({
      title: r.title,
      description: r.description ?? "",
      hashtags: (r.hashtags ?? []).map((h) => `#${h}`).join(" "),
      price: r.price?.toString() ?? "",
      oldPrice: r.old_price?.toString() ?? "",
      category: r.category ?? "",
      colors: r.colors ?? [],
      sizes: (r.sizes ?? []).join(" "),
    });
    setFile(null);
    setPreview(r.cover_url);
    setErr("");
    setOpen(true);
  }

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
  }

  async function save() {
    if (!f.title.trim()) return setErr("العنوان مطلوب");
    if (!(Number(f.price) > 0)) return setErr("السعر مطلوب");
    if (f.oldPrice && !(Number(f.oldPrice) > Number(f.price)))
      return setErr("السعر قبل الخصم يجب أن يكون أعلى من السعر");
    if (!f.category) return setErr("اختر التصنيف");
    if (!editing && !file) return setErr("أضف صورة الغلاف");
    setBusy(true);
    setErr("");
    try {
      let cover = editing?.cover_url ?? null;
      if (file) cover = await uploadCover(file, profile.id);
      const payload = {
        title: f.title.trim(),
        description: f.description.trim() || null,
        hashtags: parseTags(f.hashtags),
        price: Number(f.price),
        old_price: f.oldPrice ? Number(f.oldPrice) : null,
        category: f.category,
        colors: f.colors,
        sizes: parseSizes(f.sizes),
        cover_url: cover,
      };
      const { error } = editing
        ? await supabase.from("products").update(payload).eq("id", editing.id)
        : await supabase.from("products").insert({ ...payload, merchant_id: profile.id });
      if (error) throw error;
      setOpen(false);
      load();
    } catch {
      setErr("تعذّر الحفظ، حاول مرة أخرى");
    }
    setBusy(false);
  }

  async function togglePromote(r: Row) {
    await supabase.from("products").update({ promoted: !r.promoted }).eq("id", r.id);
    load();
  }

  async function remove(r: Row) {
    if (!confirm("حذف هذا المنتج نهائياً؟")) return;
    await supabase.from("products").delete().eq("id", r.id);
    load();
  }

  const initial = (profile.full_name ?? "؟").charAt(0);
  const catName = (id: string | null) => cats.find((c) => c.id === id)?.name;

  return (
    <div className="flex flex-col gap-4">
      {!open && (
        <button
          onClick={startNew}
          className="self-start flex items-center gap-2 bg-ink text-white rounded-pill px-4 py-2 text-sm font-medium"
        >
          <Plus size={16} />
          منتج جديد
        </button>
      )}

      {open && (
        <div ref={formRef} className="bg-card rounded-card shadow-soft p-4 flex flex-col gap-3">
          <h3 className="font-display text-[17px]">{editing ? "تعديل المنتج" : "رفع منتج"}</h3>

          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="relative w-full aspect-video rounded-2xl bg-chip overflow-hidden flex items-center justify-center text-sm text-muted"
          >
            {preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <span className="relative bg-ink/70 text-white rounded-pill px-3 py-1.5 text-xs">تعديل الغلاف</span>
              </>
            ) : (
              <span className="flex items-center gap-2">
                <ImagePlus size={18} />
                إضافة غلاف
              </span>
            )}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pick} />

          <input
            className={inp}
            placeholder="عنوان المنتج"
            maxLength={80}
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
          <textarea
            className={inp}
            rows={3}
            maxLength={300}
            placeholder="نبذة عن المنتج"
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />

          <CategorySelect
            categories={cats}
            value={f.category}
            onChange={(id) => setF({ ...f, category: id })}
            className={inp}
          />

          <div className="flex gap-3">
            <input
              className={inp}
              dir="ltr"
              inputMode="decimal"
              placeholder="السعر"
              value={f.price}
              onChange={(e) => setF({ ...f, price: toEnglishDigits(e.target.value).replace(/[^\d.]/g, "") })}
            />
            <input
              className={inp}
              dir="ltr"
              inputMode="decimal"
              placeholder="قبل الخصم (اختياري)"
              value={f.oldPrice}
              onChange={(e) => setF({ ...f, oldPrice: toEnglishDigits(e.target.value).replace(/[^\d.]/g, "") })}
            />
          </div>

          <div>
            <p className="text-xs text-muted mb-2">الألوان المتوفرة (اختياري)</p>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => {
                const on = f.colors.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() =>
                      setF({ ...f, colors: on ? f.colors.filter((x) => x !== c) : [...f.colors, c] })
                    }
                    className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${
                      on ? "border-ink" : "border-transparent"
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <input
            className={inp}
            placeholder="المقاسات (مثال: 39 40 41 أو S M L)"
            value={f.sizes}
            onChange={(e) => setF({ ...f, sizes: e.target.value })}
          />

          <input
            className={inp}
            placeholder="#هاشتاغات (افصل بينها بمسافة)"
            value={f.hashtags}
            onChange={(e) => setF({ ...f, hashtags: e.target.value })}
          />

          {err && <p className="text-xs text-red-500">{err}</p>}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="flex-1 bg-ink text-white rounded-pill py-3 text-sm font-medium disabled:opacity-50"
            >
              {busy ? "جارٍ الحفظ…" : editing ? "حفظ التعديلات" : "نشر"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="bg-chip text-ink/70 rounded-pill px-5 py-3 text-sm font-medium"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {rows?.length === 0 && !open && <p className="text-sm text-muted">لم تنشر أي منتج بعد</p>}

      {rows?.map((r) => (
        <article key={r.id} className="bg-card rounded-card shadow-soft overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-chip flex items-center justify-center text-sm font-display shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile.full_name}</p>
              <p className="text-xs text-muted">
                {new Date(r.created_at).toLocaleDateString("ar")}
                {catName(r.category) ? ` · ${catName(r.category)}` : ""}
              </p>
            </div>
            {r.promoted && (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-pill bg-ink text-white">مروَّج</span>
            )}
          </div>

          <div className="relative aspect-square bg-chip">
            {r.cover_url && (
              <Image
                src={r.cover_url}
                alt={r.title}
                fill
                sizes="(min-width: 768px) 480px, 100vw"
                className="object-cover"
              />
            )}
          </div>

          <div className="p-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <Eye size={16} />
                {r.views}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart size={16} />
                {r.product_likes?.[0]?.count ?? 0}
              </span>
              <span className="flex-1" />
              <button onClick={() => togglePromote(r)} aria-label="ترويج" className={iconBtn}>
                <Megaphone size={15} fill={r.promoted ? "currentColor" : "none"} />
              </button>
              <button onClick={() => startEdit(r)} aria-label="تعديل" className={iconBtn}>
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(r)} aria-label="حذف" className={iconBtn}>
                <Trash2 size={15} />
              </button>
            </div>

            <h3 className="font-semibold text-sm mt-3">{r.title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
              {r.price != null && <span className="text-sm">${r.price}</span>}
              {r.old_price != null && (
                <span className="text-xs text-muted line-through">${r.old_price}</span>
              )}
            </div>
            {r.description && <p className="text-sm text-muted mt-1">{r.description}</p>}
            {!!r.hashtags?.length && (
              <p className="text-xs mt-2 flex flex-wrap gap-x-2">
                {r.hashtags.map((t) => (
                  <span key={t}>#{t}</span>
                ))}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
