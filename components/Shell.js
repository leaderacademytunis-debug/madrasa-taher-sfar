"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Users, School, Shuffle, CalendarDays, ClipboardCheck,
  NotebookPen, UserCheck, Megaphone, Settings, Menu, X,
} from "lucide-react";
import { useStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "لوحة القيادة", icon: LayoutDashboard },
  { href: "/enseignants", label: "المعلمون", icon: Users },
  { href: "/classes", label: "الأقسام", icon: School },
  { href: "/affectation", label: "الإسناد", icon: Shuffle },
  { href: "/emplois", label: "جداول الأوقات", icon: CalendarDays },
  { href: "/appel", label: "دفتر المناداة", icon: ClipboardCheck },
  { href: "/journal", label: "العمل اليومي", icon: NotebookPen },
  { href: "/remplacements", label: "التعويض الذكي", icon: UserCheck },
  { href: "/publication", label: "النشر والفيسبوك", icon: Megaphone },
  { href: "/parametres", label: "الإعدادات", icon: Settings },
];

export default function Shell({ children }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { state } = useStore();

  return (
    <div className="flex min-h-screen">
      {/* الشريط الجانبي */}
      <aside
        className={`no-print fixed inset-y-0 right-0 z-40 w-72 transform bg-white border-l border-slate-200 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white font-display font-extrabold">ط.ص</div>
          <div className="leading-tight">
            <div className="font-display font-bold text-slate-900 text-sm">{state.school.nom}</div>
            <div className="text-xs text-slate-500">{state.school.ville} · {state.school.annee}</div>
          </div>
          <button className="mr-auto lg:hidden" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n) => {
            const actif = path === n.href;
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  actif ? "bg-brand-600 text-white shadow-soft" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 mx-3 rounded-xl bg-sand-50 border border-sand-200 p-3 text-xs text-slate-600 leading-relaxed">
          كل البيانات محفوظة محليا في متصفح المدير. لا تُرسل إلى أي خادم.
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="no-print sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-5 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <div className="font-display font-bold text-slate-800">
            {NAV.find((n) => n.href === path)?.label || "المنصة"}
          </div>
          <div className="mr-auto text-xs text-slate-500">{new Date().toLocaleDateString("ar-TN-u-nu-latn", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
        </header>
        <div className="p-5 lg:p-7">{children}</div>
      </main>
    </div>
  );
}
