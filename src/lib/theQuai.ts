/**
 * Bàn thế quái (替卦) cho trường hợp kiêm hướng.
 *
 * Khẩu quyết 替卦歌:
 *
 *   子癸并甲申，贪狼一路行；壬卯乙未坤，五位为巨门；
 *   乾亥辰巽巳连戌，武曲名；酉辛丑艮丙，天星说破军；
 *   寅午庚丁上，右弼四星临。
 *
 * Nghĩa là 24 sơn gom thành năm nhóm, mỗi nhóm ứng một sao thay thế:
 * 1 (Tham Lang), 2 (Cự Môn), 6 (Vũ Khúc), 7 (Phá Quân), 9 (Hữu Bật).
 * Không sơn nào mang thế tinh 3, 4, 5, 8 — đúng như bảng truyền lại.
 *
 * Cách lập bàn: khi trục đo rơi vào dải kiêm (cách ranh giới hai sơn dưới 3°),
 * lấy THẾ TINH của sơn chứa trục cho nhập trung thay cho sao vận tại cung đó.
 * Chiều phi vẫn theo âm dương của sơn: dương thuận, âm nghịch — lối của phái
 * Tam Nguyên / Thẩm thị.
 *
 * Ba chỗ các phái không thống nhất, module giữ một lối và nói rõ:
 *
 * - Sơn dùng để tra bảng: ở đây tra theo sơn mà trục đo NẰM TRONG (sơn gốc),
 *   coi "kiêm" chỉ là điều kiện kích hoạt. Một số sách lấy thế tinh của sơn
 *   KIÊM (sơn mà trục nghiêng về). Trường `sonTheKiem` / `huongTheKiem` giữ
 *   sẵn con số của lối thứ hai để người đọc đối chiếu, không giấu đi.
 * - Chiều phi: theo âm dương của sơn. Có phái lấy âm dương của chính thế tinh.
 * - Ngưỡng kiêm: 3° như `kiemHuong` của bàn hạ quái; nhiều sách dùng 2°40'
 *   hoặc 4°30'. Chênh nhau chỉ ở những trục sát ranh giới.
 *
 * Vì còn ba chỗ lệch ấy, bàn thế quái ở đây chỉ nên đọc như phương án tham
 * khảo bên cạnh bàn hạ quái, không phải kết luận duy nhất.
 *
 * Nguồn khẩu quyết: bản 替卦歌 lưu trong 沈氏玄空學 và các bản 玄空飛星 phổ
 * biến; đối chiếu bảng 24 sơn ở 福山堂 (mục 替卦). Không lấy từ app của bên
 * thứ ba.
 */

import {
  SON,
  dungCung,
  lapBanPhiTinh,
  phanTichBan,
  phi,
  sonTheoDo,
  viTriTrongSon,
  type BanPhiTinh,
  type Son,
} from './phiTinh';

/** Bảng thế tinh của 24 sơn, tra theo tên sơn. */
export const THE_QUAI: Record<string, number> = {
  // 1 — Tham Lang: 子 癸 甲 申
  Tý: 1,
  Quý: 1,
  Giáp: 1,
  Thân: 1,
  // 2 — Cự Môn: 壬 卯 乙 未 坤
  Nhâm: 2,
  Mão: 2,
  Ất: 2,
  Mùi: 2,
  Khôn: 2,
  // 6 — Vũ Khúc: 乾 亥 辰 巽 巳 戌
  Càn: 6,
  Hợi: 6,
  Thìn: 6,
  Tốn: 6,
  Tỵ: 6,
  Tuất: 6,
  // 7 — Phá Quân: 酉 辛 丑 艮 丙
  Dậu: 7,
  Tân: 7,
  Sửu: 7,
  Cấn: 7,
  Bính: 7,
  // 9 — Hữu Bật: 寅 午 庚 丁
  Dần: 9,
  Ngọ: 9,
  Canh: 9,
  Đinh: 9,
};

/** Năm nhóm của 替卦歌, giữ nguyên thứ tự và tên chữ Hán để dễ đối chiếu. */
export const NHOM_THE_QUAI: readonly {
  sao: number;
  ten: string;
  chu: string;
  son: readonly string[];
}[] = [
  { sao: 1, ten: 'Tham Lang', chu: '子癸甲申', son: ['Tý', 'Quý', 'Giáp', 'Thân'] },
  { sao: 2, ten: 'Cự Môn', chu: '壬卯乙未坤', son: ['Nhâm', 'Mão', 'Ất', 'Mùi', 'Khôn'] },
  { sao: 6, ten: 'Vũ Khúc', chu: '乾亥辰巽巳戌', son: ['Càn', 'Hợi', 'Thìn', 'Tốn', 'Tỵ', 'Tuất'] },
  { sao: 7, ten: 'Phá Quân', chu: '酉辛丑艮丙', son: ['Dậu', 'Tân', 'Sửu', 'Cấn', 'Bính'] },
  { sao: 9, ten: 'Hữu Bật', chu: '寅午庚丁', son: ['Dần', 'Ngọ', 'Canh', 'Đinh'] },
];

