/**
 * Test cho bàn thế quái (替卦).
 *
 * Kiểm bốn nhóm việc:
 * 1. Bảng 替卦歌 phủ đúng 24 sơn, không thừa không thiếu, đúng năm nhóm
 *    1 / 2 / 6 / 7 / 9 với số sơn 4 / 5 / 6 / 5 / 4.
 * 2. `sonKiem` nhận đúng sơn kề ở cả hai phía ranh giới, kể cả chỗ vòng qua 0°.
 * 3. `lapBanTheQuai` trả null khi không kiêm, trả bàn đủ 9 cung khi kiêm.
 * 4. Bàn thế quái giữ nguyên bàn vận tinh, và khi thế tinh trùng sao hạ quái
 *    thì hai bàn phải giống nhau hoàn toàn ("tạm không thay").
 *
 * Chạy: `npx tsx src/lib/__tests__/theQuai.test.ts`
 */

import { SON, lapBanPhiTinh, sonTheoDo, viTriTrongSon } from '../phiTinh';
import { NHOM_THE_QUAI, THE_QUAI, lapBanTheQuai, sonKiem, theTinh } from '../theQuai';

let loi = 0;

function kiemTra(dieuKien: boolean, moTa: string, chiTiet?: string) {
  if (dieuKien) {
    console.log(`✓ ${moTa}`);
  } else {
    loi++;
    console.error(`✗ ${moTa}${chiTiet ? ` — ${chiTiet}` : ''}`);
  }
}

// ── 1. Bảng thế tinh ───────────────────────────────────────────────────────

console.log('\n- Bảng 替卦歌 -');

kiemTra(SON.length === 24, 'Có đủ 24 sơn', String(SON.length));

const thieu = SON.filter((s) => THE_QUAI[s.ten] === undefined).map((s) => s.ten);
kiemTra(thieu.length === 0, 'Không sơn nào thiếu thế tinh', thieu.join(', '));

const thua = Object.keys(THE_QUAI).filter((ten) => !SON.some((s) => s.ten === ten));
kiemTra(thua.length === 0, 'Bảng không có sơn lạ ngoài 24 sơn', thua.join(', '));

kiemTra(Object.keys(THE_QUAI).length === 24, 'Bảng có đúng 24 mục', String(Object.keys(THE_QUAI).length));

// Năm nhóm, đúng thứ tự và đúng số sơn.
const SO_SON = [4, 5, 6, 5, 4];
const SAO_NHOM = [1, 2, 6, 7, 9];
kiemTra(NHOM_THE_QUAI.length === 5, 'Có đúng năm nhóm', String(NHOM_THE_QUAI.length));
NHOM_THE_QUAI.forEach((nhom, i) => {
  kiemTra(
    nhom.sao === SAO_NHOM[i] && nhom.son.length === SO_SON[i],
    `Nhóm ${i + 1}: sao ${SAO_NHOM[i]}, ${SO_SON[i]} sơn`,
    `sao ${nhom.sao}, ${nhom.son.length} sơn`,
  );
  const sai = nhom.son.filter((ten) => THE_QUAI[ten] !== nhom.sao);
  kiemTra(sai.length === 0, `Nhóm ${i + 1} khớp bảng tra`, sai.join(', '));
});

// Cộng lại phải đúng 24 và không sơn nào nằm hai nhóm.
const gomNhom = NHOM_THE_QUAI.flatMap((n) => n.son);
kiemTra(gomNhom.length === 24, 'Năm nhóm gom đủ 24 sơn', String(gomNhom.length));
kiemTra(new Set(gomNhom).size === 24, 'Không sơn nào nằm hai nhóm');
kiemTra(
  [...new Set(Object.values(THE_QUAI))].sort((a, b) => a - b).join(',') === '1,2,6,7,9',
  'Chỉ dùng năm sao 1, 2, 6, 7, 9',
  [...new Set(Object.values(THE_QUAI))].sort().join(','),
);

// Vài ca đối chiếu tay theo nguyên văn.
kiemTra(theTinh(sonTheoDo(0)) === 1, 'Tý → 1 (贪狼)', String(theTinh(sonTheoDo(0))));
kiemTra(theTinh(sonTheoDo(120)) === 6, 'Tốn → 6 (武曲)', String(theTinh(sonTheoDo(120))));
kiemTra(theTinh(sonTheoDo(180)) === 9, 'Ngọ → 9 (右弼)', String(theTinh(sonTheoDo(180))));
kiemTra(theTinh(sonTheoDo(270)) === 7, 'Dậu → 7 (破军)', String(theTinh(sonTheoDo(270))));

