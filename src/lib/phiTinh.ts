/**
 * Huyền Không Phi Tinh — bàn 9 cung.
 *
 * Cách lập bàn:
 * 1. Vận (1–9) chia 20 năm một vận, khởi từ 1864. Sao của vận nhập trung cung
 *    rồi phi thuận theo đường Lạc Thư: Trung → Càn → Đoài → Cấn → Ly → Khảm →
 *    Khôn → Chấn → Tốn.
 * 2. Sơn tinh: lấy sao của vận tại cung TOẠ, cho nhập trung rồi phi thuận nếu
 *    toạ sơn là dương, phi nghịch nếu là âm.
 * 3. Hướng tinh: lấy sao của vận tại cung HƯỚNG, phi theo âm dương của hướng sơn.
 *
 * Toàn bộ là số học thuần, không tra bảng ngoài, không gọi mạng. Các ca kiểm
 * chứng nằm trong `__tests__/phiTinh.test.ts` — đối chiếu với những bàn kinh
 * điển đã biết (bát vận Tý–Ngọ, cửu vận Tý–Ngọ, bát vận Ngọ–Tý, bát vận
 * Bính–Nhâm, bát vận Thìn–Tuất).
 *
 * Lưu ý phạm vi: bàn này lập theo phái Tam Nguyên (dùng 24 sơn phương vị).
 * Khi trục đo rơi sát ranh giới hai sơn (trong 3°), tức là "kiêm hướng", các
 * phái tính khác nhau; module chỉ cảnh báo chứ không tự đoán bàn thế quái.
 */

export type Hanh = 'Kim' | 'Mộc' | 'Thuỷ' | 'Hoả' | 'Thổ';

export interface Sao {
  so: number;
  ten: string;
  tenPhu: string;
  hanh: Hanh;
  /** Màu hiển thị, chọn đủ tương phản trên nền tối */
  mau: string;
  yNghia: string;
}

/** Chín sao, chỉ số 0–8 ứng với sao 1–9. */
export const SAO: Sao[] = [
  {
    so: 1,
    ten: 'Nhất Bạch',
    tenPhu: 'Tham Lang',
    hanh: 'Thuỷ',
    mau: '#8fb8e6',
    yNghia: 'Văn chương, quan lộc, học hành và quý nhân.',
  },
  {
    so: 2,
    ten: 'Nhị Hắc',
    tenPhu: 'Cự Môn',
    hanh: 'Thổ',
    mau: '#b98f62',
    yNghia: 'Bệnh tật, thị phi; là sao bệnh, cần hoá giải.',
  },
  {
    so: 3,
    ten: 'Tam Bích',
    tenPhu: 'Lộc Tồn',
    hanh: 'Mộc',
    mau: '#79c98f',
    yNghia: 'Khẩu thiệt, kiện tụng, hao tài; kỵ cãi vã.',
  },
  {
    so: 4,
    ten: 'Tứ Lục',
    tenPhu: 'Văn Khúc',
    hanh: 'Mộc',
    mau: '#9ad8a8',
    yNghia: 'Thi cử, văn chương, tình duyên; tốt cho học tập.',
  },
  {
    so: 5,
    ten: 'Ngũ Hoàng',
    tenPhu: 'Liêm Trinh',
    hanh: 'Thổ',
    mau: '#e0b44f',
    yNghia: 'Tai hoạ, bệnh nặng; kỵ động thổ, kỵ đặt giường.',
  },
  {
    so: 6,
    ten: 'Lục Bạch',
    tenPhu: 'Vũ Khúc',
    hanh: 'Kim',
    mau: '#dfe4ec',
    yNghia: 'Quyền uy, tài lộc, quý nhân; tốt cho công danh.',
  },
  {
    so: 7,
    ten: 'Thất Xích',
    tenPhu: 'Phá Quân',
    hanh: 'Kim',
    mau: '#e2907f',
    yNghia: 'Trộm cắp, hoả hoạn, khẩu thiệt; cần cẩn trọng.',
  },
  {
    so: 8,
    ten: 'Bát Bạch',
    tenPhu: 'Tả Phụ',
    hanh: 'Thổ',
    mau: '#e8d9b4',
    yNghia: 'Tài lộc, điền sản, phú quý; sao đương vận thượng nguyên.',
  },
  {
    so: 9,
    ten: 'Cửu Tử',
    tenPhu: 'Hữu Bật',
    hanh: 'Hoả',
    mau: '#c79ae0',
    yNghia: 'Hỷ sự, danh vọng, phát triển; sao đương vận hạ nguyên.',
  },
];