/** Thế tinh của một sơn. */
export function theTinh(son: Son): number {
  return THE_QUAI[son.ten] ?? 5;
}

export interface SonKiem {
  /** Sơn chứa trục đo */
  son: Son;
  /** Sơn kề mà trục nghiêng về, null nếu trục ở giữa sơn */
  kiem: Son | null;
  /** Khoảng cách tới ranh giới gần nhất, 0–7,5° */
  lech: number;
}

/**
 * Sơn chứa trục và sơn kề mà trục đang kiêm sang.
 * Dải kiêm là 3° sát mỗi ranh giới, giống `kiemHuong` của bàn hạ quái.
 */
export function sonKiem(goc: number): SonKiem {
  const son = sonTheoDo(goc);
  // Vị trí trong sơn: 0° là đầu sơn (giáp sơn trước), 15° là cuối sơn (giáp sơn sau).
  const trong = viTriTrongSon(goc);
  const lech = Math.min(trong, 15 - trong);
  if (lech >= 3) return { son, kiem: null, lech };

  const i = SON.findIndex((s) => s.ten === son.ten);
  // trong < 7,5 chỉ xảy ra khi trục ở nửa đầu sơn, tức nghiêng về sơn đứng trước.
  const kiem = SON[(i + (trong < 7.5 ? -1 : 1) + 24) % 24];
  return { son, kiem, lech };
}

export interface BanTheQuai extends BanPhiTinh {
  /** Sơn kề phía toạ mà trục kiêm sang */
  kiemToa: Son | null;
  /** Sơn kề phía hướng mà trục kiêm sang */
  kiemHuongSon: Son | null;
  /** Thế tinh của toạ sơn, nhập trung làm sơn tinh */
  sonThe: number;
  /** Thế tinh của hướng sơn, nhập trung làm hướng tinh */
  huongThe: number;
  /** Thế tinh của sơn kiêm phía toạ — lối đọc của phái lấy sơn kiêm */
  sonTheKiem: number | null;
  /** Thế tinh của sơn kiêm phía hướng */
  huongTheKiem: number | null;
  /** Sao vận tại cung toạ mà bàn hạ quái dùng, để so sánh */
  sonHaQuai: number;
  /** Sao vận tại cung hướng mà bàn hạ quái dùng */
  huongHaQuai: number;
  /** true khi thế tinh trùng sao hạ quái, tức "tạm không thay" — hai bàn giống nhau */
  khongDoi: boolean;
}

/**
 * Lập bàn thế quái. Trả về `null` khi trục đo không kiêm hướng — lúc đó bàn
 * hạ quái đã đúng, không có gì để thay.
 *
 * @param nam Năm nhập trạch, dùng để xác định vận và bàn vận tinh
 * @param huongDo Hướng nhà theo la bàn: 0° = chính Bắc, thuận chiều kim đồng hồ
 */
export function lapBanTheQuai(nam: number, huongDo: number): BanTheQuai | null {
  const toa = sonKiem(huongDo + 180);
  const huong = sonKiem(huongDo);
  if (!toa.kiem && !huong.kiem) return null;

  const haQuai = lapBanPhiTinh(nam, huongDo);

  const sonThe = theTinh(toa.son);
  const huongThe = theTinh(huong.son);
  const banSon = phi(sonThe, toa.son.duong ? 1 : -1);
  const banHuong = phi(huongThe, huong.son.duong ? 1 : -1);
  const banVan = phi(haQuai.van, 1);

  return {
    ...haQuai,
    sonNhapTrung: sonThe,
    huongNhapTrung: huongThe,
    cung: dungCung(banVan, banSon, banHuong),
    phanTich: phanTichBan(banSon, banHuong, haQuai.van, haQuai.toaSon, haQuai.huongSon),
    kiemToa: toa.kiem,
    kiemHuongSon: huong.kiem,
    sonThe,
    huongThe,
    sonTheKiem: toa.kiem ? theTinh(toa.kiem) : null,
    huongTheKiem: huong.kiem ? theTinh(huong.kiem) : null,
    sonHaQuai: haQuai.sonNhapTrung,
    huongHaQuai: haQuai.huongNhapTrung,
    khongDoi: sonThe === haQuai.sonNhapTrung && huongThe === haQuai.huongNhapTrung,
  };
}
