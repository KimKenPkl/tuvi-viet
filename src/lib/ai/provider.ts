/**
 * Gọi nhà cung cấp model từ trình duyệt (BYOK).
 *
 * Hai nhà cung cấp được hỗ trợ vì cả hai đều cho phép CORS từ web tĩnh:
 * - Google Gemini  (generativelanguage.googleapis.com)
 * - OpenRouter     (openrouter.ai/api/v1)
 *
 * Không có proxy, không có key nhúng trong bundle. Key đi thẳng từ máy người
 * dùng tới nhà cung cấp.
 */

import type { AiSettings } from './types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS = 'https://openrouter.ai/api/v1/models';

export class LoiAi extends Error {
  ma?: number;
  chiTiet?: string;

  constructor(message: string, ma?: number, chiTiet?: string) {
    super(message);
    this.name = 'LoiAi';
    this.ma = ma;
    this.chiTiet = chiTiet;
  }
}

function moTaLoi(status: number, than: string): string {
  let chiTiet = '';
  try {
    const j = JSON.parse(than);
    chiTiet = j?.error?.message ?? j?.message ?? '';
  } catch {
    chiTiet = than.slice(0, 240);
  }
  const dau = chiTiet ? ` — ${chiTiet}` : '';
  switch (status) {
    case 400:
      return `Yêu cầu không hợp lệ (400)${dau}. Kiểm tra lại tên model.`;
    case 401:
    case 403:
      return `API key không hợp lệ hoặc không có quyền (${status})${dau}`;
    case 404:
      return `Không tìm thấy model (404)${dau}`;
    case 429:
      return `Hết hạn mức hoặc gọi quá nhanh (429)${dau}. Thử lại sau ít phút.`;
    default:
      return `Lỗi ${status}${dau}`;
  }
}

/** Đọc luồng SSE, ghép các mảnh text và trả về toàn bài. */
async function docSse(
  res: Response,
  layManh: (json: any) => string | undefined,
  onDelta: (t: string) => void,
): Promise<string> {
  if (!res.body) {
    throw new LoiAi('Trình duyệt không hỗ trợ đọc luồng. Hãy dùng Chrome, Edge hoặc Firefox mới.');
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let dem = '';
  let toanBo = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    dem += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n');

    let cat = dem.indexOf('\n\n');
    while (cat >= 0) {
      const khoi = dem.slice(0, cat);
      dem = dem.slice(cat + 2);
      for (const dong of khoi.split('\n')) {
        const t = dong.trim();
        if (!t.startsWith('data:')) continue;
        const du = t.slice(5).trim();
        if (!du || du === '[DONE]') continue;
        try {
          const manh = layManh(JSON.parse(du));
          if (manh) {
            toanBo += manh;
            onDelta(manh);
          }
        } catch {
          /* bỏ qua khối không phải JSON hợp lệ */
        }
      }
      cat = dem.indexOf('\n\n');
    }
  }

  return toanBo;
}

interface GoiOptions {
  settings: AiSettings;
  system: string;
  user: string;
  signal?: AbortSignal;
  onDelta: (text: string) => void;
  maxOutputTokens?: number;
  temperature?: number;
}

async function goiGemini(o: GoiOptions): Promise<string> {
  const model = o.settings.model.replace(/^models\//, '').trim();
  const url = `${GEMINI_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(o.settings.apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: o.signal,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: o.system }] },
      contents: [{ role: 'user', parts: [{ text: o.user }] }],
      generationConfig: {
        temperature: o.temperature ?? 0.7,
        maxOutputTokens: o.maxOutputTokens ?? 4096,
      },
    }),
  });

  if (!res.ok) throw new LoiAi(moTaLoi(res.status, await res.text()), res.status);

  return docSse(
    res,
    (j) => {
      const parts = j?.candidates?.[0]?.content?.parts;
      if (!Array.isArray(parts)) return undefined;
      const text = parts.map((p: any) => p?.text ?? '').join('');
      return text || undefined;
    },
    o.onDelta,
  );
}

async function goiOpenRouter(o: GoiOptions): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${o.settings.apiKey}`,
      'HTTP-Referer': 'https://kimkenpkl.github.io/tuvi-viet/',
      'X-Title': 'Tu Vi Viet',
    },
    signal: o.signal,
    body: JSON.stringify({
      model: o.settings.model.trim(),
      stream: true,
      temperature: o.temperature ?? 0.7,
      max_tokens: o.maxOutputTokens ?? 4096,
      messages: [
        { role: 'system', content: o.system },
        { role: 'user', content: o.user },
      ],
    }),
  });

  if (!res.ok) throw new LoiAi(moTaLoi(res.status, await res.text()), res.status);

  return docSse(res, (j) => j?.choices?.[0]?.delta?.content || undefined, o.onDelta);
}

export async function streamChat(o: GoiOptions): Promise<string> {
  try {
    return o.settings.provider === 'openrouter' ? await goiOpenRouter(o) : await goiGemini(o);
  } catch (e) {
    if (e instanceof LoiAi) throw e;
    if ((e as Error)?.name === 'AbortError') throw e;
    throw new LoiAi(
      'Không kết nối được tới nhà cung cấp. Kiểm tra mạng, hoặc key đang bị chặn CORS.',
      undefined,
      String((e as Error)?.message ?? e),
    );
  }
}

/** Liệt kê model khả dụng — vừa để kiểm tra key, vừa để gợi ý tên model. */
export async function lietKeModel(settings: AiSettings): Promise<string[]> {
  if (!settings.apiKey.trim()) throw new LoiAi('Chưa có API key.');

  if (settings.provider === 'openrouter') {
    const res = await fetch(OPENROUTER_MODELS, {
      headers: { Authorization: `Bearer ${settings.apiKey}` },
    });
    if (!res.ok) throw new LoiAi(moTaLoi(res.status, await res.text()), res.status);
    const j = await res.json();
    return (j?.data ?? []).map((m: any) => String(m.id)).slice(0, 300);
  }

  const res = await fetch(`${GEMINI_BASE}/models?pageSize=1000&key=${encodeURIComponent(settings.apiKey)}`);
  if (!res.ok) throw new LoiAi(moTaLoi(res.status, await res.text()), res.status);
  const j = await res.json();
  return (j?.models ?? [])
    .filter(
      (m: any) =>
        Array.isArray(m?.supportedGenerationMethods) &&
        m.supportedGenerationMethods.includes('generateContent'),
    )
    .map((m: any) => String(m.name).replace(/^models\//, ''))
    .filter((x: string) => !x.includes('embedding') && !x.includes('aqa'))
    .sort();
}