export const saoTheoSo = (so: number): Sao => SAO[((so - 1) % 9 + 9) % 9];

export type TenCung = 'Khảm' | 'Khôn' | 'Chấn' | 'Tốn' | 'Trung' | 'Càn' | 'Đoài' | 'Cấn' | 'Ly';

export interface Cung {
  /** Số Lạc Thư của cung, 1–9 */
  so: number;
  ten: TenCung;
  huong: string;
  /** Vị trí trên lưới 3×3 khi vẽ Nam ở trên: 0–8, hàng trước từ trái sang */
  viTri: number;
}

/**
 * Chín cung theo số Lạc Thư. Thứ tự mảng là 1–9, KHÔNG phải thứ tự vẽ.
 * Lưới hiển thị theo truyền thống: Nam ở trên, Bắc ở dưới.
 */
export const CUNG: Cung[] = [
  { so: 1, ten: 'Khảm', huong: 'Bắc', viTri: 7 },
  { so: 2, ten: 'Khôn', huong: 'Tây Nam', viTri: 2 },
  { so: 3, ten: 'Chấn', huong: 'Đông', viTri: 3 },
  { so: 4, ten: 'Tốn', huong: 'Đông Nam', viTri: 0 },
  { so: 5, ten: 'Trung', huong: 'Trung cung', viTri: 4 },
  { so: 6, ten: 'Càn', huong: 'Tây Bắc', viTri: 8 },
  { so: 7, ten: 'Đoài', huong: 'Tây', viTri: 5 },
  { so: 8, ten: 'Cấn', huong: 'Đông Bắc', viTri: 6 },
  { so: 9, ten: 'Ly', huong: 'Nam', viTri: 1 },
];

export const cungTheoSo = (so: number): Cung => CUNG[so - 1];

/** Đường phi Lạc Thư: trung cung rồi vòng theo thứ tự cố định. */
export const THU_TU_PHI = [5, 6, 7, 8, 9, 1, 2, 3, 4] as const;

/**
 * Phi một sao từ trung cung ra 8 cung.
 * @param saoVaoTrung sao 1–9 nhập trung
 * @param chieu 1 = thuận, -1 = nghịch
 * @returns bảng số cung → sao
 */
export function phi(saoVaoTrung: number, chieu: 1 | -1): Record<number, number> {
  const kq: Record<number, number> = {};
  THU_TU_PHI.forEach((soCung, i) => {
    // +900 để không bao giờ âm; 900 chia hết cho 9 nên không đổi kết quả.
    kq[soCung] = ((saoVaoTrung - 1 + chieu * i + 900) % 9) + 1;
  });
  return kq;
}

export interface Son {
  ten: string;
  han: string;
  huong: string;
  /** Số Lạc Thư của cung chứa sơn này */
  cung: number;
  /** Độ bắt đầu, tính theo la bàn (0° = chính Bắc, thuận chiều kim đồng hồ) */
  batDau: number;
  /** Dương sơn thì phi thuận, âm sơn thì phi nghịch */
  duong: boolean;
}

/**
 * 24 sơn, mỗi sơn 15°. Thứ tự mảng đi từ Tý (0°) theo chiều kim đồng hồ.
 *
 * Âm dương lấy theo Tam Nguyên long: thiên nguyên theo âm dương của quái,
 * địa nguyên lấy bốn can dương Giáp–Canh–Bính–Nhâm, nhân nguyên lấy bốn chi
 * dương Dần–Thân–Tỵ–Hợi.
 */
