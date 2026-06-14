'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('petra_user');
    if (!stored) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  const stats = [
    { label: 'Лидов', value: '12', change: '+3 за неделю' },
    { label: 'Смет', value: '8', change: '2 готовы к отправке' },
    { label: 'Встреч', value: '5', change: 'сегодня 2' },
    { label: 'Контрактов', value: '3', change: '1 ожидает подписи' },
  ];

  const quickActions = [
    { label: 'Новый лид', href: '/dashboard/leads' },
    { label: 'Создать смету', href: '/dashboard/estimate-calculator' },
    { label: 'Запланировать замер', href: '/dashboard/estimate-calendar' },
    { label: 'Отправить КП', href: '/dashboard/proposals' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl text-[#F5F0E8] font-display" style={{ fontFamily: 'DM Serif Display, serif' }}>
          Добрый день{user ? `, ${user.name}` : ''}
        </h1>
        <p className="text-[#C4A882]/70 mt-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Обзор ключевых показателей
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-[#0F0B05] border border-[#C4A882]/10 rounded-xl p-5 hover:border-[#E86C2F]/20 transition-all duration-300"
          >
            <p className="text-3xl text-[#F5F0E8] font-display mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>
              {stat.value}
            </p>
            <p className="text-[#C4A882] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{stat.label}</p>
            <p className="text-[#C4A882]/50 text-xs mt-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-xl text-[#F5F0E8] font-display mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
          Быстрые действия
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className="bg-[#E86C2F] hover:bg-[#E86C2F]/90 text-white rounded-lg py-3 px-4 text-sm font-medium 
                transition-all duration-300 shadow-lg shadow-[#E86C2F]/10"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}