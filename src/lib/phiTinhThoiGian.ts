/**
 * Bốn lớp sao thời gian của phái Tử Bạch (紫白): niên tinh, nguyệt tinh,
 * nhật tinh và thời tinh.
 *
 * Niên tinh đã nằm trong `phiTinh.ts` (hàm `saoNam` / `banNam`) vì nó gắn với
 * bàn Huyền Không. Ba lớp còn lại ở đây, lập theo đúng khẩu quyết cổ:
 *
 *   Nguyệt: 子午卯酉八白求，辰戌丑未五宫游，四孟之年从二黑，逆寻月份顺宫流。
 *   Nhật:   冬至一白雨水七，谷雨四顺起初一，夏至九宫处暑三，霜降六上逆同关。
 *   Thời:   冬至孟七仲一宫，季时顺排在四宫，夏至孟三仲在九，季六逆推是真宗。
 *
 * Nguồn đối chiếu: bài "5 分钟教会你推算紫白飞星" (Zhihu, 玄门乾坤堂, 2022) và
 * các chương 月紫白 / 日紫白 / 时紫白 của 福山堂. Hai nguồn dẫn lại cùng một
 * bộ khẩu quyết và cùng phần giải thích; không lấy từ app của bên thứ ba.
 *
 * Quy ước đã chọn, ghi rõ để người đọc kiểm lại:
 *
 * - Tháng: mặc định tính theo THÁNG TIẾT KHÍ (Lập Xuân khởi tháng Giêng, tức
 *   tháng Dần), đúng như ví dụ "从坤 2 宫起正月（寅）" trong nguồn. Người theo
 *   lối tháng âm lịch dùng được chế độ thứ hai; hai cách lệch nhau tối đa một
 *   tháng ở những ngày sát ranh giới tiết khí.
 * - Ngày: mốc là ngày Giáp Tý gần nhất với tiết khí mốc ("前后最近的甲子日"
 *   trong nguyên văn), rồi cộng hoặc trừ một sao mỗi ngày. Nửa năm Đông chí →
 *   Hạ chí phi thuận, nửa Hạ chí → Đông chí phi nghịch.
 * - Giờ: khởi từ CHI của ngày (không phải can ngày), chia ba nhóm 仲 (Tý Ngọ
 *   Mão Dậu), 孟 (Dần Thân Tỵ Hợi), 季 (Thìn Tuất Sửu Mùi). Giờ Tý ở đây tính
 *   cho chính ngày đang chọn; giờ Tý muộn (23:00–24:00) theo lệ cổ thuộc ngày
 *   hôm sau, giao diện có ghi chú riêng.
 * - Chiều phi của nhật tinh và thời tinh theo nguyên văn "順逆飛八宮": nửa dương
 *   phi thuận, nửa âm phi nghịch.
 */

import { CHI, amLichCuaNgay, canChiNam, jdFromDate } from './amlich';
import { chiCuaNam } from './canChi';
import { kinhDoMatTroi, tietKhiTrongNam } from './tietKhi';
import { banNam, phi, saoNam } from './phiTinh';

const mod = (a: number, n: number): number => ((a % n) + n) % n;

/** Đưa một số bất kỳ về phạm vi sao 1–9. */
const chuanSao = (n: number): number => mod(n - 1, 9) + 1;

/** JD của một ngày dương lịch (00:00 giờ máy). */
function jdCuaNgay(ngay: Date): number {
  return jdFromDate(ngay.getDate(), ngay.getMonth() + 1, ngay.getFullYear());
}

