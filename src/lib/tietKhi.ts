/**
 * 24 tiết khí.
 *
 * Tiết khí chia năm theo kinh độ biểu kiến của Mặt Trời: mỗi 15° là một tiết,
 * mốc đầu là Lập Xuân ở 315°. Vì vậy không cần bảng tra cố định — chỉ cần tính
 * kinh độ Mặt Trời rồi tìm thời điểm nó vượt qua từng bội số của 15°.
 *
 * Công thức lấy từ Meeus, "Astronomical Algorithms" (ch. 25), độ chính xác
 * khoảng 0,01° — tương đương vài chục phút. Đủ để xác định đúng ngày trong
 * khoảng 1900–2100; chỉ những mốc sát nửa đêm mới có thể lệch một ngày.
 *
 * Mọi mốc được quy về giờ Việt Nam (UTC+7) bằng số học, nên kết quả không phụ
 * thuộc múi giờ cài trên máy người đọc.
 */

const RAD = Math.PI / 180;
const MOT_NGAY = 86_400_000;
const JD_1970 = 2_440_587.5;

export type LoaiTietKhi = 'tiet' | 'trung';
export type Mua = 'Xuân' | 'Hạ' | 'Thu' | 'Đông';

export interface TietKhi {
  /** Tên tiết khí, ví dụ "Lập Xuân" */
  ten: string;
  /** Kinh độ Mặt Trời tại mốc: 0–345, bội số của 15 */
  kinhDo: number;
  /** Tiết (节) hay Trung khí (中气) — xen kẽ nhau */
  loai: LoaiTietKhi;
  mua: Mua;
  /** Ngày theo giờ Việt Nam, dạng yyyy-mm-dd */
  ngay: string;
  nam: number;
  thang: number;
  ngayTrongThang: number;
  /** Giờ:phút Việt Nam, ví dụ "04:12" */
  gio: string;
  /** Một câu mô tả ngắn, tự biên soạn */
  moTa: string;
}

/** Thứ tự 24 tiết, bắt đầu từ Lập Xuân (315°). */
const TEN = [
  'Lập Xuân',
  'Vũ Thuỷ',
  'Kinh Trập',
  'Xuân Phân',
  'Thanh Minh',
  'Cốc Vũ',
  'Lập Hạ',
  'Tiểu Mãn',
  'Mang Chủng',
  'Hạ Chí',
  'Tiểu Thử',
  'Đại Thử',
  'Lập Thu',
  'Xử Thử',
  'Bạch Lộ',
  'Thu Phân',
  'Hàn Lộ',
  'Sương Giáng',
  'Lập Đông',
  'Tiểu Tuyết',
  'Đại Tuyết',
  'Đông Chí',
  'Tiểu Hàn',
  'Đại Hàn',
] as const;

const MO_TA = [
  'Đầu mùa xuân, khí trời chuyển ấm, vạn vật bắt đầu sinh sôi.',
  'Mưa xuân, đất ẩm; trời còn lạnh nhưng đã bớt khô hanh.',
  'Sâu nở sau đông, sấm động; cây cỏ và côn trùng thức dậy.',
  'Ngày và đêm dài bằng nhau, chính giữa mùa xuân.',
  'Trời trong, khí sạch; mùa tảo mộ và đi lại thanh đạm.',
  'Mưa nuôi lúa; hạt mưa cuối xuân giúp mùa màng tốt tươi.',
  'Đầu mùa hạ, nắng bắt đầu gay, cây cối lớn nhanh.',
  'Lúa đã vào hạt nhưng chưa chín hẳn; sông nước dâng nhẹ.',
  'Mùa gặt và gieo vụ mới; ngày dài nhất đang tới gần.',
  'Ngày dài nhất năm, nắng cực thịnh rồi bắt đầu dịu lại.',
  'Nóng nhẹ, chưa phải đỉnh điểm của mùa hè.',
  'Nóng nhất năm; mưa giông nhiều, oi bức.',
  'Đầu mùa thu, khí bắt đầu hanh, đêm mát hơn.',
  'Nắng nóng còn nhưng đã dịu; tiết trời chuyển dần.',
  'Sương trắng buổi sớm; ngày ngắn lại rõ rệt.',
  'Ngày và đêm dài bằng nhau, chính giữa mùa thu.',
  'Sương lạnh, khí thu se lại; lá bắt đầu rụng.',
  'Sương đọng thành giọt; lạnh tăng dần từng ngày.',
  'Đầu mùa đông, vạn vật thu mình, khí trời khô lạnh.',
  'Tuyết nhẹ ở vùng lạnh; khí đông đã rõ.',
  'Tuyết dày, lạnh sâu; đất trời tĩnh lại.',
  'Đêm dài nhất năm; dương khí bắt đầu hồi sinh.',
  'Rét nhẹ, trời còn khô; sắp bước sang xuân.',
  'Rét đậm nhất; tiết cuối đông trước khi sang xuân.',
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

/** Chuẩn hoá góc về [0, 360). */
function chuanHoa(goc: number): number {
  return ((goc % 360) + 360) % 360;
}

/** Ngày Julius từ mili giây Unix. */
function jdTuMs(ms: number): number {
  return ms / MOT_NGAY + JD_1970;
}

/**
 * Kinh độ biểu kiến của Mặt Trời (độ) tại một ngày Julius.
 * Đây là công thức độ chính xác thấp của Meeus — đủ cho tiết khí.
 */
export function kinhDoMatTroi(jd: number): number {
  const t = (jd - 2_451_545) / 36_525;
  const l0 = 280.46646 + 36_000.76983 * t + 0.0003032 * t * t;
  const m = 357.52911 + 35_999.05029 * t - 0.0001537 * t * t;
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m * RAD) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m * RAD) +
    0.000289 * Math.sin(3 * m * RAD);
  const omega = 125.04 - 1934.136 * t;
  return chuanHoa(l0 + c - 0.00569 - 0.00478 * Math.sin(omega * RAD));
}

