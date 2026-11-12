/**
 * Test cho bốn lớp sao thời gian (紫白): nguyệt tinh, nhật tinh, thời tinh.
 *
 * Các ca "vàng" lấy từ chính khẩu quyết và ví dụ trong nguồn:
 * - 1995 Ất Hợi, tháng Ngọ → sao tháng 7 (nguồn: 从坤 2 宫起正月（寅）逆行,
 *   tháng 1 = 2, tháng 2 = 1, tháng 3 = 9, tháng 4 = 8, tháng 5 = 7).
 * - 冬至 一白, 雨水 七赤, 谷雨 四绿; 夏至 九紫, 处暑 三碧, 霜降 六白.
 * - Giờ Tý của ngày Tý–Ngọ–Mão–Dậu nửa dương khởi 1; ngày Thìn–Tuất–Sửu–Mùi
 *   khởi 4; ngày Dần–Thân–Tỵ–Hợi khởi 7. Nửa âm: 9 / 6 / 3.
 *
 * Chạy: `npx tsx src/lib/__tests__/phiTinhThoiGian.test.ts`
 */

import { canChiNgay, jdFromDate } from '../amlich';
import { saoNam } from '../phiTinh';
import {
  banGio,
  banNgay,
  banThang,
  bonLopThoiGian,
  chieuNgay,
  chiNgay,
  giapTyGanNhat,
  mocCuaNgay,
  nhomChi,
  saoGio,
  saoKhoiGio,
  saoKhoiThang,
  saoNgay,
  saoThang,
  thangTietKhi,
} from '../phiTinhThoiGian';

let loi = 0;

function kiemTra(dieuKien: boolean, moTa: string, chiTiet?: string) {
  if (dieuKien) {
    console.log(`✓ ${moTa}`);
  } else {
    loi++;
    console.error(`✗ ${moTa}${chiTiet ? ` — ${chiTiet}` : ''}`);
  }
}

const jdCua = (d: Date) => jdFromDate(d.getDate(), d.getMonth() + 1, d.getFullYear());

// ── 1. Nguyệt tinh ─────────────────────────────────────────────────────────

console.log('\n- Nguyệt tinh -');

kiemTra(saoKhoiThang(0) === 8 && saoKhoiThang(3) === 8 && saoKhoiThang(6) === 8 && saoKhoiThang(9) === 8,
  'Năm Tý–Ngọ–Mão–Dậu khởi tháng Giêng 8');
kiemTra(saoKhoiThang(1) === 5 && saoKhoiThang(4) === 5 && saoKhoiThang(7) === 5 && saoKhoiThang(10) === 5,
  'Năm Sửu–Thìn–Mùi–Tuất khởi tháng Giêng 5');
kiemTra(saoKhoiThang(2) === 2 && saoKhoiThang(5) === 2 && saoKhoiThang(8) === 2 && saoKhoiThang(11) === 2,
  'Năm Dần–Tỵ–Thân–Hợi khởi tháng Giêng 2');

// Ví dụ nguyên văn: 1995 Ất Hợi, tháng Ngọ (tháng 5) → 7.
kiemTra(saoThang(1995, 5) === 7, '1995 Ất Hợi, tháng 5 → sao 7', String(saoThang(1995, 5)));
kiemTra(saoThang(1995, 1) === 2, '1995 Ất Hợi, tháng Giêng → sao 2', String(saoThang(1995, 1)));

// Mỗi tháng lùi đúng một sao, quay vòng 1..9.
let luiDung = true;
for (let nam = 1990; nam <= 2030; nam++) {
  for (let thang = 2; thang <= 12; thang++) {
    const truoc = saoThang(nam, thang - 1);
    const nay = saoThang(nam, thang);
    const mongDoi = truoc === 1 ? 9 : truoc - 1;
    if (nay !== mongDoi) luiDung = false;
  }
}
kiemTra(luiDung, 'Sao tháng lùi một đơn vị mỗi tháng, đủ 12 tháng × 41 năm');

// Bàn tháng đủ 9 cung và dùng đủ 9 sao.
const bt = banThang(2026, 6);
kiemTra(Object.keys(bt).length === 9, 'Bàn tháng có đủ 9 cung');
kiemTra(new Set(Object.values(bt)).size === 9, 'Bàn tháng dùng đủ 9 sao');

// ── 2. Mốc nhật tinh ───────────────────────────────────────────────────────