export const SON: Son[] = [
  { ten: 'Tý', han: '子', huong: 'Bắc', cung: 1, batDau: 352.5, duong: true },
  { ten: 'Quý', han: '癸', huong: 'Bắc', cung: 1, batDau: 7.5, duong: false },
  { ten: 'Sửu', han: '丑', huong: 'Đông Bắc', cung: 8, batDau: 22.5, duong: false },
  { ten: 'Cấn', han: '艮', huong: 'Đông Bắc', cung: 8, batDau: 37.5, duong: true },
  { ten: 'Dần', han: '寅', huong: 'Đông Bắc', cung: 8, batDau: 52.5, duong: true },
  { ten: 'Giáp', han: '甲', huong: 'Đông', cung: 3, batDau: 67.5, duong: true },
  { ten: 'Mão', han: '卯', huong: 'Đông', cung: 3, batDau: 82.5, duong: true },
  { ten: 'Ất', han: '乙', huong: 'Đông', cung: 3, batDau: 97.5, duong: false },
  { ten: 'Thìn', han: '辰', huong: 'Đông Nam', cung: 4, batDau: 112.5, duong: false },
  { ten: 'Tốn', han: '巽', huong: 'Đông Nam', cung: 4, batDau: 127.5, duong: false },
  { ten: 'Tỵ', han: '巳', huong: 'Đông Nam', cung: 4, batDau: 142.5, duong: true },
  { ten: 'Bính', han: '丙', huong: 'Nam', cung: 9, batDau: 157.5, duong: true },
  { ten: 'Ngọ', han: '午', huong: 'Nam', cung: 9, batDau: 172.5, duong: false },
  { ten: 'Đinh', han: '丁', huong: 'Nam', cung: 9, batDau: 187.5, duong: false },
  { ten: 'Mùi', han: '未', huong: 'Tây Nam', cung: 2, batDau: 202.5, duong: false },
  { ten: 'Khôn', han: '坤', huong: 'Tây Nam', cung: 2, batDau: 217.5, duong: false },
  { ten: 'Thân', han: '申', huong: 'Tây Nam', cung: 2, batDau: 232.5, duong: true },
  { ten: 'Canh', han: '庚', huong: 'Tây', cung: 7, batDau: 247.5, duong: true },
  { ten: 'Dậu', han: '酉', huong: 'Tây', cung: 7, batDau: 262.5, duong: false },
  { ten: 'Tân', han: '辛', huong: 'Tây', cung: 7, batDau: 277.5, duong: false },
  { ten: 'Tuất', han: '戌', huong: 'Tây Bắc', cung: 6, batDau: 292.5, duong: false },
  { ten: 'Càn', han: '乾', huong: 'Tây Bắc', cung: 6, batDau: 307.5, duong: true },
  { ten: 'Hợi', han: '亥', huong: 'Tây Bắc', cung: 6, batDau: 322.5, duong: true },
  { ten: 'Nhâm', han: '壬', huong: 'Bắc', cung: 1, batDau: 337.5, duong: true },
];

const chuanHoa = (goc: number): number => ((goc % 360) + 360) % 360;

/** Sơn chứa một góc la bàn. */
export function sonTheoDo(goc: number): Son {
  const g = chuanHoa(goc);
  return SON.find((s) => chuanHoa(g - s.batDau) < 15) ?? SON[0];
}

/** Vị trí trong sơn, 0–15° tính từ đầu sơn. */
export function viTriTrongSon(goc: number): number {
  return chuanHoa(chuanHoa(goc) - sonTheoDo(goc).batDau);
}

/**
 * Kiêm hướng: trục đo rơi trong 3° sát ranh giới hai sơn.
 * `lech` là khoảng cách tới ranh giới gần nhất (0–7,5°).
 */
export function kiemHuong(goc: number): { kiem: boolean; lech: number } {
  const v = viTriTrongSon(goc);
  const lech = Math.min(v, 15 - v);
  return { kiem: lech < 3, lech };
}

export const NAM_DAU_VAN_1 = 1864;
export const SO_NAM_MOT_VAN = 20;

/** Vận của một năm dương lịch; ngoài 1864–2043 thì kẹp về 1 hoặc 9. */
export function vanTheoNam(nam: number): number {
  return Math.min(9, Math.max(1, Math.floor((nam - NAM_DAU_VAN_1) / SO_NAM_MOT_VAN) + 1));
}

