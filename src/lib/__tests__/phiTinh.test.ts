/**
 * Test cho Huyền Không Phi Tinh.
 *
 * Các ca "vàng" là những bàn đã được ghi trong sách cổ điển (Trạch Vận Tân
 * Án) và lưu truyền rộng rãi, không lấy từ app của bên thứ ba:
 *
 * - Bát vận, Tý sơn Ngọ hướng: song tinh hội hướng, 8/8 tại Ly.
 * - Cửu vận, Tý sơn Ngọ hướng: song tinh hội hướng, 9/9 tại Ly.
 * - Bát vận, Ngọ sơn Tý hướng: song tinh hội toạ, 8/8 tại Ly (cung toạ).
 * - Bát vận, Thìn sơn Tuất hướng: vượng sơn vượng hướng.
 * - Bát vận, Bính sơn Nhâm hướng: thượng sơn hạ thuỷ.
 *
 * Ngoài ra kiểm tra vận, 24 sơn, kiêm hướng và phi tinh năm.
 *
 * Chạy: `npx tsx src/lib/__tests__/phiTinh.test.ts`
 */

import {
  SAO,
  SON,
  banNam,
  kiemHuong,
  lapBanPhiTinh,
  namCuoiVan,
  namDauVan,
  phi,
  saoNam,
  sonTheoDo,
  tamNguyen,
  vanTheoNam,
  type BanPhiTinh,
} from '../phiTinh';

let loi = 0;

function kiemTra(dieuKien: boolean, moTa: string, chiTiet?: string) {
  if (dieuKien) {
    console.log(`✓ ${moTa}`);
  } else {
    loi++;
    console.error(`✗ ${moTa}${chiTiet ? ` — ${chiTiet}` : ''}`);
  }
}

/** Lấy một cung theo số Lạc Thư. */
function cung(b: BanPhiTinh, so: number) {
  return b.cung.find((c) => c.so === so);
}

function boBa(b: BanPhiTinh, so: number): string {
  const c = cung(b, so);
  return c ? `${c.van}/${c.son}/${c.huongSao}` : '?';
}

// ── 1. Chín sao và chín cung ─────────────────────────────────────────────

console.log('— Cửu tinh —');

kiemTra(SAO.length === 9, 'Có đủ 9 sao', String(SAO.length));
kiemTra(
  SAO.every((s, i) => s.so === i + 1),
  'Số sao chạy đều 1–9',
);
kiemTra(
  SAO.every((s) => ['Kim', 'Mộc', 'Thuỷ', 'Hoả', 'Thổ'].includes(s.hanh)),
  'Sao nào cũng có ngũ hành hợp lệ',
);
kiemTra(
  SAO.filter((s) => s.hanh === 'Thổ').length === 3,
  'Thổ có 3 sao (2, 5, 8)',
);

// ── 2. Vận ───────────────────────────────────────────────────────────────

console.log('\n— Vận —');

const MOC_VAN: [number, number][] = [
  [1864, 1],
  [1883, 1],
  [1884, 2],
  [1903, 2],
  [1984, 7],
  [2003, 7],
  [2004, 8],
  [2023, 8],
  [2024, 9],
  [2043, 9],
];
for (const [nam, van] of MOC_VAN) {
  kiemTra(vanTheoNam(nam) === van, `${nam} thuộc vận ${van}`, String(vanTheoNam(nam)));
}
kiemTra(namDauVan(9) === 2024, 'Vận 9 bắt đầu 2024', String(namDauVan(9)));
kiemTra(namCuoiVan(9) === 2043, 'Vận 9 kết thúc 2043', String(namCuoiVan(9)));
kiemTra(tamNguyen(9) === 'Hạ nguyên', 'Vận 9 thuộc Hạ nguyên');
kiemTra(tamNguyen(5) === 'Trung nguyên', 'Vận 5 thuộc Trung nguyên');

// ── 3. 24 sơn ────────────────────────────────────────────────────────────