console.log('\n- Nhật tinh: mốc Giáp Tý -');

// Ngày Giáp Tý gần nhất phải đúng là Giáp Tý và cách mốc không quá 30 ngày.
let ganDung = true;
for (let jd = 2_450_000; jd < 2_460_000; jd += 7) {
  const j = giapTyGanNhat(jd);
  if (canChiNgay(j) !== 'Giáp Tý') ganDung = false;
  if (Math.abs(j - jd) > 30) ganDung = false;
}
kiemTra(ganDung, 'Giáp Tý gần nhất: đúng can chi và cách mốc ≤ 30 ngày');

// Bốn mốc dương phải là 1, 7, 4; ba mốc âm là 9, 3, 6.
const moc2026 = [
  mocCuaNgay(new Date(2026, 0, 15)),
  mocCuaNgay(new Date(2026, 2, 15)),
  mocCuaNgay(new Date(2026, 4, 15)),
  mocCuaNgay(new Date(2026, 6, 15)),
  mocCuaNgay(new Date(2026, 8, 15)),
  mocCuaNgay(new Date(2026, 10, 15)),
];
kiemTra(
  moc2026[0].ten === 'Đông Chí' && moc2026[0].sao === 1 && moc2026[0].chieu === 1,
  'Giữa tháng 1 dùng mốc Đông chí, sao 1, phi thuận',
  `${moc2026[0].ten}/${moc2026[0].sao}`,
);
kiemTra(
  moc2026[1].ten === 'Vũ Thuỷ' && moc2026[1].sao === 7,
  'Giữa tháng 3 dùng mốc Vũ thuỷ, sao 7',
  `${moc2026[1].ten}/${moc2026[1].sao}`,
);
kiemTra(
  moc2026[2].ten === 'Cốc Vũ' && moc2026[2].sao === 4,
  'Giữa tháng 5 dùng mốc Cốc vũ, sao 4',
  `${moc2026[2].ten}/${moc2026[2].sao}`,
);
kiemTra(
  moc2026[3].ten === 'Hạ Chí' && moc2026[3].sao === 9 && moc2026[3].chieu === -1,
  'Giữa tháng 7 dùng mốc Hạ chí, sao 9, phi nghịch',
  `${moc2026[3].ten}/${moc2026[3].sao}`,
);
kiemTra(
  moc2026[4].ten === 'Xử Thử' && moc2026[4].sao === 3,
  'Giữa tháng 9 dùng mốc Xử thử, sao 3',
  `${moc2026[4].ten}/${moc2026[4].sao}`,
);
kiemTra(
  moc2026[5].ten === 'Sương Giáng' && moc2026[5].sao === 6,
  'Giữa tháng 11 dùng mốc Sương giáng, sao 6',
  `${moc2026[5].ten}/${moc2026[5].sao}`,
);

// ── 3. Nhật tinh: chuỗi ngày ───────────────────────────────────────────────

console.log('\n- Nhật tinh: chuỗi ngày -');

// Ngày Giáp Tý của mốc phải mang đúng sao của mốc.
let mocDung = true;
for (let thang = 1; thang <= 12; thang++) {
  const d = new Date(2026, thang - 1, 15);
  const moc = mocCuaNgay(d);
  const ms = Date.UTC(...(moc.ngayGiapTy.split('-').map((x, i) => (i === 1 ? Number(x) - 1 : Number(x))) as [number, number, number]));
  void ms;
  // Dựng lại ngày từ chuỗi để so jd.
  const [y, m, dd] = moc.ngayGiapTy.split('-').map(Number);
  const jdMoc = jdFromDate(dd, m, y);
  if (jdMoc !== moc.jd) mocDung = false;
  const dMoc = new Date(y, m - 1, dd);
  // saoNgay tại đúng ngày mốc phải bằng sao mốc (cùng mốc đang hiệu lực).
  if (mocCuaNgay(dMoc).jd === moc.jd && saoNgay(dMoc) !== moc.sao) mocDung = false;
}
kiemTra(mocDung, 'Tại ngày Giáp Tý của mốc, sao ngày đúng bằng sao mốc');