export function namDauVan(van: number): number {
  return NAM_DAU_VAN_1 + (van - 1) * SO_NAM_MOT_VAN;
}

export function namCuoiVan(van: number): number {
  return namDauVan(van) + SO_NAM_MOT_VAN - 1;
}

export function tamNguyen(van: number): 'Thượng nguyên' | 'Trung nguyên' | 'Hạ nguyên' {
  if (van <= 3) return 'Thượng nguyên';
  if (van <= 6) return 'Trung nguyên';
  return 'Hạ nguyên';
}

/** Sao niên vận nhập trung của một năm (giảm 1 mỗi năm). */
export function saoNam(nam: number): number {
  const du = (((11 - (nam % 9)) % 9) + 9) % 9;
  return du === 0 ? 9 : du;
}

/**
 * Bàn niên tinh (年紫白): sao năm nhập trung rồi phi THUẬN ra tám cung.
 *
 * Nguyên văn 年紫白: "上元甲子起一白，中元四绿推甲子，下元七赤兑宫寻，逐年星逆
 * 中宫始" và phần ví dụ "以此星入中顺飞八方" — sao lùi một đơn vị mỗi năm, nhưng
 * khi đã nhập trung thì luôn phi thuận, không phân biệt chẵn lẻ.
 * (Đối chiếu: 2025 niên tinh 2, Ngũ Hoàng tới Đông Bắc; 2026 niên tinh 1, Ngũ
 * Hoàng tới Nam.)
 */
export function banNam(nam: number): Record<number, number> {
  return phi(saoNam(nam), 1);
}

export interface CungPhiTinh {
  so: number;
  ten: TenCung;
  huong: string;
  viTri: number;
  /** Vận tinh */
  van: number;
  /** Sơn tinh */
  son: number;
  /** Hướng tinh */
  huongSao: number;
}

export type KieuBan =
  | 'vuong-son-vuong-huong'
  | 'song-tinh-hoi-huong'
  | 'song-tinh-hoi-toa'
  | 'thuong-son-ha-thuy'
  | 'thuong';

export interface PhanTich {
  kieu: KieuBan;
  tieuDe: string;
  moTa: string;
  tot: boolean;
}

export interface BanPhiTinh {
  nam: number;
  van: number;
  tamNguyen: string;
  ngoaiPhamVi: boolean;
  huongDo: number;
  toaDo: number;
  huongSon: Son;
  toaSon: Son;
  kiemHuong: boolean;
  lechRanh: number;
  /** Sao vận tại cung toạ, nhập trung làm sơn tinh */
  sonNhapTrung: number;
  /** Sao vận tại cung hướng, nhập trung làm hướng tinh */
  huongNhapTrung: number;
  /** 9 cung, sắp theo vị trí vẽ (Nam trên) */
  cung: CungPhiTinh[];
  phanTich: PhanTich;
}

const MO_TA_KIEU: Record<KieuBan, Omit<PhanTich, 'kieu'>> = {
  'vuong-son-vuong-huong': {
    tieuDe: 'Vượng sơn vượng hướng',
    moTa: 'Sơn tinh đắc vận tại cung toạ và hướng tinh đắc vận tại cung hướng. Bàn tốt cho cả nhân đinh (sức khoẻ, con cái) lẫn tài lộc; chỉ cần giữ toạ vững và hướng thông thoáng.',
    tot: true,
  },
  'song-tinh-hoi-huong': {
    tieuDe: 'Song tinh hội hướng',
    moTa: 'Cả sơn tinh và hướng tinh đương vận cùng tụ ở cung hướng. Rất mạnh về tài lộc nhưng phần nhân đinh yếu hơn; nên bố trí cửa, nơi đón khí ở phía hướng và giữ phía toạ yên tĩnh, kín đáo.',
    tot: true,
  },
  'song-tinh-hoi-toa': {
    tieuDe: 'Song tinh hội toạ',
    moTa: 'Cả sơn tinh và hướng tinh đương vận cùng tụ ở cung toạ. Mạnh về nhân đinh, sức khoẻ, con cái nhưng tài lộc kém hơn; nên giữ phía toạ vững chãi và mở lối đón khí ở phía hướng.',
    tot: true,
  },
  'thuong-son-ha-thuy': {
    tieuDe: 'Thượng sơn hạ thuỷ',
    moTa: 'Sơn tinh bay tới cung hướng, hướng tinh bay tới cung toạ — cả hai đều nghịch vị trí. Bàn bất lợi cho cả tài lộc và nhân đinh; nếu đã ở, nên hoá giải bằng vật khí theo ngũ hành và hạn chế động thổ phía sau nhà.',
    tot: false,
  },
  thuong: {
    tieuDe: 'Bàn thường',
    moTa: 'Sơn tinh và hướng tinh không tụ về một cung. Cần đọc từng cung: cung nào có sao đương vận hoặc sao cát thì dùng, cung có Ngũ Hoàng, Nhị Hắc, Thất Xích thì nên tĩnh và hoá giải.',
    tot: true,
  },
};