console.log('\n— 24 sơn —');

kiemTra(SON.length === 24, 'Có đủ 24 sơn', String(SON.length));
kiemTra(new Set(SON.map((s) => s.ten)).size === 24, 'Tên 24 sơn không trùng');
kiemTra(new Set(SON.map((s) => s.han)).size === 24, 'Chữ Hán 24 sơn không trùng');
kiemTra(
  SON.filter((s) => s.duong).length === 12,
  'Có đúng 12 dương sơn',
  String(SON.filter((s) => s.duong).length),
);

const MOC_SON: [number, string][] = [
  [0, 'Tý'],
  [5, 'Tý'],
  [7.5, 'Quý'],
  [22.5, 'Sửu'],
  [45, 'Cấn'],
  [90, 'Mão'],
  [135, 'Tốn'],
  [180, 'Ngọ'],
  [225, 'Khôn'],
  [270, 'Dậu'],
  [315, 'Càn'],
  [337.5, 'Nhâm'],
  [352.5, 'Tý'],
  [359.9, 'Tý'],
];
for (const [do_, ten] of MOC_SON) {
  kiemTra(sonTheoDo(do_).ten === ten, `${do_}° thuộc sơn ${ten}`, sonTheoDo(do_).ten);
}

kiemTra(sonTheoDo(0).duong, 'Tý là dương sơn');
kiemTra(!sonTheoDo(180).duong, 'Ngọ là âm sơn');
kiemTra(sonTheoDo(90).duong, 'Mão là dương sơn');
kiemTra(!sonTheoDo(270).duong, 'Dậu là âm sơn');

// ── 4. Kiêm hướng ────────────────────────────────────────────────────────

console.log('\n— Kiêm hướng —');

kiemTra(!kiemHuong(0).kiem, '0° là chính hướng, không kiêm');
kiemTra(!kiemHuong(180).kiem, '180° là chính hướng, không kiêm');
kiemTra(kiemHuong(352.5).kiem, '352.5° nằm đúng ranh giới, là kiêm hướng');
kiemTra(kiemHuong(172.5).kiem, '172.5° nằm đúng ranh giới, là kiêm hướng');
kiemTra(kiemHuong(350).kiem, '350° chỉ cách ranh giới 2,5° nên là kiêm hướng');
kiemTra(Math.abs(kiemHuong(350).lech - 2.5) < 1e-9, 'Báo đúng khoảng cách 2,5°', String(kiemHuong(350).lech));

// ── 5. Phi tinh cơ bản ───────────────────────────────────────────────────

console.log('\n— Phi tinh —');

const ban8 = phi(8, 1);
kiemTra(ban8[5] === 8, 'Sao 8 nhập trung', String(ban8[5]));
kiemTra(ban8[6] === 9 && ban8[7] === 1, 'Phi thuận: Càn 9, Đoài 1');
kiemTra(ban8[1] === 4 && ban8[2] === 5, 'Phi thuận: Khảm 4, Khôn 5');
kiemTra(ban8[4] === 7, 'Phi thuận: Tốn 7', String(ban8[4]));

const ban9Nghich = phi(9, -1);
kiemTra(ban9Nghich[5] === 9, 'Sao 9 nhập trung');
kiemTra(ban9Nghich[6] === 8, 'Phi nghịch: Càn 8', String(ban9Nghich[6]));
kiemTra(ban9Nghich[4] === 1, 'Phi nghịch: Tốn 1', String(ban9Nghich[4]));

for (const sao of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  const thuan = phi(sao, 1);
  const nghich = phi(sao, -1);
  kiemTra(
    new Set(Object.values(thuan)).size === 9 && new Set(Object.values(nghich)).size === 9,
    `Sao ${sao}: mỗi bàn dùng đủ 9 sao, không trùng`,
  );
}

// ── 6. Bàn kinh điển: bát vận Tý sơn Ngọ hướng ───────────────────────────

console.log('\n— Bát vận, Tý sơn Ngọ hướng —');

