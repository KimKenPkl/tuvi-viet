/**
 * Test cho 24 tiết khí.
 *
 * Mốc so sánh lấy từ lịch thiên văn (giờ Việt Nam, UTC+7). Công thức Meeus
 * rút gọn có sai số vài phút nên chỉ khẳng định đúng NGÀY, không khẳng định
 * đúng phút — trừ những mốc cách nửa đêm vài giờ.
 *
 * Chạy bằng `npx tsx src/lib/__tests__/tietKhi.test.ts`.
 */

import { kinhDoMatTroi, tietKhiCuaNgay, tietKhiKeTiep, tietKhiTrongNam } from '../tietKhi';

let loi = 0;

function kiemTra(dieuKien: boolean, moTa: string, chiTiet?: string) {
  if (dieuKien) {
    console.log(`✓ ${moTa}`);
  } else {
    loi++;
    console.error(`✗ ${moTa}${chiTiet ? ` — ${chiTiet}` : ''}`);
  }
}

function ngayCua(nam: number, ten: string): string {
  return tietKhiTrongNam(nam).find((t) => t.ten === ten)?.ngay ?? '';
}

function soNgay(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number);
  const [yb, mb, db] = b.split('-').map(Number);
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000);
}

// ── 1. Cấu trúc một năm ──────────────────────────────────────────────────

console.log('— Cấu trúc —');

for (const nam of [2024, 2025, 2026, 2027]) {
  const ds = tietKhiTrongNam(nam);
  kiemTra(ds.length === 24, `Năm ${nam} đủ 24 tiết khí`, String(ds.length));
  kiemTra(
    ds.every((t) => t.nam === nam),
    `Năm ${nam}: mọi mốc nằm trong năm`,
  );
  kiemTra(new Set(ds.map((t) => t.kinhDo)).size === 24, `Năm ${nam}: 24 kinh độ khác nhau`);
  kiemTra(
    ds.every((t, i) => (i % 2 === 0 ? t.loai === 'tiet' : t.loai === 'trung')),
    `Năm ${nam}: tiết và trung khí xen kẽ`,
  );
  kiemTra(
    ds.every((t, i) => i === 0 || soNgay(ds[i - 1].ngay, t.ngay) >= 14),
    `Năm ${nam}: mốc cách nhau ít nhất 14 ngày`,
  );
  kiemTra(
    ds.every((t, i) => i === 0 || soNgay(ds[i - 1].ngay, t.ngay) <= 16),
    `Năm ${nam}: mốc cách nhau không quá 16 ngày`,
  );
}

const ds2026 = tietKhiTrongNam(2026);
kiemTra(ds2026[0].ten === 'Tiểu Hàn', 'Mốc đầu năm là Tiểu Hàn', ds2026[0]?.ten);
kiemTra(ds2026[23].ten === 'Đông Chí', 'Mốc cuối năm là Đông Chí', ds2026[23]?.ten);
kiemTra(ds2026[22].ten === 'Đại Tuyết', 'Đại Tuyết đứng ngay trước Đông Chí', ds2026[22]?.ten);
kiemTra(ds2026[0].mua === 'Đông', 'Tiểu Hàn thuộc mùa đông');
kiemTra(ds2026[22].mua === 'Đông', 'Đại Tuyết thuộc mùa đông');
kiemTra(ds2026[8].ten === 'Lập Hạ' && ds2026[8].mua === 'Hạ', 'Lập Hạ mở đầu mùa hạ');

// ── 2. Mốc thiên văn đã biết ─────────────────────────────────────────────

console.log('\n— Mốc thiên văn —');

const MOC: [number, string, string][] = [
  [2024, 'Xuân Phân', '2024-03-20'],
  [2024, 'Hạ Chí', '2024-06-21'],
  [2024, 'Thu Phân', '2024-09-22'],
  [2024, 'Đông Chí', '2024-12-21'],
  [2025, 'Lập Xuân', '2025-02-03'],
  [2025, 'Thu Phân', '2025-09-23'],
  [2026, 'Xuân Phân', '2026-03-20'],
  [2026, 'Hạ Chí', '2026-06-21'],
  [2026, 'Thu Phân', '2026-09-23'],
  [2026, 'Đông Chí', '2026-12-22'],
];

for (const [nam, ten, mongDoi] of MOC) {
  const thucTe = ngayCua(nam, ten);
  kiemTra(thucTe === mongDoi, `${ten} ${nam} là ${mongDoi}`, thucTe);
}

// ── 3. Tiết khí của một ngày ─────────────────────────────────────────────

console.log('\n— Tiết khí của ngày —');

kiemTra(
  tietKhiCuaNgay(new Date('2026-01-01T00:00:00')).ten === 'Đông Chí',
  'Đầu tháng 1 vẫn thuộc Đông Chí của năm trước',
  tietKhiCuaNgay(new Date('2026-01-01T00:00:00')).ten,
);
kiemTra(
  tietKhiCuaNgay(new Date('2026-06-15T00:00:00')).ten === 'Mang Chủng',
  'Giữa tháng 6 thuộc Mang Chủng',
  tietKhiCuaNgay(new Date('2026-06-15T00:00:00')).ten,
);
kiemTra(
  tietKhiCuaNgay(new Date('2025-12-25T00:00:00')).ten === 'Đông Chí',
  'Cuối tháng 12 thuộc Đông Chí',
  tietKhiCuaNgay(new Date('2025-12-25T00:00:00')).ten,
);

const chuKy = tietKhiKeTiep(new Date('2026-11-11T00:00:00'));
kiemTra(chuKy.hienTai.ten === 'Lập Đông', 'Ngày 11/11/2026 đang là Lập Đông', chuKy.hienTai.ten);
kiemTra(chuKy.keTiep.ten === 'Tiểu Tuyết', 'Tiết kế tiếp là Tiểu Tuyết', chuKy.keTiep.ten);
kiemTra(chuKy.keTiep.ngay === '2026-11-22', 'Tiểu Tuyết 2026 bắt đầu 22/11', chuKy.keTiep.ngay);
kiemTra(chuKy.conLai === 11, 'Còn 11 ngày tới Tiểu Tuyết', String(chuKy.conLai));

// ── 4. Kinh độ Mặt Trời ─────────────────────────────────────────────────

console.log('\n— Kinh độ Mặt Trời —');

const dauNam = kinhDoMatTroi(2_461_041.5); // 2026-01-01 00:00 UT
kiemTra(dauNam > 279 && dauNam < 282, 'Đầu năm 2026 Mặt Trời ở khoảng 280°', dauNam.toFixed(2));

const xuanPhan = tietKhiTrongNam(2026).find((t) => t.ten === 'Xuân Phân');
kiemTra(xuanPhan?.kinhDo === 0, 'Xuân Phân ứng với kinh độ 0°', String(xuanPhan?.kinhDo));

if (loi) {
  console.error(`\n${loi} lỗi ở phần tiết khí.`);
  process.exitCode = 1;
} else {
  console.log('\nTất cả kiểm tra tiết khí đều đạt.');
}
