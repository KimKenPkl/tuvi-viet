/**
 * Độ từ thiên (magnetic declination) theo mô hình WMM2025.
 *
 * La bàn thường chỉ đo phương của từ trường Trái Đất, lệch với phương bắc địa
 * lý một góc gọi là độ từ thiên. Muốn đổi số đọc trên la bàn ra hướng thật thì
 * phải cộng (hoặc trừ) góc đó. Ở Việt Nam góc này hiện vào khoảng −1° đến −2°
 * (lệch về phía tây), nhưng ở nơi khác có thể tới hàng chục độ.
 *
 * Mô hình dùng ở đây là World Magnetic Model 2025 (WMM2025), bộ hệ số chính
 * thức của NCEI/NOAA, hiệu lực 2025.0–2030.0. Cách tính bám theo mô tả trong
 * tài liệu kỹ thuật của mô hình: khai triển điều hoà cầu tới bậc 12 với hàm
 * Legendre chuẩn hoá Schmidt, cộng thêm phần biến thiên theo thời gian
 * (secular variation) để nội suy giữa hai mốc.
 *
 * Sai số của mô hình so với đo thực địa khoảng 0,5° ở vùng vĩ độ trung bình
 * (độ lệch chuẩn), tệ hơn ở vùng cực và ở nơi có dị thường từ mạnh. Vì vậy kết
 * quả ở đây là số tham khảo để đặt la bàn, không thay cho đo tại chỗ khi công
 * việc đòi hỏi độ chính xác cao.
 *
 * Nguồn hệ số: https://www.ncei.noaa.gov/products/world-magnetic-model
 * (tệp WMM2025COF.zip, bản WMM.COF ngày 13/11/2024).
 */

/** Bán trục lớn WGS84, km. */
const A_WGS84 = 6378.137;
/** Bán trục nhỏ WGS84, km. */
const B_WGS84 = 6356.7523142;
/** Bán kính quy chiếu của mô hình từ trường, km. */
const R_TU = 6371.2;
/** Bậc cao nhất của khai triển. */
const BAC_CAO_NHAT = 12;

const DO = Math.PI / 180;

/**
 * Hệ số Gauss của WMM2025: [bậc n, bậc con m, g, h, dg/năm, dh/năm].
 * Đơn vị nT và nT/năm. Sinh trực tiếp từ WMM.COF, không chép tay.
 */