const tyNgo8 = lapBanPhiTinh(2010, 180);
kiemTra(tyNgo8.van === 8, 'Năm 2010 thuộc vận 8', String(tyNgo8.van));
kiemTra(tyNgo8.huongSon.ten === 'Ngọ', 'Hướng là Ngọ', tyNgo8.huongSon.ten);
kiemTra(tyNgo8.toaSon.ten === 'Tý', 'Toạ là Tý', tyNgo8.toaSon.ten);
kiemTra(!tyNgo8.kiemHuong, '180° không phải kiêm hướng');
kiemTra(tyNgo8.sonNhapTrung === 4, 'Sơn tinh nhập trung là 4', String(tyNgo8.sonNhapTrung));
kiemTra(tyNgo8.huongNhapTrung === 3, 'Hướng tinh nhập trung là 3', String(tyNgo8.huongNhapTrung));
kiemTra(boBa(tyNgo8, 9) === '3/8/8', 'Cung Ly (Nam) là 3/8/8', boBa(tyNgo8, 9));
kiemTra(boBa(tyNgo8, 5) === '8/4/3', 'Trung cung là 8/4/3', boBa(tyNgo8, 5));
kiemTra(boBa(tyNgo8, 1) === '4/9/7', 'Cung Khảm (Bắc) là 4/9/7', boBa(tyNgo8, 1));
kiemTra(tyNgo8.phanTich.kieu === 'song-tinh-hoi-huong', 'Kết luận: song tinh hội hướng', tyNgo8.phanTich.kieu);

// ── 7. Cửu vận Tý sơn Ngọ hướng ──────────────────────────────────────────

console.log('\n— Cửu vận, Tý sơn Ngọ hướng —');

const tyNgo9 = lapBanPhiTinh(2026, 180);
kiemTra(tyNgo9.van === 9, 'Năm 2026 thuộc vận 9', String(tyNgo9.van));
kiemTra(boBa(tyNgo9, 9) === '4/9/9', 'Cung Ly (Nam) là 4/9/9', boBa(tyNgo9, 9));
kiemTra(boBa(tyNgo9, 5) === '9/5/4', 'Trung cung là 9/5/4', boBa(tyNgo9, 5));
kiemTra(tyNgo9.phanTich.kieu === 'song-tinh-hoi-huong', 'Kết luận: song tinh hội hướng', tyNgo9.phanTich.kieu);

// ── 8. Bát vận Ngọ sơn Tý hướng ──────────────────────────────────────────

console.log('\n— Bát vận, Ngọ sơn Tý hướng —');

const ngoTy8 = lapBanPhiTinh(2010, 0);
kiemTra(ngoTy8.huongSon.ten === 'Tý', 'Hướng là Tý', ngoTy8.huongSon.ten);
kiemTra(ngoTy8.toaSon.ten === 'Ngọ', 'Toạ là Ngọ', ngoTy8.toaSon.ten);
kiemTra(boBa(ngoTy8, 9) === '3/8/8', 'Cung Ly (toạ) là 3/8/8', boBa(ngoTy8, 9));
kiemTra(ngoTy8.phanTich.kieu === 'song-tinh-hoi-toa', 'Kết luận: song tinh hội toạ', ngoTy8.phanTich.kieu);

// ── 9. Bát vận Thìn sơn Tuất hướng ───────────────────────────────────────

console.log('\n— Bát vận, Thìn sơn Tuất hướng —');

const thinTuathan = lapBanPhiTinh(2010, 300);
kiemTra(thinTuathan.huongSon.ten === 'Tuất', 'Hướng là Tuất', thinTuathan.huongSon.ten);
kiemTra(thinTuathan.toaSon.ten === 'Thìn', 'Toạ là Thìn', thinTuathan.toaSon.ten);
kiemTra(
  thinTuathan.phanTich.kieu === 'vuong-son-vuong-huong',
  'Kết luận: vượng sơn vượng hướng',
  thinTuathan.phanTich.kieu,
);
kiemTra(cung(thinTuathan, 4)?.son === 8, 'Sơn tinh 8 tại cung toạ (Tốn)', boBa(thinTuathan, 4));
kiemTra(cung(thinTuathan, 6)?.huongSao === 8, 'Hướng tinh 8 tại cung hướng (Càn)', boBa(thinTuathan, 6));

