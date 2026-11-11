/**
 * Lưu bài AI đã đọc trong localStorage, theo từng lá số.
 *
 * Mỗi lá số giữ tối đa 10 bài, toàn bộ kho tối đa 40 bài mới nhất. Nội dung
 * chỉ nằm trên máy người dùng, xoá được bất cứ lúc nào.
 */

import type { AiReading } from './types';

const KEY = 'tuvi.ai.baiDoc';
const TOI_DA_MOI_LA_SO = 10;
const TOI_DA_TOAN_BO = 40;

type Kho = Record<string, AiReading[]>;

function docKho(): Kho {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const j = JSON.parse(raw) as Kho;
    return j && typeof j === 'object' ? j : {};
  } catch {
    return {};
  }
}

function ghiKho(kho: Kho): void {
  const tatCa = Object.entries(kho)
    .flatMap(([chartId, ds]) => ds.map((bai) => ({ chartId, bai })))
    .sort((a, b) => b.bai.createdAt - a.bai.createdAt)
    .slice(0, TOI_DA_TOAN_BO);

  const moi: Kho = {};
  for (const { chartId, bai } of tatCa) {
    (moi[chartId] ??= []).push(bai);
  }

  try {
    localStorage.setItem(KEY, JSON.stringify(moi));
  } catch {
    /* hết dung lượng hoặc bị chặn */
  }
}

export function docBaiDoc(chartId: string): AiReading[] {
  return [...(docKho()[chartId] ?? [])].sort((a, b) => b.createdAt - a.createdAt);
}

export function luuBaiDoc(bai: AiReading): AiReading[] {
  const kho = docKho();
  const ds = [bai, ...(kho[bai.chartId] ?? []).filter((x) => x.id !== bai.id)].slice(
    0,
    TOI_DA_MOI_LA_SO,
  );
  kho[bai.chartId] = ds;
  ghiKho(kho);
  return ds;
}

export function xoaBaiDoc(chartId: string, id?: string): AiReading[] {
  const kho = docKho();
  if (!id) delete kho[chartId];
  else kho[chartId] = (kho[chartId] ?? []).filter((x) => x.id !== id);
  ghiKho(kho);
  return kho[chartId] ?? [];
}

export function taoId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* trình duyệt cũ */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Ước lượng chi phí thô, chỉ để người dùng biết mình đang tốn bao nhiêu. */
export function uocTinhChiPhi(provider: 'gemini' | 'openrouter', soTu: number): number {
  if (provider !== 'gemini') return 0;
  // Gemini 2.5 Flash: ~0,30 USD / 1M token vào, ~2,50 USD / 1M token ra.
  // Ở đây chỉ tính token ra; đầu vào nhỏ hơn nhiều so với bài viết.
  const tokens = soTu / 3.5;
  return (tokens * 2.5) / 1_000_000;
}
