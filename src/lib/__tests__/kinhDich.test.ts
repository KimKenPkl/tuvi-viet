/**
 * Test cho Kinh Dịch: dựng quẻ từ mã nhị phân và từ lịch sử 6 hào.
 *
 * Chạy bằng `npx tsx src/lib/__tests__/kinhDich.test.ts`.
 */

import {
  NHI_PHAN_QUAI,
  QUE,
  dungQueTuHao,
  gieoQue,
  queTheoHao,
} from '../kinhDich';

let loi = 0;

function kiemTra(dieuKien: boolean, moTa: string, chiTiet?: string) {
  if (dieuKien) {
    console.log(`✓ ${moTa}`);
  } else {
    loi++;
    console.error(`✗ ${moTa}${chiTiet ? ` — ${chiTiet}` : ''}`);
  }
}

function haoTuQue(tren: string, duoi: string): number[] {
  const bits = (NHI_PHAN_QUAI[duoi as keyof typeof NHI_PHAN_QUAI] +
    NHI_PHAN_QUAI[tren as keyof typeof NHI_PHAN_QUAI])
    .split('')
    .map(Number);
  return bits.map((b) => (b ? 7 : 8));
}

// ── 1. Bảng 64 quẻ ───────────────────────────────────────────────────────

console.log('— Bảng 64 quẻ —');

kiemTra(QUE.length === 64, 'Có đủ 64 quẻ', String(QUE.length));
kiemTra(new Set(QUE.map((q) => q.so)).size === 64, 'Số quẻ không trùng');
kiemTra(
  new Set(QUE.map((q) => NHI_PHAN_QUAI[q.duoi] + NHI_PHAN_QUAI[q.tren])).size === 64,
  'Mã 6 hào không trùng',
);
kiemTra(
  QUE.every((q, i) => q.so === i + 1),
  'Số quẻ tăng đều từ 1 đến 64',
);
kiemTra(
  QUE.every((q) => q.tomTat.trim().length > 20),
  'Quẻ nào cũng có phần tóm tắt',
);

// ── 2. Dựng quẻ từ hào ───────────────────────────────────────────────────

console.log('\n— Dựng quẻ —');

let dungHet = 0;
for (const q of QUE) {
  const kq = queTheoHao(haoTuQue(q.tren, q.duoi));
  if (kq?.so === q.so) dungHet += 1;
}
kiemTra(dungHet === 64, 'Dựng lại đúng cả 64 quẻ từ mã hào', `${dungHet}/64`);

const can = dungQueTuHao([7, 7, 7, 7, 7, 7]);
kiemTra(can.chu.so === 1 && can.chu.ten === 'Thuần Càn', 'Sáu hào dương là Thuần Càn', can.chu.ten);
kiemTra(can.viTriDong.length === 0, 'Quẻ không động thì không có hào động');
kiemTra(can.bien === null, 'Quẻ không động thì không có quẻ biến');

const khon = dungQueTuHao([8, 8, 8, 8, 8, 8]);
kiemTra(khon.chu.so === 2 && khon.chu.ten === 'Thuần Khôn', 'Sáu hào âm là Thuần Khôn', khon.chu.ten);

// Sơ hào âm động: 6 hào còn lại dương → Cấu (44), biến thành Càn (1).
const cau = dungQueTuHao([6, 7, 7, 7, 7, 7]);
kiemTra(cau.chu.so === 44, 'Một hào âm ở dưới là Thiên Phong Cấu', `${cau.chu.so}. ${cau.chu.ten}`);
kiemTra(cau.viTriDong.join(',') === '1', 'Ghi nhận hào động ở vị trí 1', cau.viTriDong.join(','));
kiemTra(cau.bien?.so === 1, 'Hào âm động biến thành quẻ Thuần Càn', String(cau.bien?.so));

// ── 3. Gieo ngẫu nhiên có kiểm soát ─────────────────────────────────────

console.log('\n— Gieo quẻ —');

const luonSap = gieoQue(() => 0); // mỗi đồng xu ra 2 → tổng 6
kiemTra(
  luonSap.hao.every((h) => h.giaTri === 6 && h.dong),
  'RNG luôn sấp cho ra toàn hào 6 (lão âm)',
);
kiemTra(luonSap.chu.so === 2, 'Toàn hào 6 cho quẻ Thuần Khôn', String(luonSap.chu.so));
kiemTra(luonSap.bien?.so === 1, 'Toàn hào 6 biến thành Thuần Càn', String(luonSap.bien?.so));

const luonNgua = gieoQue(() => 0.99); // mỗi đồng xu ra 3 → tổng 9
kiemTra(
  luonNgua.hao.every((h) => h.giaTri === 9 && h.dong),
  'RNG luôn ngửa cho ra toàn hào 9 (lão dương)',
);
kiemTra(luonNgua.chu.so === 1, 'Toàn hào 9 cho quẻ Thuần Càn', String(luonNgua.chu.so));
kiemTra(luonNgua.bien?.so === 2, 'Toàn hào 9 biến thành Thuần Khôn', String(luonNgua.bien?.so));

const ngauNhien = gieoQue();
kiemTra(
  ngauNhien.hao.length === 6 && ngauNhien.hao.every((h) => [6, 7, 8, 9].includes(h.giaTri)),
  'Gieo ngẫu nhiên luôn ra 6 hào hợp lệ',
);
kiemTra(ngauNhien.chu.so >= 1 && ngauNhien.chu.so <= 64, 'Quẻ chủ luôn nằm trong 1–64');

// ── 4. Chặn dữ liệu hỏng ────────────────────────────────────────────────

console.log('\n— Chặn dữ liệu hỏng —');

function nem(fn: () => unknown): boolean {
  try {
    fn();
    return false;
  } catch {
    return true;
  }
}

kiemTra(nem(() => dungQueTuHao([7, 7, 7])), 'Thiếu hào thì báo lỗi');
kiemTra(nem(() => dungQueTuHao([7, 7, 7, 7, 7, 5])), 'Giá trị hào ngoài 6–9 thì báo lỗi');
kiemTra(queTheoHao([7, 7, 7]) === null, 'queTheoHao trả null khi thiếu hào');
kiemTra(queTheoHao([7, 7, 7, 7, 7, 5]) === null, 'queTheoHao trả null khi hào không hợp lệ');

if (loi) {
  console.error(`\n${loi} lỗi ở phần Kinh Dịch.`);
  process.exitCode = 1;
} else {
  console.log('\nTất cả kiểm tra Kinh Dịch đều đạt.');
}
