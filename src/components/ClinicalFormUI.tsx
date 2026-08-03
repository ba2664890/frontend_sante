import React from 'react';

export type Option = { value: number | string; label: string };

export const opt = (value: number | string, label: string): Option => ({ value, label });

export const cls = (err?: boolean) =>
  `w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none text-base ${
    err
      ? 'border-red-200 bg-red-50 focus:border-red-500'
      : 'border-slate-100 bg-slate-50/50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10'
  }`;

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
  err?: boolean;
};

export const Sel = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, err, ...rest }, ref: React.ForwardedRef<HTMLSelectElement>) => (
    <select className={cls(err)} ref={ref} {...rest}>
      <option value="">- Choisir -</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
);
Sel.displayName = 'Sel';

export const F = ({
  label,
  required,
  children,
  col2,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  col2?: boolean;
  error?: string;
}) => (
  <div className={col2 ? 'md:col-span-2' : ''}>
    <label className="block text-sm font-bold text-slate-700 mb-2 tracking-tight uppercase">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-error mt-1">{error}</p>}
  </div>
);

export const CheckCard = ({
  label,
  icon,
  checked,
  onChange,
  sublabel,
}: {
  label: string;
  icon: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  sublabel?: string;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`p-6 rounded-[32px] border-2 text-left transition-all duration-300 flex items-center gap-6 group ${
      checked
        ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20'
        : 'bg-white border-slate-100 text-slate-700 hover:border-blue-200'
    }`}
  >
    <div
      className={`p-4 rounded-2xl transition-colors ${
        checked ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
      }`}
    >
      <span className="material-symbols-outlined text-3xl block">{icon}</span>
    </div>
    <div className="flex-1">
      <p className="font-black text-lg tracking-tight leading-tight">{label}</p>
      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${checked ? 'text-blue-200' : 'text-slate-400'}`}>
        {sublabel || (checked ? 'Accorde' : 'En attente')}
      </p>
    </div>
    <div
      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-white border-white' : 'border-slate-200 group-hover:border-blue-300'
      }`}
    >
      {checked && <span className="material-symbols-outlined text-blue-600 text-xl font-bold">check</span>}
    </div>
  </button>
);

export const StepHeader = ({ code, title, desc }: { code: string; title: string; desc?: string }) => (
  <div className="mb-8 border-b border-slate-100 pb-6 fade-in">
    <div className="flex items-center gap-4 mb-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white font-black shadow-lg shadow-blue-500/30 text-xl">
        {code}
      </div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h3>
    </div>
    {desc && <p className="text-lg text-slate-500 leading-relaxed font-medium">{desc}</p>}
  </div>
);

export const ClinicalShell = ({
  step,
  totalSteps,
  labels,
  title,
  subtitle,
  tag = 'Clinical Data Hub',
  version = 'Depisteel v1.0',
  onStepClick,
  children,
}: {
  step: number;
  totalSteps: number;
  labels: string[];
  title: string;
  subtitle: string;
  tag?: string;
  version?: string;
  onStepClick: (step: number) => void;
  children: React.ReactNode;
}) => (
  <div className="max-w-[1400px] mx-auto py-4 px-2 fade-in">
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-900 px-12 py-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                {tag}
              </span>
              <span className="text-slate-400 text-xs font-bold">{version}</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter">{title}</h1>
            <p className="text-slate-400 mt-3 text-lg font-medium">{subtitle}</p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-black text-blue-500 mb-1 leading-none">{step}</div>
            <div className="text-xs font-black uppercase tracking-widest text-slate-500">ETAPE SUR {totalSteps}</div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-10">
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
            <div
              className="h-full bg-blue-600 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-1000 ease-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-lg font-black text-slate-900 min-w-[60px]">{Math.round((step / totalSteps) * 100)}%</span>
        </div>

        <nav className="flex flex-wrap gap-4 mb-16 overflow-x-auto pb-4 scrollbar-hide">
          {labels.map((label, i) => {
            const isActive = i + 1 === step;
            const isPast = i + 1 < step;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onStepClick(i + 1)}
                className={`flex flex-col gap-2 min-w-[120px] transition-all duration-500 text-left ${
                  isActive ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    isActive ? 'bg-blue-600' : isPast ? 'bg-slate-900' : 'bg-slate-200'
                  }`}
                />
                <div className="px-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Section {i + 1}</div>
                  <div className={`text-sm font-black truncate ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{label}</div>
                </div>
              </button>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  </div>
);

export const Notice = ({
  tone = 'amber',
  icon,
  title,
  children,
}: {
  tone?: 'amber' | 'blue' | 'slate';
  icon: string;
  title: string;
  children: React.ReactNode;
}) => {
  const palette = {
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    blue: 'bg-blue-50 border-blue-100 text-blue-700',
    slate: 'bg-slate-50 border-slate-100 text-slate-700',
  }[tone];
  const iconPalette = {
    amber: 'bg-amber-200 text-amber-700',
    blue: 'bg-blue-200 text-blue-700',
    slate: 'bg-slate-200 text-slate-700',
  }[tone];

  return (
    <div className={`${palette} border-2 rounded-3xl p-8 mb-10 flex items-start gap-6`}>
      <div className={`w-12 h-12 rounded-2xl ${iconPalette} flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <div>
        <p className="font-bold text-sm mb-1">{title}</p>
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
};

export const NavigationActions = ({
  step,
  totalSteps,
  loading,
  onCancel,
  onPrev,
  onNext,
}: {
  step: number;
  totalSteps: number;
  loading: boolean;
  onCancel: () => void;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div className="flex items-center justify-between pt-8 border-t-2 border-slate-100 mt-8">
    <button
      type="button"
      onClick={onCancel}
      className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-[0.2em] text-sm px-8 py-4 transition-colors"
    >
      Abandonner
    </button>
    <div className="flex gap-6">
      {step > 1 && (
        <button
          type="button"
          onClick={onPrev}
          className="px-10 py-5 rounded-3xl border-2 border-slate-200 font-black text-slate-900 hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Precedent
        </button>
      )}
      {step < totalSteps && (
        <button
          type="button"
          onClick={onNext}
          className="px-12 py-5 rounded-3xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm"
        >
          Suivant / Continuer
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 5l7 7-7 7M5 12h14" />
          </svg>
        </button>
      )}
      {step === totalSteps && (
        <button
          type="submit"
          disabled={loading}
          className="px-12 py-5 rounded-3xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-2xl shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-3 uppercase tracking-widest text-sm disabled:opacity-50"
        >
          <svg className="w-6 h-6 animate-spin" style={{ display: loading ? 'block' : 'none' }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <svg className="w-6 h-6" style={{ display: loading ? 'none' : 'block' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
          {loading ? 'Traitement...' : 'Finaliser la Fiche'}
        </button>
      )}
    </div>
  </div>
);