// ── 10. Bát vận Bính sơn Nhâm hướng ──────────────────────────────────────

console.log('\n— Bát vận, Bính sơn Nhâm hướng —');

const binhNham8 = lapBanPhiTinh(2010, 345);
kiemTra(binhNham8.huongSon.ten === 'Nhâm', 'Hướng là Nhâm', binhNham8.huongSon.ten);
kiemTra(binhNham8.toaSon.ten === 'Bính', 'Toạ là Bính', binhNham8.toaSon.ten);
kiemTra(
  binhNham8.phanTich.kieu === 'thuong-son-ha-thuy',
  'Kết luận: thượng sơn hạ thuỷ',
  binhNham8.phanTich.kieu,
);
kiemTra(cung(binhNham8, 1)?.son === 8, 'Sơn tinh 8 bay tới cung hướng (Khảm)', boBa(binhNham8, 1));
kiemTra(cung(binhNham8, 9)?.huongSao === 8, 'Hướng tinh 8 bay tới cung toạ (Ly)', boBa(binhNham8, 9));

// ── 11. Phi tinh năm ─────────────────────────────────────────────────────

console.log('\n— Phi tinh năm —');

const MOC_NAM: [number, number, number][] = [
  // [năm, sao nhập trung, cung có Ngũ Hoàng]
  [2024, 3, 7],
  [2025, 2, 2],
  [2026, 1, 9],
];
for (const [nam, sao, cungNguHoang] of MOC_NAM) {
  kiemTra(saoNam(nam) === sao, `Năm ${nam}: sao ${sao} nhập trung`, String(saoNam(nam)));
  const ban = banNam(nam);
  kiemTra(ban[cungNguHoang] === 5, `Năm ${nam}: Ngũ Hoàng tại cung ${cungNguHoang}`, String(ban[cungNguHoang]));
}
kiemTra(saoNam(2024) === 3 && saoNam(2025) === 2, 'Sao năm giảm dần qua các năm');

// ── 12. Cấu trúc bàn ─────────────────────────────────────────────────────

console.log('\n— Cấu trúc bàn —');

const b = lapBanPhiTinh(2026, 180);
kiemTra(b.cung.length === 9, 'Bàn có đủ 9 cung', String(b.cung.length));
kiemTra(
  b.cung.every((c) => [c.van, c.son, c.huongSao].every((s) => s >= 1 && s <= 9)),
  'Mọi cung đều có 3 sao hợp lệ 1–9',
);
kiemTra(
  b.cung.every((c, i) => c.viTri === i),
  'Bàn đã sắp theo vị trí vẽ (Nam trên)',
);
kiemTra(
  new Set(b.cung.map((c) => c.van)).size === 9,
  'Vận tinh dùng đủ 9 sao',
);
kiemTra(
  b.phanTich.moTa.length > 40 && b.phanTich.tieuDe.length > 0,
  'Kết luận có tiêu đề và mô tả',
);
kiemTra(lapBanPhiTinh(1850, 180).ngoaiPhamVi, 'Năm trước 1864 được đánh dấu ngoài phạm vi');
kiemTra(lapBanPhiTinh(2060, 180).ngoaiPhamVi, 'Năm sau 2043 được đánh dấu ngoài phạm vi');
kiemTra(!lapBanPhiTinh(2026, 180).ngoaiPhamVi, 'Năm 2026 nằm trong phạm vi');

if (loi) {
  console.error(`\n${loi} lỗi ở phần phi tinh.`);
  process.exitCode = 1;
} else {
  console.log('\nTất cả kiểm tra phi tinh đều đạt.');
}