// ── 2. Sơn kề ──────────────────────────────────────────────────────────────

console.log('\n- Sơn kề và dải kiêm -');

let giuaDung = true;
let dauDung = true;
let cuoiDung = true;
for (let i = 0; i < 24; i++) {
  const son = SON[i];

  const giua = sonKiem(son.batDau + 7.5);
  if (giua.son.ten !== son.ten || giua.kiem !== null || Math.abs(giua.lech - 7.5) > 0.001) {
    giuaDung = false;
  }

  const dau = sonKiem(son.batDau + 1);
  if (dau.son.ten !== son.ten || dau.kiem?.ten !== SON[(i + 23) % 24].ten) dauDung = false;

  const cuoi = sonKiem(son.batDau + 14);
  if (cuoi.son.ten !== son.ten || cuoi.kiem?.ten !== SON[(i + 1) % 24].ten) cuoiDung = false;
}

kiemTra(giuaDung, 'Giữa sơn: không kiêm, cách ranh giới đúng 7,5° — đủ 24 sơn');
kiemTra(dauDung, 'Sát đầu sơn (1°): kiêm về sơn đứng trước — đủ 24 sơn');
kiemTra(cuoiDung, 'Sát cuối sơn (14°): kiêm về sơn đứng sau — đủ 24 sơn');

// Vòng qua 0°: 353° thuộc Tý, kiêm về Nhâm; 7° thuộc Tý, kiêm về Quý.
const vong1 = sonKiem(353);
kiemTra(vong1.son.ten === 'Tý' && vong1.kiem?.ten === 'Nhâm', '353° — Tý kiêm Nhâm',
  `${vong1.son.ten}/${vong1.kiem?.ten}`);
const vong2 = sonKiem(7);
kiemTra(vong2.son.ten === 'Tý' && vong2.kiem?.ten === 'Quý', '7° — Tý kiêm Quý',
  `${vong2.son.ten}/${vong2.kiem?.ten}`);

// Ranh giới kiêm ở đúng 3°: còn kiêm hay không phải nhất quán với kiemHuong.
const dauQuy = SON[1].batDau; // Quý, 7,5°
kiemTra(sonKiem(dauQuy + 3).kiem === null, 'Đúng 3° tính từ đầu sơn thì hết kiêm');
kiemTra(sonKiem(dauQuy + 2.9).kiem !== null, 'Dưới 3° vẫn còn kiêm');
kiemTra(sonKiem(dauQuy + 2.9).kiem?.ten === 'Tý', 'Đầu sơn Quý kiêm về Tý',
  String(sonKiem(dauQuy + 2.9).kiem?.ten));

// Mọi vị trí đều trả về một sơn chứa nó.
let phuDung = true;
for (let goc = 0; goc < 360; goc += 0.5) {
  const k = sonKiem(goc);
  const trong = viTriTrongSon(goc);
  if (k.son.ten !== sonTheoDo(goc).ten) phuDung = false;
  if (trong < 0 || trong >= 15) phuDung = false;
  if (Math.abs(k.lech - Math.min(trong, 15 - trong)) > 1e-9) phuDung = false;
}
kiemTra(phuDung, 'Quét 720 góc: sơn chứa và khoảng cách tới ranh giới đều đúng');

// ── 3. Lập bàn ─────────────────────────────────────────────────────────────

console.log('\n- Lập bàn thế quái -');

kiemTra(lapBanTheQuai(2026, 0) === null, 'Hướng 0° (giữa Tý) không kiêm → không có bàn thế quái');
kiemTra(lapBanTheQuai(2026, 180) === null, 'Hướng 180° (giữa Ngọ) không kiêm → không có bàn');
kiemTra(lapBanTheQuai(2026, 90) === null, 'Hướng 90° (giữa Mão) không kiêm → không có bàn');

const ban = lapBanTheQuai(2026, 6);
kiemTra(ban !== null, 'Hướng 6° (Tý kiêm Quý) có bàn thế quái');
if (!ban) {
  console.error('✗ Không lập được bàn, dừng các kiểm tra sau');
  process.exit(1);
}

