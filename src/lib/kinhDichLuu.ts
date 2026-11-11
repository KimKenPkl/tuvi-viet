/**
 * Lịch sử gieo quẻ, lưu trong localStorage của chính người dùng.
 *
 * Chỉ giữ 6 con số hào (6/7/8/9) và thời điểm, vì từ đó dựng lại được cả quẻ
 * chủ, quẻ biến và vị trí hào động. Giữ tối đa 20 lần gần nhất.
 */

export interface MucLichSu {
  id: string;
  /** Thời điểm gieo, mili giây */
  luc: number;
  /** 6 giá trị hào, dưới → trên */
  hao: number[];
}

const KHOA = 'tuvi.kinhDich.lichSu';
const TOI_DA = 20;

function hopLe(x: unknown): x is MucLichSu {
  if (!x || typeof x !== 'object') return false;
  const m = x as Partial<MucLichSu>;
  return (
    typeof m.id === 'string' &&
    typeof m.luc === 'number' &&
    Array.isArray(m.hao) &&
    m.hao.length === 6 &&
    m.hao.every((h) => h === 6 || h === 7 || h === 8 || h === 9)
  );
}

export function docLichSu(): MucLichSu[] {
  try {
    const raw = localStorage.getItem(KHOA);
    if (!raw) return [];
    const ds = JSON.parse(raw);
    return Array.isArray(ds) ? ds.filter(hopLe).slice(0, TOI_DA) : [];
  } catch {
    return [];
  }
}

function ghi(ds: MucLichSu[]): MucLichSu[] {
  const gon = ds.slice(0, TOI_DA);
  try {
    localStorage.setItem(KHOA, JSON.stringify(gon));
  } catch {
    /* hết dung lượng hoặc bị chặn thì vẫn trả về danh sách cho phiên này */
  }
  return gon;
}

function taoId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Thêm một lần gieo vào đầu danh sách, trả về danh sách mới. */
export function luuLanGieo(hao: readonly number[]): MucLichSu[] {
  const muc: MucLichSu = { id: taoId(), luc: Date.now(), hao: [...hao] };
  return ghi([muc, ...docLichSu()]);
}

export function xoaMot(id: string): MucLichSu[] {
  return ghi(docLichSu().filter((m) => m.id !== id));
}

export function xoaHet(): MucLichSu[] {
  try {
    localStorage.removeItem(KHOA);
  } catch {
    /* trình duyệt chặn localStorage */
  }
  return [];
}