export const HE_SO_WMM: readonly (readonly [number, number, number, number, number, number])[] = [
  [1, 0, -29351.8, 0.0, 12.0, 0.0],
  [1, 1, -1410.8, 4545.4, 9.7, -21.5],
  [2, 0, -2556.6, 0.0, -11.6, 0.0],
  [2, 1, 2951.1, -3133.6, -5.2, -27.7],
  [2, 2, 1649.3, -815.1, -8.0, -12.1],
  [3, 0, 1361.0, 0.0, -1.3, 0.0],
  [3, 1, -2404.1, -56.6, -4.2, 4.0],
  [3, 2, 1243.8, 237.5, 0.4, -0.3],
  [3, 3, 453.6, -549.5, -15.6, -4.1],
  [4, 0, 895.0, 0.0, -1.6, 0.0],
  [4, 1, 799.5, 278.6, -2.4, -1.1],
  [4, 2, 55.7, -133.9, -6.0, 4.1],
  [4, 3, -281.1, 212.0, 5.6, 1.6],
  [4, 4, 12.1, -375.6, -7.0, -4.4],
  [5, 0, -233.2, 0.0, 0.6, 0.0],
  [5, 1, 368.9, 45.4, 1.4, -0.5],
  [5, 2, 187.2, 220.2, 0.0, 2.2],
  [5, 3, -138.7, -122.9, 0.6, 0.4],
  [5, 4, -142.0, 43.0, 2.2, 1.7],
  [5, 5, 20.9, 106.1, 0.9, 1.9],
  [6, 0, 64.4, 0.0, -0.2, 0.0],
  [6, 1, 63.8, -18.4, -0.4, 0.3],
  [6, 2, 76.9, 16.8, 0.9, -1.6],
  [6, 3, -115.7, 48.8, 1.2, -0.4],
  [6, 4, -40.9, -59.8, -0.9, 0.9],
  [6, 5, 14.9, 10.9, 0.3, 0.7],
  [6, 6, -60.7, 72.7, 0.9, 0.9],
  [7, 0, 79.5, 0.0, -0.0, 0.0],
  [7, 1, -77.0, -48.9, -0.1, 0.6],
  [7, 2, -8.8, -14.4, -0.1, 0.5],
  [7, 3, 59.3, -1.0, 0.5, -0.8],
  [7, 4, 15.8, 23.4, -0.1, 0.0],
  [7, 5, 2.5, -7.4, -0.8, -1.0],
  [7, 6, -11.1, -25.1, -0.8, 0.6],
  [7, 7, 14.2, -2.3, 0.8, -0.2],
  [8, 0, 23.2, 0.0, -0.1, 0.0],
  [8, 1, 10.8, 7.1, 0.2, -0.2],
  [8, 2, -17.5, -12.6, 0.0, 0.5],
  [8, 3, 2.0, 11.4, 0.5, -0.4],
  [8, 4, -21.7, -9.7, -0.1, 0.4],
  [8, 5, 16.9, 12.7, 0.3, -0.5],
  [8, 6, 15.0, 0.7, 0.2, -0.6],
  [8, 7, -16.8, -5.2, -0.0, 0.3],
  [8, 8, 0.9, 3.9, 0.2, 0.2],
  [9, 0, 4.6, 0.0, -0.0, 0.0],
  [9, 1, 7.8, -24.8, -0.1, -0.3],
  [9, 2, 3.0, 12.2, 0.1, 0.3],
  [9, 3, -0.2, 8.3, 0.3, -0.3],
  [9, 4, -2.5, -3.3, -0.3, 0.3],
  [9, 5, -13.1, -5.2, 0.0, 0.2],
  [9, 6, 2.4, 7.2, 0.3, -0.1],
  [9, 7, 8.6, -0.6, -0.1, -0.2],
  [9, 8, -8.7, 0.8, 0.1, 0.4],
  [9, 9, -12.9, 10.0, -0.1, 0.1],
  [10, 0, -1.3, 0.0, 0.1, 0.0],
  [10, 1, -6.4, 3.3, 0.0, 0.0],
  [10, 2, 0.2, 0.0, 0.1, -0.0],
  [10, 3, 2.0, 2.4, 0.1, -0.2],
  [10, 4, -1.0, 5.3, -0.0, 0.1],
  [10, 5, -0.6, -9.1, -0.3, -0.1],
  [10, 6, -0.9, 0.4, 0.0, 0.1],
  [10, 7, 1.5, -4.2, -0.1, 0.0],
  [10, 8, 0.9, -3.8, -0.1, -0.1],
  [10, 9, -2.7, 0.9, -0.0, 0.2],
  [10, 10, -3.9, -9.1, -0.0, -0.0],
  [11, 0, 2.9, 0.0, 0.0, 0.0],
  [11, 1, -1.5, 0.0, -0.0, -0.0],
  [11, 2, -2.5, 2.9, 0.0, 0.1],
  [11, 3, 2.4, -0.6, 0.0, -0.0],
  [11, 4, -0.6, 0.2, 0.0, 0.1],
  [11, 5, -0.1, 0.5, -0.1, -0.0],
  [11, 6, -0.6, -0.3, 0.0, -0.0],
  [11, 7, -0.1, -1.2, -0.0, 0.1],
  [11, 8, 1.1, -1.7, -0.1, -0.0],
  [11, 9, -1.0, -2.9, -0.1, 0.0],
  [11, 10, -0.2, -1.8, -0.1, 0.0],
  [11, 11, 2.6, -2.3, -0.1, 0.0],
  [12, 0, -2.0, 0.0, 0.0, 0.0],
  [12, 1, -0.2, -1.3, 0.0, -0.0],
  [12, 2, 0.3, 0.7, -0.0, 0.0],
  [12, 3, 1.2, 1.0, -0.0, -0.1],
  [12, 4, -1.3, -1.4, -0.0, 0.1],
  [12, 5, 0.6, -0.0, -0.0, -0.0],
  [12, 6, 0.6, 0.6, 0.1, -0.0],
  [12, 7, 0.5, -0.1, -0.0, -0.0],
  [12, 8, -0.1, 0.8, 0.0, 0.0],
  [12, 9, -0.4, 0.1, 0.0, -0.0],
  [12, 10, -0.2, -1.0, -0.1, -0.0],
  [12, 11, -1.3, 0.1, -0.0, 0.0],
  [12, 12, -0.7, 0.2, -0.1, -0.1],
];