// Trong cùng một mốc, mỗi ngày đổi đúng ±1 sao.
let chuoiDung = true;
for (let thang = 1; thang <= 11; thang++) {
  const dau = new Date(2026, thang - 1, 5);
  for (let k = 0; k < 20; k++) {
    const a = new Date(dau.getTime() + k * 86_400_000);
    const b = new Date(a.getTime() + 86_400_000);
    if (mocCuaNgay(a).jd !== mocCuaNgay(b).jd) continue;
    const chieu = chieuNgay(a);
    const mongDoi = ((saoNgay(a) - 1 + chieu + 900) % 9) + 1;
    if (saoNgay(b) !== mongDoi) chuoiDung = false;
  }
}
kiemTra(chuoiDung, 'Trong một mốc, sao ngày đổi đúng ±1 theo chiều phi');

kiemTra(
  (() => {
    const b = banNgay(new Date(2026, 10, 12));
    return Object.keys(b).length === 9 && new Set(Object.values(b)).size === 9;
  })(),
  'Bàn ngày đủ 9 cung và dùng đủ 9 sao',
);

// ── 4. Thời tinh ───────────────────────────────────────────────────────────

console.log('\n- Thời tinh -');

kiemTra(nhomChi(0) === 'trong' && nhomChi(6) === 'trong' && nhomChi(3) === 'trong' && nhomChi(9) === 'trong',
  'Tý–Ngọ–Mão–Dậu thuộc nhóm 仲');
kiemTra(nhomChi(2) === 'manh' && nhomChi(8) === 'manh' && nhomChi(5) === 'manh' && nhomChi(11) === 'manh',
  'Dần–Thân–Tỵ–Hợi thuộc nhóm 孟');
kiemTra(nhomChi(1) === 'quy' && nhomChi(7) === 'quy' && nhomChi(4) === 'quy' && nhomChi(10) === 'quy',
  'Sửu–Mùi–Thìn–Tuất thuộc nhóm 季');

kiemTra(saoKhoiGio(0, 1) === 1 && saoKhoiGio(6, 1) === 1, 'Nửa dương, ngày Tý/Ngọ khởi giờ Tý 1');
kiemTra(saoKhoiGio(2, 1) === 7 && saoKhoiGio(11, 1) === 7, 'Nửa dương, ngày Dần/Hợi khởi giờ Tý 7');
kiemTra(saoKhoiGio(1, 1) === 4 && saoKhoiGio(10, 1) === 4, 'Nửa dương, ngày Sửu/Tuất khởi giờ Tý 4');
kiemTra(saoKhoiGio(0, -1) === 9 && saoKhoiGio(3, -1) === 9, 'Nửa âm, ngày Tý/Mão khởi giờ Tý 9');
kiemTra(saoKhoiGio(2, -1) === 3 && saoKhoiGio(8, -1) === 3, 'Nửa âm, ngày Dần/Thân khởi giờ Tý 3');
kiemTra(saoKhoiGio(1, -1) === 6 && saoKhoiGio(7, -1) === 6, 'Nửa âm, ngày Sửu/Mùi khởi giờ Tý 6');

// Tìm một ngày nửa dương có chi Tý rồi kiểm tra 12 giờ liên tiếp.
function timNgay(chieu: 1 | -1, nhom: 'trong' | 'manh' | 'quy'): Date {
  for (let k = 0; k < 400; k++) {
    const d = new Date(2026, 0, 1 + k);
    if (chieuNgay(d) !== chieu) continue;
    if (nhomChi(chiNgay(d)) === nhom) return d;
  }
  throw new Error('không tìm được ngày phù hợp');
}

const ngayDuongTrong = timNgay(1, 'trong');
kiemTra(
  saoGio(ngayDuongTrong, 0) === 1 && saoGio(ngayDuongTrong, 1) === 2 && saoGio(ngayDuongTrong, 11) === 3,
  'Ngày dương nhóm 仲: giờ Tý 1, Sửu 2, Hợi 3',
  `${ngayDuongTrong.toISOString().slice(0, 10)}`,
);

const ngayAmManh = timNgay(-1, 'manh');
kiemTra(
  saoGio(ngayAmManh, 0) === 3 && saoGio(ngayAmManh, 1) === 2 && saoGio(ngayAmManh, 2) === 1,
  'Ngày âm nhóm 孟: giờ Tý 3, Sửu 2, Dần 1',
  `${ngayAmManh.toISOString().slice(0, 10)}`,
);

