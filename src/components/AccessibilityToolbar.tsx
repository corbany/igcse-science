import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Type, 
  Palette, 
  Maximize, 
  RotateCcw, 
  Check, 
  Sparkles,
  Sliders,
  Sun
} from 'lucide-react';

export interface AccessibilitySettings {
  palette: 'cream' | 'blue' | 'slate';
  font: 'atkinson' | 'lexend' | 'system';
  fontSize: 'standard' | 'large' | 'extralarge';
  spacing: 'standard' | 'expanded';
  reducedMotion: boolean;
}

const STORAGE_KEY_A11Y = 'igcse_0653_accessibility_settings';

const defaultSettings: AccessibilitySettings = {
  palette: 'cream',
  font: 'atkinson',
  fontSize: 'standard',
  spacing: 'standard',
  reducedMotion: false
};

interface AccessibilityToolbarProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({ onSettingsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_A11Y);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Apply settings to DOM body whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_A11Y, JSON.stringify(settings));
    } catch {}

    const body = document.body;
    if (!body) return;

    // Palette class
    body.classList.remove('palette-cream', 'palette-blue', 'palette-slate');
    body.classList.add(`palette-${settings.palette}`);

    // Font family class
    body.classList.remove('font-atkinson', 'font-lexend', 'font-system');
    body.classList.add(`font-${settings.font}`);

    // Dyslexia spacing class
    if (settings.spacing === 'expanded') {
      body.classList.add('dyslexia-expanded-spacing');
    } else {
      body.classList.remove('dyslexia-expanded-spacing');
    }

    // Font size scaling
    if (settings.fontSize === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else if (settings.fontSize === 'extralarge') {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }

    // Reduced motion class
    if (settings.reducedMotion) {
      body.classList.add('reduced-motion-active');
    } else {
      body.classList.remove('reduced-motion-active');
    }

    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <aside aria-label="Accessibility options" className="relative z-40">
      {/* Quick Access Bar */}
      <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-[#334155] gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" aria-hidden="true"></span>
            <span className="font-bold text-[#1E293B]">Dyslexia & Neurodivergent Accessibility Mode</span>
            <span className="hidden sm:inline text-[#64748B]">·</span>
            <span className="hidden sm:inline text-[#475569]">
              Atkinson Hyperlegible · WCAG 2.2 AA (6:1 contrast) · Glare-free pastels
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Palette Toggles */}
            <div className="hidden md:flex items-center gap-1 border border-[#CBD5E1] bg-white rounded-md p-0.5">
              <button
                onClick={() => updateSetting('palette', 'cream')}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                  settings.palette === 'cream' ? 'bg-[#FDFBF7] text-[#1E293B] shadow-xs border border-[#CBD5E1]' : 'text-[#475569] hover:text-[#1E293B]'
                }`}
                title="Soft warm cream background (#FDFBF7)"
              >
                <span className="w-3 h-3 rounded-full bg-[#FDFBF7] border border-[#CBD5E1]"></span>
                <span>Warm Cream</span>
              </button>

              <button
                onClick={() => updateSetting('palette', 'blue')}
                className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                  settings.palette === 'blue' ? 'bg-[#EBF3F5] text-[#1E293B] shadow-xs border border-[#94A3B8]' : 'text-[#475569] hover:text-[#1E293B]'
                }`}
                title="Pale soft blue background (#EBF3F5)"
              >
                <span className="w-3 h-3 rounded-full bg-[#EBF3F5] border border-[#94A3B8]"></span>
                <span>Soft Blue</span>
              </button>
            </div>

            {/* Spacing Quick Toggle */}
            <button
              onClick={() => updateSetting('spacing', settings.spacing === 'expanded' ? 'standard' : 'expanded')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer transition ${
                settings.spacing === 'expanded' 
                  ? 'bg-[#1D4ED8] text-white border-[#1E40AF]' 
                  : 'bg-white text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
              }`}
              title="Toggle expanded letter and line spacing recommended by British Dyslexia Association"
            >
              Dyslexia Spacing: {settings.spacing === 'expanded' ? 'On' : 'Off'}
            </button>

            {/* Open Full Preferences Modal Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white text-[#1E293B] border border-[#CBD5E1] hover:bg-[#F1F5F9] flex items-center gap-1.5 cursor-pointer"
              aria-expanded={isOpen}
            >
              <Sliders className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>Accessibility Options</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Panel (Dropdown Modal) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div 
            className="bg-white border-2 border-[#CBD5E1] rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-5 text-left text-[#1E293B]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-title"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#1D4ED8]" />
                <h2 id="a11y-title" className="text-lg font-bold text-[#1E293B]">
                  Dyslexia & Accessibility Settings
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#475569] hover:bg-[#F1F5F9] hover:text-[#1E293B] cursor-pointer font-bold text-sm"
                aria-label="Close settings"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Setting 1: Background Palette */}
              <div className="space-y-2">
                <label className="text-sm font-bold block text-[#1E293B]">
                  1. Background color (glare-free pastels):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSetting('palette', 'cream')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.palette === 'cream' ? 'border-[#1D4ED8] bg-[#FDFBF7] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-[#FDFBF7] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FDFBF7] border border-[#CBD5E1] mb-2" />
                    <span className="text-xs font-bold block text-[#1E293B]">Warm Cream</span>
                    <span className="text-[11px] text-[#475569]">#FDFBF7 (default)</span>
                  </button>

                  <button
                    onClick={() => updateSetting('palette', 'blue')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.palette === 'blue' ? 'border-[#1D4ED8] bg-[#EBF3F5] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-[#EBF3F5] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#EBF3F5] border border-[#94A3B8] mb-2" />
                    <span className="text-xs font-bold block text-[#1E293B]">Soft Blue</span>
                    <span className="text-[11px] text-[#475569]">#EBF3F5</span>
                  </button>

                  <button
                    onClick={() => updateSetting('palette', 'slate')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.palette === 'slate' ? 'border-[#1D4ED8] bg-[#F8FAFC] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#94A3B8]'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#F8FAFC] border border-[#CBD5E1] mb-2" />
                    <span className="text-xs font-bold block text-[#1E293B]">Light Slate</span>
                    <span className="text-[11px] text-[#475569]">#F8FAFC</span>
                  </button>
                </div>
              </div>

              {/* Setting 2: Font Family */}
              <div className="space-y-2">
                <label className="text-sm font-bold block text-[#1E293B]">
                  2. Accessible typeface:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSetting('font', 'atkinson')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.font === 'atkinson' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#1E293B]">Atkinson Hyperlegible</span>
                    <span className="text-[11px] text-[#475569] block mt-0.5">Braille Institute standard</span>
                  </button>

                  <button
                    onClick={() => updateSetting('font', 'lexend')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.font === 'lexend' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#1E293B]">Lexend</span>
                    <span className="text-[11px] text-[#475569] block mt-0.5">High reading fluency</span>
                  </button>

                  <button
                    onClick={() => updateSetting('font', 'system')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.font === 'system' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#1E293B]">System Sans</span>
                    <span className="text-[11px] text-[#475569] block mt-0.5">Clean UI fallback</span>
                  </button>
                </div>
              </div>

              {/* Setting 3: Letter & Line Spacing */}
              <div className="space-y-2">
                <label className="text-sm font-bold block text-[#1E293B]">
                  3. Line & letter spacing:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSetting('spacing', 'standard')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.spacing === 'standard' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#1E293B]">Standard (155% line height)</span>
                    <span className="text-[11px] text-[#475569]">Comfortable spacing (0.04em)</span>
                  </button>

                  <button
                    onClick={() => updateSetting('spacing', 'expanded')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      settings.spacing === 'expanded' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#1E293B]">Expanded (175% line height)</span>
                    <span className="text-[11px] text-[#475569]">British Dyslexia standard (0.12em)</span>
                  </button>
                </div>
              </div>

              {/* Setting 4: Font Size */}
              <div className="space-y-2">
                <label className="text-sm font-bold block text-[#1E293B]">
                  4. Base text size:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateSetting('fontSize', 'standard')}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                      settings.fontSize === 'standard' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-sm font-bold block">16px (100%)</span>
                    <span className="text-[11px] text-[#475569]">Standard</span>
                  </button>

                  <button
                    onClick={() => updateSetting('fontSize', 'large')}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                      settings.fontSize === 'large' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-base font-bold block">18px (112%)</span>
                    <span className="text-[11px] text-[#475569]">Large</span>
                  </button>

                  <button
                    onClick={() => updateSetting('fontSize', 'extralarge')}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                      settings.fontSize === 'extralarge' ? 'border-[#1D4ED8] bg-[#F0FDF4] ring-2 ring-[#1D4ED8]' : 'border-[#CBD5E1] bg-white hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span className="text-lg font-bold block">20px (125%)</span>
                    <span className="text-[11px] text-[#475569]">Extra Large</span>
                  </button>
                </div>
              </div>

              {/* Setting 5: Reduced Motion */}
              <div className="p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold block text-[#1E293B]">Reduced motion (Sensory Protection)</span>
                  <span className="text-[11px] text-[#475569]">Disable animations, pulsing, and transitions for ADHD / vestibular ease</span>
                </div>
                <button
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`w-12 h-6 rounded-full transition cursor-pointer p-0.5 ${
                    settings.reducedMotion ? 'bg-[#1D4ED8]' : 'bg-[#CBD5E1]'
                  }`}
                  aria-pressed={settings.reducedMotion}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition transform ${
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={resetDefaults}
                className="text-xs text-[#475569] hover:text-[#1E293B] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to standard settings</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold cursor-pointer transition"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
