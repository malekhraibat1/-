import React, { useState } from 'react';
import { useDairy } from '../../context/DairyContext';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  Database,
  Usb,
  ArrowLeft,
} from 'lucide-react';

interface AuthLoginModalProps {
  isOpen: boolean;
  onSuccess?: () => void;
}

export const AuthLoginModal: React.FC<AuthLoginModalProps> = ({ isOpen, onSuccess }) => {
  const { settings, login } = useDairy();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const success = login(username, password, rememberMe);
    if (success) {
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg('اسم المستخدم أو كلمة المرور غير صحيحة. يرجى المحاولة مجدداً.');
    }
    setIsSubmitting(false);
  };

  const handleQuickLogin = () => {
    setUsername(settings.username || 'admin');
    setPassword(settings.password || '123456');
    const success = login(settings.username || 'admin', settings.password || '123456', true);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative text-slate-100 animate-fadeIn">
        {/* Top Accent Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-500 via-emerald-400 to-sky-500 w-full" />

        {/* Modal Header */}
        <div className="p-6 text-center space-y-3 pb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center text-3xl font-black mx-auto shadow-xl shadow-amber-500/25">
            🧀
          </div>

          <div>
            <h2 className="text-xl font-black text-white tracking-wide">
              {settings.workshopName || 'مصنع ومعمل الأجبان'}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold font-mono">
                ₪ {settings.currency || 'شيكل'}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>حماية النظام مشفرة</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            يرجى إدخال اسم المستخدم وكلمة المرور الخاصة بإدارة المصنع للوصول إلى الحسابات والمخزون والفواتير
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-6 mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 text-xs">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>اسم المستخدم (Username)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم (مثال: admin)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 text-xs transition outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>كلمة المرور أو رمز PIN</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور (الافتراضية: 123456)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl pl-10 pr-3.5 py-2.5 text-white placeholder-slate-500 text-xs transition outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-white transition cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <span>تذكر تسجيل الدخول على هذا الجهاز</span>
            </label>

            <span className="text-[10px] text-slate-500 font-mono">وضع الأمان: نشط ✔️</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/25 transition active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>تسجيل الدخول وفتح المصنع</span>
          </button>

          {/* Quick Manager Login Helper Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2 mt-4 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <KeyRound className="w-3.5 h-3.5" />
                <span>بيانات الدخول الافتراضية للمدير:</span>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                جاهزة للمستخدم
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px] bg-slate-900/60 p-2 rounded-xl">
              <div>
                اسم المستخدم: <b className="text-white">{settings.username || 'admin'}</b>
              </div>
              <div>
                كلمة المرور: <b className="text-amber-400">{settings.password || '123456'}</b>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickLogin}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-center transition cursor-pointer flex items-center justify-center gap-1.5 text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>دخول تلقائي سريع كمدير (Auto-Fill & Login) ⚡</span>
            </button>
          </div>
        </form>

        {/* Footer Note with Developer Credit */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center space-y-1 text-[10px] text-slate-400">
          <div>يعمل البرنامج محلياً 100% دون اتصال بالإنترنت • يمكنك تغيير كلمة السر من شاشة الإعدادات</div>
          <div className="text-slate-400 font-sans pt-0.5 border-t border-slate-900 flex items-center justify-center gap-1.5 flex-wrap">
            <span>تصميم وتطوير:</span>
            <b className="text-white font-bold">المهندس مالك حريبات</b>
            <span className="text-slate-600">•</span>
            <span>للتواصل:</span>
            <a href="tel:0594345464" className="text-amber-400 font-mono font-bold hover:underline" dir="ltr">0594345464</a>
          </div>
        </div>
      </div>
    </div>
  );
};