// Mỗi giờ đổi đúng ±1, đủ 12 giờ.
let gioDung = true;
for (const d of [ngayDuongTrong, ngayAmManh]) {
  const chieu = chieuNgay(d);
  for (let g = 1; g < 12; g++) {
    const mongDoi = ((saoGio(d, g - 1) - 1 + chieu + 900) % 9) + 1;
    if (saoGio(d, g) !== mongDoi) gioDung = false;
  }
}
kiemTra(gioDung, '12 giờ đổi đúng ±1 sao theo chiều phi');

const bg = banGio(ngayDuongTrong, 5);
kiemTra(Object.keys(bg).length === 9 && new Set(Object.values(bg)).size === 9,
  'Bàn giờ đủ 9 cung và dùng đủ 9 sao');

// ── 5. Tháng tiết khí ──────────────────────────────────────────────────────

console.log('\n- Tháng tiết khí -');

const tkDauNam = thangTietKhi(new Date(2026, 0, 20));
kiemTra(tkDauNam.thang === 12, 'Ngày 20/1/2026 còn thuộc tháng 12 tiết khí (Sửu)', String(tkDauNam.thang));
kiemTra(tkDauNam.nam === 2025, 'Ngày 20/1/2026 thuộc năm tiết khí 2025', String(tkDauNam.nam));

const tkSauLapXuan = thangTietKhi(new Date(2026, 1, 10));
kiemTra(tkSauLapXuan.thang === 1 && tkSauLapXuan.nam === 2026 && tkSauLapXuan.chi === 2,
  'Ngày 10/2/2026 đã sang tháng Giêng (Dần) của năm 2026',
  `${tkSauLapXuan.thang}/${tkSauLapXuan.nam}/${tkSauLapXuan.chi}`);

const tkGiuaNam = thangTietKhi(new Date(2026, 5, 10));
kiemTra(tkGiuaNam.thang === 5 && tkGiuaNam.chi === 6, 'Ngày 10/6/2026 là tháng 5 (Ngọ)',
  `${tkGiuaNam.thang}/${tkGiuaNam.chi}`);

// ── 6. Gói bốn lớp ─────────────────────────────────────────────────────────

console.log('\n- Gói bốn lớp -');

const bon = bonLopThoiGian(new Date(2026, 10, 12), 6);
kiemTra(bon.length === 4, 'Trả đủ bốn lớp');
kiemTra(bon.map((l) => l.loai).join(',') === 'nam,thang,ngay,gio', 'Đúng thứ tự năm–tháng–ngày–giờ');
kiemTra(bon.every((l) => Object.keys(l.ban).length === 9), 'Cả bốn lớp đều có bàn 9 cung');
kiemTra(bon.every((l) => Object.values(l.ban).includes(l.sao)), 'Sao nhập trung có mặt trong bàn của nó');
kiemTra(bon[3].nhan.startsWith('Giờ Ngọ'), 'Nhãn lớp giờ đúng chi', bon[3].nhan);

// Lớp năm đổi ở Lập Xuân, không đợi tới Tết: 10/2/2026 đã sang Bính Ngọ dù
// Tết Bính Ngọ còn vài ngày nữa; 20/1/2026 vẫn là Ất Tỵ.
const truocLapXuan = bonLopThoiGian(new Date(2026, 0, 20), 0);
const sauLapXuan = bonLopThoiGian(new Date(2026, 1, 10), 0);
kiemTra(
  truocLapXuan[0].nhan === 'Năm Ất Tỵ' && truocLapXuan[0].sao === saoNam(2025),
  'Ngày 20/1/2026: lớp năm vẫn là Ất Tỵ',
  `${truocLapXuan[0].nhan} / ${truocLapXuan[0].sao}`,
);
kiemTra(
  sauLapXuan[0].nhan === 'Năm Bính Ngọ' && sauLapXuan[0].sao === saoNam(2026),
  'Ngày 10/2/2026: lớp năm đã sang Bính Ngọ',
  `${sauLapXuan[0].nhan} / ${sauLapXuan[0].sao}`,
);
kiemTra(
  sauLapXuan[1].nhan.startsWith('Tháng 1 (Dần)'),
  'Ngày 10/2/2026: lớp tháng là tháng Giêng (Dần)',
  sauLapXuan[1].nhan,
);

// ── Tổng kết ───────────────────────────────────────────────────────────────

console.log(`\n${loi === 0 ? '✓ Tất cả kiểm tra đều đạt' : `✗ ${loi} kiểm tra không đạt`}`);
if (loi > 0) process.exit(1);