kiemTra(ban.kiemHuong === true, 'Bàn đánh dấu là kiêm hướng');
kiemTra(ban.huongSon.ten === 'Tý' && ban.toaSon.ten === 'Ngọ', 'Hướng Tý, toạ Ngọ',
  `${ban.huongSon.ten}/${ban.toaSon.ten}`);
kiemTra(ban.kiemHuongSon?.ten === 'Quý', 'Phía hướng kiêm Quý', String(ban.kiemHuongSon?.ten));
kiemTra(ban.kiemToa?.ten === 'Đinh', 'Phía toạ kiêm Đinh', String(ban.kiemToa?.ten));

kiemTra(ban.cung.length === 9, 'Bàn có đủ 9 cung', String(ban.cung.length));
kiemTra(new Set(ban.cung.map((c) => c.son)).size === 9, 'Sơn tinh dùng đủ 9 sao');
kiemTra(new Set(ban.cung.map((c) => c.huongSao)).size === 9, 'Hướng tinh dùng đủ 9 sao');
kiemTra(new Set(ban.cung.map((c) => c.van)).size === 9, 'Vận tinh dùng đủ 9 sao');

kiemTra(ban.sonThe === 9 && ban.huongThe === 1, 'Toạ Ngọ → 9, hướng Tý → 1',
  `${ban.sonThe}/${ban.huongThe}`);
kiemTra(
  ban.cung.every((c) => Object.values([c.son, c.huongSao]).every((v) => v >= 1 && v <= 9)),
  'Mọi sơn tinh và hướng tinh đều trong khoảng 1–9',
);

// Bàn vận tinh phải trùng bàn hạ quái — thế quái không đổi vận.
const haQuai = lapBanPhiTinh(2026, 6);
const vanKhop = ban.cung.every((c, i) => c.van === haQuai.cung[i].van);
kiemTra(vanKhop, 'Vận tinh giữ nguyên so với bàn hạ quái');

// Thế tinh nhập trung phải có mặt trong bàn của nó.
kiemTra(ban.cung.some((c) => c.son === ban.sonThe), 'Sơn tinh nhập trung có mặt trong bàn sơn');
kiemTra(ban.cung.some((c) => c.huongSao === ban.huongThe), 'Hướng tinh nhập trung có mặt trong bàn hướng');

// Lối đọc thứ hai (lấy thế tinh của sơn kiêm) phải được giữ lại để đối chiếu.
kiemTra(ban.sonTheKiem === 9, 'Sơn kiêm Đinh → 9', String(ban.sonTheKiem));
kiemTra(ban.huongTheKiem === 1, 'Hướng kiêm Quý → 1', String(ban.huongTheKiem));

// ── 4. Ca "tạm không thay" ─────────────────────────────────────────────────

console.log('\n- Ca thế tinh trùng sao hạ quái -');

let caKhongDoi = 0;
let caCoDoi = 0;
let khopKhiKhongDoi = true;
let khacKhiCoDoi = true;

for (let nam = 1864; nam <= 2043; nam += 3) {
  for (let huongDo = 0.5; huongDo < 360; huongDo += 4) {
    const b = lapBanTheQuai(nam, huongDo);
    if (!b) continue;
    const hq = lapBanPhiTinh(nam, huongDo);
    const giongNhau = b.cung.every(
      (c, i) => c.son === hq.cung[i].son && c.huongSao === hq.cung[i].huongSao,
    );
    if (b.khongDoi) {
      caKhongDoi++;
      if (!giongNhau) khopKhiKhongDoi = false;
    } else {
      caCoDoi++;
      if (giongNhau) khacKhiCoDoi = false;
    }
  }
}

kiemTra(caKhongDoi > 0, 'Có ca thế tinh trùng sao hạ quái', String(caKhongDoi));
kiemTra(khopKhiKhongDoi, 'Khi trùng, bàn thế quái giống hệt bàn hạ quái');
kiemTra(caCoDoi > 0, 'Có ca thế tinh khác sao hạ quái', String(caCoDoi));

// ── Tổng kết ───────────────────────────────────────────────────────────────

console.log(`\n${loi === 0 ? '✓ Tất cả kiểm tra đều đạt' : `✗ ${loi} kiểm tra không đạt`}`);
if (loi > 0) process.exit(1);
