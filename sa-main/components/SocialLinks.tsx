"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Globe } from "lucide-react";
import {
  FaInstagram,
  FaTiktok,
  FaFacebook,
  FaXTwitter,
  FaWhatsapp,
  FaYoutube,
  FaSnapchat,
  FaTelegram,
} from "react-icons/fa6";
import { supabase } from "@/lib/supabase";

export type SocialLink = {
  id: string;
  user_id: string;
  platform: string;
  url: string;
  label: string | null;
  sort_order: number;
};

const PLATFORMS: Record<string, { icon: any; label: string; color: string }> = {
  instagram: { icon: FaInstagram, label: "إنستقرام", color: "#E4405F" },
  tiktok: { icon: FaTiktok, label: "تيك توك", color: "#111111" },
  facebook: { icon: FaFacebook, label: "فيسبوك", color: "#1877F2" },
  twitter: { icon: FaXTwitter, label: "إكس", color: "#111111" },
  whatsapp: { icon: FaWhatsapp, label: "واتساب", color: "#25D366" },
  youtube: { icon: FaYoutube, label: "يوتيوب", color: "#FF0000" },
  snapchat: { icon: FaSnapchat, label: "سناب شات", color: "#FFFC00" },
  telegram: { icon: FaTelegram, label: "تيليجرام", color: "#26A5E4" },
  website: { icon: Globe, label: "موقع إلكتروني", color: "#111111" },
};

// عرض للقراءة فقط (يُستخدم بصفحة البروفايل)
export function SocialLinksDisplay({ userId }: { userId: string }) {
  const [links, setLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    supabase
      .from("social_links")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order")
      .then(({ data }) => setLinks((data ?? []) as SocialLink[]));
  }, [userId]);

  if (!links.length) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {links.map((l) => {
        const meta = PLATFORMS[l.platform] ?? PLATFORMS.website;
        const Icon = meta.icon;
        return (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-chip hover:bg-line/40 transition-colors rounded-pill px-3 py-2 text-xs font-medium"
          >
            <Icon size={15} style={{ color: meta.color }} />
            <span>{l.label ?? meta.label}</span>
          </a>
        );
      })}
    </div>
  );
}

// محرر (يُستخدم بنافذة تعديل الملف)
export function SocialLinksEditor({ userId }: { userId: string }) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("instagram");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const load = () => {
    supabase
      .from("social_links")
      .select("*")
      .eq("user_id", userId)
      .order("sort_order")
      .then(({ data }) => {
        setLinks((data ?? []) as SocialLink[]);
        setLoading(false);
      });
  };

  useEffect(load, [userId]);

  async function handleAdd() {
    if (!url.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("social_links").insert({
      user_id: userId,
      platform,
      url: url.trim(),
      sort_order: links.length,
    });
    setAdding(false);
    if (!error) {
      setUrl("");
      load();
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("social_links").delete().eq("id", id);
    load();
  }

  if (loading) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-muted uppercase tracking-wider">
        روابط التواصل والمتاجر
      </h3>

      {links.map((l) => {
        const meta = PLATFORMS[l.platform] ?? PLATFORMS.website;
        const Icon = meta.icon;
        return (
          <div
            key={l.id}
            className="flex items-center gap-3 bg-chip rounded-xl px-3 py-2.5"
          >
            <Icon size={18} style={{ color: meta.color }} className="shrink-0" />
            <span className="flex-1 text-xs truncate">{l.url}</span>
            <a href={l.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} className="text-muted" />
            </a>
            <button onClick={() => handleDelete(l.id)}>
              <Trash2 size={14} className="text-red-500" />
            </button>
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="bg-chip border border-transparent rounded-xl px-2 py-2.5 text-xs focus:outline-none focus:border-ink/30"
        >
          {Object.entries(PLATFORMS).map(([key, v]) => (
            <option key={key} value={key}>
              {v.label}
            </option>
          ))}
        </select>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="flex-1 bg-chip border border-transparent rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-ink/30"
        />
        <button
          onClick={handleAdd}
          disabled={adding || !url.trim()}
          className="bg-ink text-white rounded-xl p-2.5 disabled:opacity-40"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
