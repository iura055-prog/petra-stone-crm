'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const menuItems = [
  { label: 'Leads', href: '/dashboard/leads' },
  { label: 'Входящие', href: '/dashboard/inbox' },
  { label: 'Клиенты', href: '/dashboard/clients' },
  { label: 'Поставщики', href: '/dashboard/suppliers' },
  { label: 'Производство', href: '/dashboard/production' },
  { label: 'Сотрудники', href: '/dashboard/employees' },
  { label: 'Estimate Calendar', href: '/dashboard/estimate-calendar' },
  { label: 'Estimate Calculator', href: '/dashboard/estimate-calculator' },
  { label: 'Estimate Data', href: '/dashboard/estimate-data' },
  { label: 'Proposals', href: '/dashboard/proposals' },
  { label: 'Contracts', href: '/dashboard/contracts' },
  { label: 'Image Designer', href: '/dashboard/image-designer' },
  { label: 'Follow Up', href: '/dashboard/follow-up' },
  { label: 'Tasks', href: '/dashboard/tasks' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('petra_user');
    if (!stored) { router.push('/'); return; }
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-[#1A1208]">
      <aside className="w-64 bg-[#0F0B05] border-r border-[#C4A882]/10 flex flex-col fixed left-0 top-0 h-screen z-50">
        <div className="p-6 border-b border-[#C4A882]/10">
          <h1 className="text-2xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>PETRA</h1>
          <p className="text-[#C4A882]/50 text-xs mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>Stone for home</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button key={item.href} onClick={() => router.push(item.href)}
                className={'w-full text-left px-6 py-2.5 text-sm transition-all duration-200 flex items-center gap-3 ' + (isActive ? 'text-[#E86C2F] bg-[#E86C2F]/5 border-r-2 border-[#E86C2F]' : 'text-[#C4A882]/70 hover:text-[#C4A882] hover:bg-[#C4A882]/5')}
                style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <span className={'w-1.5 h-1.5 rounded-full ' + (isActive ? 'bg-[#E86C2F]' : 'bg-[#C4A882]/30')} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[#C4A882]/10">
          <button onClick={() => { localStorage.removeItem('petra_user'); router.push('/'); }}
            className="w-full text-left px-4 py-2 text-sm text-[#C4A882]/50 hover:text-red-400 transition-colors"
            style={{ fontFamily: 'DM Sans, sans-serif' }}>Выйти</button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
