/**
 * Test cho lõi độ từ thiên WMM2025.
 *
 * Bảng dưới đây chép nguyên từ `WMM2025_TestValues.txt` trong gói
 * WMM2025COF.zip của NCEI (https://www.ncei.noaa.gov/products/world-magnetic-model):
 *
 *   năm thập phân · độ cao (km) · vĩ độ · kinh độ · D · I · H · X · Y · Z · F
 *
 * Đây là bộ giá trị chuẩn dùng để nghiệm thu bản cài đặt mô hình, nên nếu lõi
 * tính đúng thì phải khớp tới sai số làm tròn. Mười hai điểm trải đủ các vĩ độ
 * (từ −81° tới 89°), đủ các kinh độ và ba mốc thời gian 2025.0 / 2025.5 /
 * 2026.0, tức là có kiểm tra cả phần biến thiên theo thời gian.
 *
 * Chạy: `npx tsx src/lib/__tests__/tuThien.test.ts`
 */

import { HE_SO_WMM, tinhTuThien } from '../tuThien';

let loi = 0;

function kiemTra(dieuKien: boolean, moTa: string, chiTiet?: string) {
  if (dieuKien) {
    console.log(`✓ ${moTa}`);
  } else {
    loi++;
    console.error(`✗ ${moTa}${chiTiet ? ` — ${chiTiet}` : ''}`);
  }
}

// [năm, cao độ km, vĩ độ, kinh độ, D, I, H, X, Y, Z, F]
const MOC: readonly (readonly [number, number, number, number, number, number, number, number, number, number, number])[] = [
  [2025.0, 28, 89, -121, -99.77, 88.47, 1504.298146, -255.388723, -1482.460628, 56194.288771, 56214.419888],
  [2025.0, 48, 80, -96, -29.91, 87.77, 2164.285547, 1875.98228, -1079.269389, 55623.044051, 55665.134163],
  [2025.0, 54, 82, 87, 54.89, 87.68, 2302.427342, 1324.336929, 1883.42862, 56740.772059, 56787.4668],
  [2025.0, 65, 43, 93, 0.5, 64.1, 24300.764692, 24299.852822, 210.517066, 50037.923998, 55626.621348],
  [2025.0, 51, -33, 109, -5.49, -67.5, 21838.046477, 21737.778822, -2090.274098, -52710.00392, 57054.752538],
  [2025.0, 39, -59, -8, -15.75, -58.55, 14918.115796, 14358.095523, -4049.10754, -24389.086374, 28589.818346],
  [2025.0, 3, -50, -103, 27.96, -54.89, 22106.041373, 19526.532799, 10362.99098, -31437.562789, 38431.724126],
  [2025.0, 94, -29, -110, 15.74, -38.25, 24181.990098, 23275.47108, 6559.046509, -19063.605287, 30792.688931],
  [2025.0, 66, 14, 143, -0.19, 12.82, 35003.635649, 35003.441364, -116.624818, 7966.315182, 35898.700342],
  [2025.0, 18, 0, 21, 1.29, -26.06, 29282.246275, 29274.811882, 659.800118, -14316.72254, 32594.761714],
  [2025.5, 6, -36, -137, 20.28, -52.11, 25353.230658, 23781.930678, 8786.698927, -32577.518648, 41280.516301],
  [2025.5, 50, -81, -67, 28.13, -67.61, 18292.84272, 16132.682326, 8623.494405, -44412.283868, 48032.062762],
  [2026.0, 74, -57, 3, -22.51, -58.65, 14362.206593, 13268.119649, -5498.179626, -23576.062921, 27606.226129],
  [2026.0, 46, -24, -122, 14.01, -34.17, 26638.50009, 25846.118652, 6448.863284, -18080.399376, 32194.883578],
];

// ── 1. Bảng hệ số ──────────────────────────────────────────────────────────

console.log('\n- Bảng hệ số -');
kiemTra(HE_SO_WMM.length === 90, 'Có đủ 90 hệ số Gauss (bậc 1–12)', String(HE_SO_WMM.length));

let tongTheoBac = 0;
for (let n = 1; n <= 12; n++) tongTheoBac += n + 1;
kiemTra(tongTheoBac === 90, 'Số cặp (n, m) đúng bằng 90', String(tongTheoBac));

// Không cặp nào trùng, mọi m ≤ n.
const capDaGap = new Set<string>();
let capDung = true;
for (const [n, m] of HE_SO_WMM) {
  if (m > n || n < 1 || n > 12) capDung = false;
  const khoa = `${n}-${m}`;
  if (capDaGap.has(khoa)) capDung = false;
  capDaGap.add(khoa);
}
kiemTra(capDung, 'Mọi cặp (n, m) hợp lệ và không trùng');
kiemTra(capDaGap.size === 90, 'Phủ đủ 90 cặp', String(capDaGap.size));

// Hệ số h của m = 0 phải bằng 0 — kiểm tra nhanh để phát hiện chép lệch cột.
const hLech = HE_SO_WMM.filter(([, m, , h]) => m === 0 && h !== 0);
kiemTra(hLech.length === 0, 'Hệ số h của m = 0 đều bằng 0', String(hLech.length));

// ── 2. Đối chiếu bảng giá trị chuẩn của NCEI ───────────────────────────────