export interface KetQuaTuThien {
  /** Độ từ thiên, độ; dương là lệch về phía đông */
  doTuThien: number;
  /** Độ từ khuynh, độ; dương là chúc xuống */
  doTuKhuynh: number;
  /** Thành phần nằm ngang, nT */
  H: number;
  /** Thành phần bắc, nT */
  X: number;
  /** Thành phần đông, nT */
  Y: number;
  /** Thành phần thẳng đứng (dương là hướng xuống), nT */
  Z: number;
  /** Cường độ toàn phần, nT */
  F: number;
  /** Năm thập phân dùng để tính */
  nam: number;
  /** Vĩ độ địa lý, độ */
  viDo: number;
  /** Kinh độ địa lý, độ */
  kinhDo: number;
  /** Độ cao trên elipxoit WGS84, km */
  caoDo: number;
  /** true khi năm nằm ngoài hiệu lực 2025–2030 của mô hình */
  ngoaiHieuLuc: boolean;
}

/** Giai thừa, dùng cho hệ số chuẩn hoá Schmidt (bậc tối đa 12 nên không lo tràn). */
function giaiThua(n: number): number {
  let kq = 1;
  for (let i = 2; i <= n; i++) kq *= i;
  return kq;
}

/** Hệ số chuẩn hoá Schmidt của cặp (n, m). */
function heSoSchmidt(n: number, m: number): number {
  const hai = m === 0 ? 1 : 2;
  return Math.sqrt((hai * giaiThua(n - m)) / giaiThua(n + m));
}

/** Chuyển năm dương lịch (kể cả phần lẻ) thành năm thập phân. */
export function namThapPhan(ngay: Date): number {
  const dauNam = Date.UTC(ngay.getUTCFullYear(), 0, 1);
  const cuoiNam = Date.UTC(ngay.getUTCFullYear() + 1, 0, 1);
  return ngay.getUTCFullYear() + (ngay.getTime() - dauNam) / (cuoiNam - dauNam);
}

/**
 * Độ từ thiên tại một điểm.
 *
 * @param nam Năm thập phân, ví dụ 2026.5
 * @param viDo Vĩ độ địa lý, độ (dương là bắc)
 * @param kinhDo Kinh độ địa lý, độ (dương là đông)
 * @param caoDoKm Độ cao trên mực nước biển / elipxoit, km
 */