function ngayTuJd(jd: number): string {
  const ms = Date.UTC(2000, 0, 1) + (jd - 2_451_545) * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

// ── Nguyệt tinh ────────────────────────────────────────────────────────────

/**
 * Sao khởi tháng Giêng theo chi của năm.
 * Tý–Ngọ–Mão–Dậu: 8 ; Thìn–Tuất–Sửu–Mùi: 5 ; Dần–Thân–Tỵ–Hợi: 2.
 */
export function saoKhoiThang(chiNam: number): number {
  const nhom = mod(chiNam, 3);
  if (nhom === 0) return 8;
  if (nhom === 1) return 5;
  return 2;
}

/** Sao tháng nhập trung: mỗi tháng lùi một sao so với tháng Giêng. */
export function saoThang(namAm: number, thangAm: number): number {
  return chuanSao(saoKhoiThang(chiCuaNam(namAm)) - (thangAm - 1));
}

/** Bàn chín cung của tháng — sao tháng nhập trung, phi thuận. */
export function banThang(namAm: number, thangAm: number): Record<number, number> {
  return phi(saoThang(namAm, thangAm), 1);
}

export type KieuThang = 'tiet-khi' | 'am-lich';

export interface ThangCuaNgay {
  /** Số tháng 1–12 */
  thang: number;
  /** Chi của tháng, 0 = Tý; tháng Giêng là Dần (2) */
  chi: number;
  /** Năm dùng để tra sao khởi tháng: năm tiết khí (đổi ở Lập Xuân) hoặc năm âm lịch */
  nam: number;
}

/** Tháng tiết khí: Lập Xuân (315°) khởi tháng Dần. */
export function thangTietKhi(ngay: Date): ThangCuaNgay {
  const kd = kinhDoMatTroi(jdCuaNgay(ngay));
  const chiSo = Math.floor(mod(kd - 315, 360) / 30);
  const namDuong = ngay.getFullYear();
  const lapXuan = tietKhiTrongNam(namDuong).find((t) => t.kinhDo === 315);
  let nam = namDuong;
  if (lapXuan) {
    const jdLapXuan = jdFromDate(lapXuan.ngayTrongThang, lapXuan.thang, lapXuan.nam);
    if (jdCuaNgay(ngay) < jdLapXuan) nam -= 1;
  }
  return { thang: chiSo + 1, chi: mod(2 + chiSo, 12), nam };
}

/** Tháng theo âm lịch. */
export function thangAmLich(ngay: Date): ThangCuaNgay {
  const am = amLichCuaNgay(ngay);
  return { thang: am.thang, chi: mod(2 + am.thang - 1, 12), nam: am.nam };
}

export function thangCuaNgay(ngay: Date, kieu: KieuThang): ThangCuaNgay {
  return kieu === 'am-lich' ? thangAmLich(ngay) : thangTietKhi(ngay);
}

// ── Nhật tinh ──────────────────────────────────────────────────────────────

/**
 * Sáu mốc của nhật tinh, tra theo kinh độ Mặt Trời để không phụ thuộc tên
 * tiết khí: 270° Đông chí, 330° Vũ thuỷ, 30° Cốc vũ, 90° Hạ chí,
 * 150° Xử thử, 210° Sương giáng.
 */
const MOC_NGAY = [
  { kinhDo: 270, sao: 1, chieu: 1 as const, ten: 'Đông chí' },
  { kinhDo: 330, sao: 7, chieu: 1 as const, ten: 'Vũ thuỷ' },
  { kinhDo: 30, sao: 4, chieu: 1 as const, ten: 'Cốc vũ' },
  { kinhDo: 90, sao: 9, chieu: -1 as const, ten: 'Hạ chí' },
  { kinhDo: 150, sao: 3, chieu: -1 as const, ten: 'Xử thử' },
  { kinhDo: 210, sao: 6, chieu: -1 as const, ten: 'Sương giáng' },
];

export interface MocNgay {
  /** Tên tiết khí mốc */
  ten: string;
  /** Ngày Giáp Tý gần tiết khí nhất, dạng yyyy-mm-dd */
  ngayGiapTy: string;
  /** JD của ngày Giáp Tý đó */
  jd: number;
  /** Sao của ngày Giáp Tý: 1, 7, 4 (nửa dương) hoặc 9, 3, 6 (nửa âm) */
  sao: number;
  chieu: 1 | -1;
}

/**
 * Ngày Giáp Tý gần nhất với một JD cho trước.
 * `canChiNgay` tính can bằng `jd + 9` và chi bằng `jd + 1`, nên Giáp Tý rơi vào
 * jd ≡ 11 (mod 60).
 */
export function giapTyGanNhat(jd: number): number {
  const lech = mod(jd - 11, 60);
  return lech <= 30 ? jd - lech : jd - lech + 60;
}

const cacheMoc = new Map<number, MocNgay[]>();

function mocTrongNam(nam: number): MocNgay[] {
  const daCo = cacheMoc.get(nam);
  if (daCo) return daCo;

  const tiet = tietKhiTrongNam(nam);
  const ds: MocNgay[] = [];
  for (const m of MOC_NGAY) {
    const tk = tiet.find((t) => t.kinhDo === m.kinhDo);
    if (!tk) continue;
    const jdTiet = jdFromDate(tk.ngayTrongThang, tk.thang, tk.nam);
    const jd = giapTyGanNhat(jdTiet);
    ds.push({
      ten: tk.ten,
      ngayGiapTy: ngayTuJd(jd),
      jd,
      sao: m.sao,
      chieu: m.chieu,
    });
  }
  ds.sort((a, b) => a.jd - b.jd);
  cacheMoc.set(nam, ds);
  return ds;
}

/** Mốc nhật tinh đang có hiệu lực cho một ngày. */
export function mocCuaNgay(ngay: Date): MocNgay {
  const jd = jdCuaNgay(ngay);
  const nam = ngay.getFullYear();
  const ds = [...mocTrongNam(nam - 1), ...mocTrongNam(nam), ...mocTrongNam(nam + 1)].sort(
    (a, b) => a.jd - b.jd,
  );
  let chon = ds[0];
  for (const m of ds) if (m.jd <= jd) chon = m;
  return chon;
}

/** Sao ngày nhập trung. */
export function saoNgay(ngay: Date): number {
  const jd = jdCuaNgay(ngay);
  const moc = mocCuaNgay(ngay);
  return chuanSao(moc.sao + moc.chieu * (jd - moc.jd));
}

/** Chiều phi của nhật tinh và thời tinh: dương thuận, âm nghịch. */
export function chieuNgay(ngay: Date): 1 | -1 {
  return mocCuaNgay(ngay).chieu;
}

/** Bàn chín cung của ngày — nhập trung rồi phi thuận (dương) hoặc nghịch (âm). */
export function banNgay(ngay: Date): Record<number, number> {
  return phi(saoNgay(ngay), chieuNgay(ngay));
}

// ── Thời tinh ──────────────────────────────────────────────────────────────

export type NhomChi = 'trong' | 'manh' | 'quy';

/** Chia 12 chi thành ba nhóm 仲 / 孟 / 季. */
export function nhomChi(chi: number): NhomChi {
  const du = mod(chi, 3);
  if (du === 0) return 'trong'; // Tý, Mão, Ngọ, Dậu
  if (du === 2) return 'manh'; // Dần, Tỵ, Thân, Hợi
  return 'quy'; // Sửu, Thìn, Mùi, Tuất
}

/**
 * Sao giờ Tý của một ngày.
 * @param chiNgay chi của ngày (0 = Tý)
 * @param chieu 1 = nửa dương (Đông chí → Hạ chí), -1 = nửa âm
 */
export function saoKhoiGio(chiNgay: number, chieu: 1 | -1): number {
  const nhom = nhomChi(chiNgay);
  if (chieu === 1) return nhom === 'trong' ? 1 : nhom === 'manh' ? 7 : 4;
  return nhom === 'trong' ? 9 : nhom === 'manh' ? 3 : 6;
}

/** Sao giờ nhập trung, tính cho chỉ số giờ 0 (Tý) … 11 (Hợi). */
export function saoGio(ngay: Date, gioChi: number): number {
  const chieu = chieuNgay(ngay);
  const chiNgay = mod(jdCuaNgay(ngay) + 1, 12);
  return chuanSao(saoKhoiGio(chiNgay, chieu) + chieu * mod(gioChi, 12));
}

/** Bàn chín cung của giờ. */
export function banGio(ngay: Date, gioChi: number): Record<number, number> {
  return phi(saoGio(ngay, gioChi), chieuNgay(ngay));
}

/** Chi của ngày (0 = Tý). */
export function chiNgay(ngay: Date): number {
  return mod(jdCuaNgay(ngay) + 1, 12);
}

// ── Gói bốn lớp cho giao diện ──────────────────────────────────────────────

export type LoaiLop = 'nam' | 'thang' | 'ngay' | 'gio';

export interface LopThoiGian {
  loai: LoaiLop;
  /** Nhãn ngắn, ví dụ "Năm Bính Ngọ" */
  nhan: string;
  /** Sao nhập trung */
  sao: number;
  chieu: 1 | -1;
  /** Chín cung: số Lạc Thư → sao */
  ban: Record<number, number>;
  /** Ghi chú cách tính, hiện dưới bàn */
  ghiChu: string;
}

/** Chỉ số giờ 0–11 ứng với Tý … Hợi. */
export function chiGio(gio: number): number {
  return mod(gio, 12);
}

export function tenGio(gio: number): string {
  return CHI[chiGio(gio)];
}

/** Bốn lớp sao của một thời điểm: năm, tháng, ngày, giờ. */
export function bonLopThoiGian(
  ngay: Date,
  gioChi: number,
  kieuThang: KieuThang = 'tiet-khi',
): LopThoiGian[] {
  const am = amLichCuaNgay(ngay);
  const moc = mocCuaNgay(ngay);
  const chiN = chiNgay(ngay);
  const thang = thangCuaNgay(ngay, kieuThang);
  const chiNam = chiCuaNam(thang.nam);

  return [
    {
      loai: 'nam',
      // Năm dùng chung cách chia với lớp tháng: năm tiết khí (đổi ở Lập Xuân)
      // khi tính theo tiết khí, năm âm lịch khi chọn chế độ âm lịch.
      nhan: `Năm ${canChiNam(thang.nam)}`,
      sao: saoNam(thang.nam),
      chieu: 1,
      ban: banNam(thang.nam),
      ghiChu: 'Niên tinh lùi một sao mỗi năm, đổi ở Lập Xuân; nhập trung rồi phi thuận ra tám cung.',
    },
    {
      loai: 'thang',
      nhan: `Tháng ${thang.thang} (${CHI[thang.chi]})${am.nhuan ? ' nhuận' : ''}`,
      sao: saoThang(thang.nam, thang.thang),
      chieu: 1,
      ban: banThang(thang.nam, thang.thang),
      ghiChu: `Tháng Giêng năm chi ${CHI[chiNam]} khởi ${saoKhoiThang(chiNam)}; mỗi tháng lùi một sao rồi phi thuận.`,
    },
    {
      loai: 'ngay',
      nhan: `Ngày ${am.canChiNgay}`,
      sao: saoNgay(ngay),
      chieu: moc.chieu,
      ban: banNgay(ngay),
      ghiChu: `Mốc ${moc.ten}, ngày Giáp Tý ${moc.ngayGiapTy} khởi ${moc.sao}; ${moc.chieu === 1 ? 'phi thuận' : 'phi nghịch'}.`,
    },
    {
      loai: 'gio',
      nhan: `Giờ ${CHI[chiGio(gioChi)]} ngày ${CHI[chiN]}`,
      sao: saoGio(ngay, gioChi),
      chieu: moc.chieu,
      ban: banGio(ngay, gioChi),
      ghiChu: `Ngày chi ${CHI[chiN]}, giờ Tý khởi ${saoKhoiGio(chiN, moc.chieu)}; ${moc.chieu === 1 ? 'thuận' : 'nghịch'} một sao mỗi giờ.`,
    },
  ];
}