/** Dựng chín cung theo đúng thứ tự vẽ (Nam trên, Bắc dưới). */
export function dungCung(
  banVan: Record<number, number>,
  banSon: Record<number, number>,
  banHuong: Record<number, number>,
): CungPhiTinh[] {
  return [...CUNG]
    .sort((a, b) => a.viTri - b.viTri)
    .map((c) => ({
      so: c.so,
      ten: c.ten,
      huong: c.huong,
      viTri: c.viTri,
      van: banVan[c.so],
      son: banSon[c.so],
      huongSao: banHuong[c.so],
    }));
}

/**
 * Đọc thế bàn từ hai bàn sơn tinh và hướng tinh: bốn kiểu thường gặp.
 * Dùng chung cho bàn hạ quái và bàn thế quái để hai bàn không lệch cách đọc.
 */
export function phanTichBan(
  banSon: Record<number, number>,
  banHuong: Record<number, number>,
  van: number,
  toaSon: Son,
  huongSon: Son,
): PhanTich {
  const sonTaiToa = banSon[toaSon.cung];
  const sonTaiHuong = banSon[huongSon.cung];
  const huongTaiToa = banHuong[toaSon.cung];
  const huongTaiHuong = banHuong[huongSon.cung];

  let kieu: KieuBan = 'thuong';
  if (sonTaiToa === van && huongTaiHuong === van) kieu = 'vuong-son-vuong-huong';
  else if (sonTaiHuong === van && huongTaiHuong === van) kieu = 'song-tinh-hoi-huong';
  else if (sonTaiToa === van && huongTaiToa === van) kieu = 'song-tinh-hoi-toa';
  else if (sonTaiHuong === van && huongTaiToa === van) kieu = 'thuong-son-ha-thuy';

  return { kieu, ...MO_TA_KIEU[kieu] };
}

/**
 * Lập bàn phi tinh cho một hướng nhà.
 *
 * @param nam Năm nhập trạch (dùng để xác định vận)
 * @param huongDo Hướng nhà theo la bàn: 0° = chính Bắc, thuận chiều kim đồng hồ
 */
export function lapBanPhiTinh(nam: number, huongDo: number): BanPhiTinh {
  const van = vanTheoNam(nam);
  const huongSon = sonTheoDo(huongDo);
  const toaSon = sonTheoDo(huongDo + 180);

  const banVan = phi(van, 1);
  const sonNhapTrung = banVan[toaSon.cung];
  const huongNhapTrung = banVan[huongSon.cung];

  const banSon = phi(sonNhapTrung, toaSon.duong ? 1 : -1);
  const banHuong = phi(huongNhapTrung, huongSon.duong ? 1 : -1);

  const cung = dungCung(banVan, banSon, banHuong);
  const { kiem, lech } = kiemHuong(huongDo);

  return {
    nam,
    van,
    tamNguyen: tamNguyen(van),
    ngoaiPhamVi: nam < NAM_DAU_VAN_1 || nam > namCuoiVan(9),
    huongDo: chuanHoa(huongDo),
    toaDo: chuanHoa(huongDo + 180),
    huongSon,
    toaSon,
    kiemHuong: kiem,
    lechRanh: lech,
    sonNhapTrung,
    huongNhapTrung,
    cung,
    phanTich: phanTichBan(banSon, banHuong, van, toaSon, huongSon),
  };
}