/** Hiệu kinh độ so với mốc, chuẩn hoá về (-180, 180]. */
function lechKinhDo(jd: number, moc: number): number {
  const d = chuanHoa(kinhDoMatTroi(jd) - moc + 180) - 180;
  return d === -180 ? 180 : d;
}

/** Tìm thời điểm Mặt Trời vượt qua `moc` trong khoảng [a, b]. */
function timMoc(a: number, b: number, moc: number): number {
  let dau = a;
  let cuoi = b;
  for (let i = 0; i < 50; i += 1) {
    const giua = (dau + cuoi) / 2;
    if (lechKinhDo(giua, moc) < 0) dau = giua;
    else cuoi = giua;
  }
  return (dau + cuoi) / 2;
}

/** Tách một ngày Julius thành các thành phần giờ Việt Nam. */
function phanNgayVN(jd: number) {
  const d = new Date((jd - JD_1970) * MOT_NGAY + 7 * 3_600_000);
  return {
    nam: d.getUTCFullYear(),
    thang: d.getUTCMonth() + 1,
    ngay: d.getUTCDate(),
    gio: d.getUTCHours(),
    phut: d.getUTCMinutes(),
  };
}

function taoTietKhi(kinhDo: number, jd: number): TietKhi {
  const chiSo = Math.round(chuanHoa(kinhDo - 315) / 15) % 24;
  const p = phanNgayVN(jd);
  return {
    ten: TEN[chiSo],
    kinhDo,
    loai: chiSo % 2 === 0 ? 'tiet' : 'trung',
    mua: chiSo < 6 ? 'Xuân' : chiSo < 12 ? 'Hạ' : chiSo < 18 ? 'Thu' : 'Đông',
    ngay: `${p.nam}-${pad(p.thang)}-${pad(p.ngay)}`,
    nam: p.nam,
    thang: p.thang,
    ngayTrongThang: p.ngay,
    gio: `${pad(p.gio)}:${pad(p.phut)}`,
    moTa: MO_TA[chiSo],
  };
}

const cache = new Map<number, TietKhi[]>();

/**
 * 24 tiết khí rơi vào một năm Dương lịch, sắp theo thời gian.
 * Năm nào cũng đủ 24 mốc: Tiểu Hàn và Đại Hàn ở đầu tháng 1, Đại Tuyết ở đầu
 * tháng 12.
 */
export function tietKhiTrongNam(nam: number): TietKhi[] {
  const daCo = cache.get(nam);
  if (daCo) return daCo;

  // 00:00 ngày 1/1 giờ Việt Nam, tính bằng JD.
  const jdDau = jdTuMs(Date.UTC(nam, 0, 1) - 7 * 3_600_000);
  const jdCuoi = jdTuMs(Date.UTC(nam + 1, 0, 1) - 7 * 3_600_000);

  const ds: TietKhi[] = [];
  let oTruoc = Math.floor(kinhDoMatTroi(jdDau + 1e-6) / 15) % 24;

  for (let jd = jdDau + 1; jd <= jdCuoi; jd += 1) {
    const oNay = Math.floor(kinhDoMatTroi(jd) / 15) % 24;
    if (oNay !== oTruoc) {
      const kinhDo = oNay * 15;
      ds.push(taoTietKhi(kinhDo, timMoc(jd - 1, jd, kinhDo)));
    }
    oTruoc = oNay;
  }

  cache.set(nam, ds);
  return ds;
}

/** Khoá ngày yyyy-mm-dd của một Date theo lịch máy người dùng. */
function khoaNgay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Tiết khí đang bao trùm một ngày. */
export function tietKhiCuaNgay(ngay: Date): TietKhi {
  const khoa = khoaNgay(ngay);
  const nam = ngay.getFullYear();
  const ds = [...tietKhiTrongNam(nam - 1), ...tietKhiTrongNam(nam)];

  let chon = ds[0];
  for (const t of ds) {
    if (t.ngay <= khoa) chon = t;
    else break;
  }
  return chon;
}

/** Số ngày giữa hai khoá yyyy-mm-dd. */
function soNgayGiua(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / MOT_NGAY);
}

export interface ChuKyTietKhi {
  hienTai: TietKhi;
  keTiep: TietKhi;
  /** Số ngày còn lại tới tiết kế tiếp */
  conLai: number;
}

/** Tiết đang diễn ra và tiết kế tiếp, kèm số ngày còn lại. */
export function tietKhiKeTiep(ngay: Date): ChuKyTietKhi {
  const khoa = khoaNgay(ngay);
  const nam = ngay.getFullYear();
  const hienTai = tietKhiCuaNgay(ngay);
  const ds = [...tietKhiTrongNam(nam), ...tietKhiTrongNam(nam + 1)];
  const keTiep = ds.find((t) => t.ngay > khoa) ?? hienTai;

  return { hienTai, keTiep, conLai: soNgayGiua(khoa, keTiep.ngay) };
}

/** Ngày bắt đầu của một tiết trong năm, dùng cho lịch. */
export function ngayBatDau(ngay: Date, ten: string): string | null {
  const t = tietKhiTrongNam(ngay.getFullYear()).find((x) => x.ten === ten);
  return t ? t.ngay : null;
}