export function tinhTuThien(
  nam: number,
  viDo: number,
  kinhDo: number,
  caoDoKm = 0,
): KetQuaTuThien {
  // Hai cực: sin(θ) = 0 làm công thức suy biến, mà hướng bắc ở đúng cực cũng
  // không còn nghĩa. Kẹp lại một chút để không chia cho 0.
  const vi = Math.max(-89.9999, Math.min(89.9999, viDo));
  const kinh = ((kinhDo + 540) % 360) - 180;

  // ── 1. Đổi toạ độ trắc địa sang toạ độ cầu địa tâm ──────────────────────
  const e2 = (A_WGS84 * A_WGS84 - B_WGS84 * B_WGS84) / (A_WGS84 * A_WGS84);
  const phi = vi * DO;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const banKinhN = A_WGS84 / Math.sqrt(1 - e2 * sinPhi * sinPhi);

  const trucX = (banKinhN + caoDoKm) * cosPhi;
  const trucZ = (banKinhN * (1 - e2) + caoDoKm) * sinPhi;
  const r = Math.hypot(trucX, trucZ);
  const phiDiaTam = Math.atan2(trucZ, trucX);
  const theta = Math.PI / 2 - phiDiaTam;
  const sinTheta = Math.max(1e-8, Math.sin(theta));
  const cosTheta = Math.cos(theta);

  // ── 2. Hệ số Gauss tại thời điểm cần tính ───────────────────────────────
  // Mỗi hệ số tiến hoá tuyến tính quanh mốc 2025.0 với tốc độ cho sẵn.
  const dNam = nam - 2025;
  const g: number[][] = Array.from({ length: BAC_CAO_NHAT + 1 }, () => new Array(BAC_CAO_NHAT + 1).fill(0));
  const h: number[][] = Array.from({ length: BAC_CAO_NHAT + 1 }, () => new Array(BAC_CAO_NHAT + 1).fill(0));
  for (const [n, m, g0, h0, dg, dh] of HE_SO_WMM) {
    g[n][m] = g0 + dNam * dg;
    h[n][m] = h0 + dNam * dh;
  }

  // ── 3. Hàm Legendre và đạo hàm theo θ ──────────────────────────────────
  // Tính dạng Ferrers (không chuẩn hoá) rồi nhân hệ số Schmidt. Cách này dễ
  // đối chiếu với định nghĩa hơn là gộp chuẩn hoá vào công thức truy hồi.
  const P: number[][] = Array.from({ length: BAC_CAO_NHAT + 1 }, () => new Array(BAC_CAO_NHAT + 1).fill(0));
  const dP: number[][] = Array.from({ length: BAC_CAO_NHAT + 1 }, () => new Array(BAC_CAO_NHAT + 1).fill(0));

  P[0][0] = 1;
  for (let m = 1; m <= BAC_CAO_NHAT; m++) {
    P[m][m] = (2 * m - 1) * sinTheta * P[m - 1][m - 1];
  }
  for (let m = 0; m <= BAC_CAO_NHAT - 1; m++) {
    P[m + 1][m] = (2 * m + 1) * cosTheta * P[m][m];
  }
  for (let m = 0; m <= BAC_CAO_NHAT; m++) {
    for (let n = m + 2; n <= BAC_CAO_NHAT; n++) {
      P[n][m] =
        ((2 * n - 1) * cosTheta * P[n - 1][m] - (n + m - 1) * P[n - 2][m]) / (n - m);
    }
  }

  // Đạo hàm theo θ: dP/dθ = [n cosθ P(n,m) − (n+m) P(n−1,m)] / sinθ.
  for (let n = 1; n <= BAC_CAO_NHAT; n++) {
    for (let m = 0; m <= n; m++) {
      dP[n][m] = (n * cosTheta * P[n][m] - (n + m) * P[n - 1][m]) / sinTheta;
    }
  }

  // ── 4. Cộng chuỗi điều hoà cầu ─────────────────────────────────────────
  const sinM = new Array(BAC_CAO_NHAT + 1).fill(0);
  const cosM = new Array(BAC_CAO_NHAT + 1).fill(0);
  for (let m = 0; m <= BAC_CAO_NHAT; m++) {
    sinM[m] = Math.sin(m * kinh * DO);
    cosM[m] = Math.cos(m * kinh * DO);
  }

  let Br = 0;
  let Btheta = 0;
  let Bphi = 0;

  for (let n = 1; n <= BAC_CAO_NHAT; n++) {
    const tiLe = Math.pow(R_TU / r, n + 2);
    let tongP = 0;
    let tongdP = 0;
    let tongPhip = 0;
    for (let m = 0; m <= n; m++) {
      const schmidt = heSoSchmidt(n, m);
      const pnm = P[n][m] * schmidt;
      const dpnm = dP[n][m] * schmidt;
      const gCos = g[n][m] * cosM[m] + h[n][m] * sinM[m];
      tongP += gCos * pnm;
      tongdP += gCos * dpnm;
      tongPhip += m * (g[n][m] * sinM[m] - h[n][m] * cosM[m]) * pnm;
    }
    Br += (n + 1) * tiLe * tongP;
    Btheta -= tiLe * tongdP;
    Bphi += tiLe * tongPhip;
  }
  Bphi /= sinTheta;

  // ── 5. Xoay về hệ toạ độ địa lý ────────────────────────────────────────
  // Trục bắc địa lý nghiêng so với phương bán kính một góc ψ = φ′ − φ.
  const psi = phiDiaTam - phi;
  const sinPsi = Math.sin(psi);
  const cosPsi = Math.cos(psi);

  const X = Br * sinPsi - Btheta * cosPsi;
  const Y = Bphi;
  const Z = -Br * cosPsi - Btheta * sinPsi;
  const H = Math.hypot(X, Y);
  const F = Math.hypot(H, Z);

  return {
    doTuThien: Math.atan2(Y, X) / DO,
    doTuKhuynh: Math.atan2(Z, H) / DO,
    H,
    X,
    Y,
    Z,
    F,
    nam,
    viDo: vi,
    kinhDo: kinh,
    caoDo: caoDoKm,
    ngoaiHieuLuc: nam < 2025 || nam > 2030,
  };
}
