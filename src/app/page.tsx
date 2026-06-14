'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { DM_Serif_Display, DM_Sans } from 'next/font/google';

const serif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const sans = DM_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-body',
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (email === 'hi@petra-design.ru' && password === 'owner123') {
      localStorage.setItem('petra_user', JSON.stringify({ email, role: 'owner', name: 'PETRA Owner' }));
      router.push('/dashboard');
    } else {
      setError('Неверный email или пароль');
      setLoading(false);
    }
  };

  return (
    <div className={`${serif.variable} ${sans.variable} min-h-screen flex`}
      style={{ backgroundColor: '#1A1208' }}>
      
      {/* Левая панель — текстура камня */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E86C2F]/30 to-[#1A1208]/90 z-10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJzdG9uZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMxQTEyMDgiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDE5NiwxNjgsMTMwLDAuMDUpIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0icmdiYSgxOTYsMTY4LDEzMCwwLjAzKSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEuNSIgZmlsbD0icmdiYSgxOTYsMTY4LDEzMCwwLjA0KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNzdG9uZSkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative z-20 flex flex-col justify-center px-16 text-[#F5F0E8]">
          <h1 className={`${serif.className} text-6xl mb-6`}>PETRA</h1>
          <p className={`${sans.className} text-xl text-[#C4A882] leading-relaxed max-w-md`}>
            Stone for home — натуральный камень для вашего интерьера с 2010 года
          </p>
          <div className="mt-12 space-y-3">
            <div className="flex items-center gap-3 text-[#C4A882]/70">
              <span className="w-8 h-[1px] bg-[#C4A882]/30" />
              <span className={`${sans.className} text-sm`}>Мрамор • Травертин • Известняк • Оникс • Гранит</span>
            </div>
          </div>
        </div>
      </div>

      {/* Правая панель — форма входа */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className={`${serif.className} text-4xl text-[#F5F0E8] mb-3`}>Вход в CRM</h2>
            <p className={`${sans.className} text-[#C4A882]/70`}>Управление заказами и проектами</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className={`block text-sm text-[#C4A882] mb-2 ${sans.className}`}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hi@petra-design.ru"
                className="w-full px-4 py-3.5 bg-[#0F0B05] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] 
                  placeholder-[#C4A882]/30 focus:outline-none focus:border-[#E86C2F]/50 focus:ring-1 focus:ring-[#E86C2F]/30
                  transition-all duration-300"
                required
              />
            </div>

            <div>
              <label className={`block text-sm text-[#C4A882] mb-2 ${sans.className}`}>Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 bg-[#0F0B05] border border-[#C4A882]/20 rounded-lg text-[#F5F0E8] 
                  placeholder-[#C4A882]/30 focus:outline-none focus:border-[#E86C2F]/50 focus:ring-1 focus:ring-[#E86C2F]/30
                  transition-all duration-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#E86C2F] hover:bg-[#E86C2F]/90 text-white rounded-lg 
                font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg shadow-[#E86C2F]/20"
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className={`text-center text-[#C4A882]/40 text-xs mt-8 ${sans.className}`}>
            PETRA Stone for home © {new Date().getFullYear()}<br />
            Московская обл., г. Долгопрудный
          </p>
        </div>
      </div>
    </div>
  );
}