console.log('\n- Đối chiếu bảng chuẩn NCEI -');

let saiSoLonNhat = 0;
let caXauNhat = '';

for (const [nam, caoDo, viDo, kinhDo, D, I, H, X, Y, Z, F] of MOC) {
  const kq = tinhTuThien(nam, viDo, kinhDo, caoDo);
  const lech = [
    Math.abs(kq.doTuThien - D),
    Math.abs(kq.doTuKhuynh - I),
    Math.abs(kq.H - H),
    Math.abs(kq.X - X),
    Math.abs(kq.Y - Y),
    Math.abs(kq.Z - Z),
    Math.abs(kq.F - F),
  ];
  // D và I so theo độ, các thành phần từ trường so theo nT.
  const dat =
    lech[0] < 0.01 && lech[1] < 0.01 && lech.slice(2).every((v) => v < 0.5);
  const muc = Math.max(lech[0] * 100, lech[1] * 100, ...lech.slice(2));
  if (muc > saiSoLonNhat) {
    saiSoLonNhat = muc;
    caXauNhat = `${nam} · ${viDo}° / ${kinhDo}°`;
  }
  kiemTra(
    dat,
    `${nam} · vĩ ${viDo}° kinh ${kinhDo}° · cao ${caoDo} km`,
    dat
      ? undefined
      : `D ${kq.doTuThien.toFixed(2)} (chuẩn ${D}), I ${kq.doTuKhuynh.toFixed(2)} (chuẩn ${I}), H ${kq.H.toFixed(1)} (chuẩn ${H.toFixed(1)}), Z ${kq.Z.toFixed(1)} (chuẩn ${Z.toFixed(1)})`,
  );
}

console.log(`  Sai số lớn nhất quy về nT: ${saiSoLonNhat.toFixed(3)} tại ${caXauNhat}`);

// ── 3. Vài tính chất vật lý phải giữ ───────────────────────────────────────

console.log('\n- Tính chất vật lý -');

const haNoi = tinhTuThien(2026.5, 21.03, 105.85, 0);
kiemTra(
  haNoi.doTuThien < 0 && haNoi.doTuThien > -5,
  'Hà Nội giữa 2026: độ từ thiên âm (lệch tây), trong khoảng −5°…0°',
  String(haNoi.doTuThien.toFixed(2)),
);
kiemTra(haNoi.Z > 0, 'Bắc bán cầu: thành phần thẳng đứng chúc xuống', String(haNoi.Z.toFixed(0)));

const xichDao = tinhTuThien(2026.5, 0, 105.85, 0);
kiemTra(
  Math.abs(xichDao.doTuKhuynh) < 30,
  'Xích đạo: độ từ khuynh nhỏ so với vùng cực',
  String(xichDao.doTuKhuynh.toFixed(1)),
);

const namBanCau = tinhTuThien(2026.5, -35, 150, 0);
kiemTra(namBanCau.Z < 0, 'Nam bán cầu: thành phần thẳng đứng hướng lên', String(namBanCau.Z.toFixed(0)));

// F phải bằng căn của tổng bình phương, không lệch nội bộ.
const noiBo = tinhTuThien(2026.5, 21.03, 105.85, 0);
kiemTra(
  Math.abs(noiBo.F - Math.hypot(noiBo.H, noiBo.Z)) < 1e-6 &&
    Math.abs(noiBo.H - Math.hypot(noiBo.X, noiBo.Y)) < 1e-6,
  'F và H khớp với các thành phần X, Y, Z',
);

// Biến thiên theo thời gian: hai năm cách nhau phải khác, nhưng không nhảy.
const nam2025 = tinhTuThien(2025, 21.03, 105.85, 0);
const nam2030 = tinhTuThien(2030, 21.03, 105.85, 0);
kiemTra(
  Math.abs(nam2030.doTuThien - nam2025.doTuThien) > 0.01 &&
    Math.abs(nam2030.doTuThien - nam2025.doTuThien) < 2,
  'Độ từ thiên trôi chậm theo thời gian (0,01°–2° trong 5 năm)',
  `${nam2025.doTuThien.toFixed(2)} → ${nam2030.doTuThien.toFixed(2)}`,
);

// Kinh độ vòng qua ±180 phải cho cùng kết quả.
const kinhDong = tinhTuThien(2026.5, 10, 179.5, 0);
const kinhTay = tinhTuThien(2026.5, 10, -180.5, 0);
kiemTra(
  Math.abs(kinhDong.doTuThien - kinhTay.doTuThien) < 1e-9,
  'Kinh độ 179,5° và −180,5° cho cùng kết quả',
);

// Ngoài hiệu lực mô hình phải được đánh dấu, không im lặng trả số.
kiemTra(tinhTuThien(2025, 21, 105, 0).ngoaiHieuLuc === false, 'Năm 2025 nằm trong hiệu lực');
kiemTra(tinhTuThien(2031, 21, 105, 0).ngoaiHieuLuc === true, 'Năm 2031 được đánh dấu ngoài hiệu lực');

// ── Tổng kết ───────────────────────────────────────────────────────────────

console.log(`\n${loi === 0 ? '✓ Tất cả kiểm tra đều đạt' : `✗ ${loi} kiểm tra không đạt`}`);
if (loi > 0) process.exit(1);
