/**
 * Cấu hình nhà cung cấp model, lưu trong localStorage của chính người dùng.
 *
 * Không có key nào được nhúng vào bundle. Nếu người dùng không dán key thì
 * toàn bộ khối AI chỉ hiện lời mời cấu hình, không gọi mạng.
 */

import type { AiProviderId, AiSettings } from './types';

const KEY = 'tuvi.ai.caiDat';

export const MODEL_GOI_Y: Record<AiProviderId, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
  openrouter: [
    'google/gemini-2.5-flash',
    'google/gemini-2.5-flash-lite',
    'deepseek/deepseek-chat',
    'anthropic/claude-3.5-haiku',
    'openai/gpt-4o-mini',
  ],
};

export const TEN_NHA_CUNG_CAP: Record<AiProviderId, string> = {
  gemini: 'Google Gemini',
  openrouter: 'OpenRouter',
};

export const MAC_DINH: AiSettings = {
  provider: 'gemini',
  apiKey: '',
  model: MODEL_GOI_Y.gemini[0],
};

export function docCaiDat(): AiSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...MAC_DINH };
    const parsed = JSON.parse(raw) as Partial<AiSettings>;
    const provider: AiProviderId = parsed.provider === 'openrouter' ? 'openrouter' : 'gemini';
    return {
      provider,
      apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
      model:
        typeof parsed.model === 'string' && parsed.model.trim()
          ? parsed.model.trim()
          : MODEL_GOI_Y[provider][0],
    };
  } catch {
    return { ...MAC_DINH };
  }
}

export function luuCaiDat(caiDat: AiSettings): void {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        provider: caiDat.provider,
        apiKey: caiDat.apiKey.trim(),
        model: caiDat.model.trim(),
      }),
    );
  } catch {
    /* hết dung lượng hoặc bị chặn */
  }
}

export function xoaKey(): void {
  const cu = docCaiDat();
  luuCaiDat({ ...cu, apiKey: '' });
}

export function coKey(caiDat: AiSettings): boolean {
  return caiDat.apiKey.trim().length > 8;
}
