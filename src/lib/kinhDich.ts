/**
 * Kinh Dịch — 64 quẻ và phép gieo quẻ tam tiền.
 *
 * Cách gieo: mỗi lần tung 3 đồng xu, mặt ngửa (dương) tính 3, mặt sấp (âm)
 * tính 2. Tổng 6/7/8/9 ứng với lão âm, thiếu dương, thiếu âm, lão dương.
 * Gieo 6 lần từ dưới lên để được 6 hào; hào 6 và 9 là hào động, biến thành
 * quẻ đối (quẻ biến).
 */

export type TenQuai = 'Càn' | 'Đoài' | 'Ly' | 'Chấn' | 'Tốn' | 'Khảm' | 'Cấn' | 'Khôn';

/** Mã nhị phân 3 hào, đọc từ dưới lên, 1 = dương. */
export const NHI_PHAN_QUAI: Record<TenQuai, string> = {
  Càn: '111',
  Đoài: '110',
  Ly: '101',
  Chấn: '100',
  Tốn: '011',
  Khảm: '010',
  Cấn: '001',
  Khôn: '000',
};

export const HAN_QUAI: Record<TenQuai, string> = {
  Càn: '☰',
  Đoài: '☱',
  Ly: '☲',
  Chấn: '☳',
  Tốn: '☴',
  Khảm: '☵',
  Cấn: '☶',
  Khôn: '☷',
};

export const NGHIA_QUAI: Record<TenQuai, string> = {
  Càn: 'Trời',
  Đoài: 'Đầm',
  Ly: 'Lửa',
  Chấn: 'Sấm',
  Tốn: 'Gió',
  Khảm: 'Nước',
  Cấn: 'Núi',
  Khôn: 'Đất',
};

export type MucCat = 'cat' | 'hung' | 'binh';

export interface Que {
  so: number;
  ten: string;
  han: string;
  tren: TenQuai;
  duoi: TenQuai;
  cat: MucCat;
  tomTat: string;
}

export const QUE: readonly Que[] = [
  { so: 1, ten: 'Thuần Càn', han: '乾', tren: 'Càn', duoi: 'Càn', cat: 'cat', tomTat: 'Trời. Cương kiện, hanh thông; thời vận đang lên, nên tiến nhưng đừng quá mạnh.' },
  { so: 2, ten: 'Thuần Khôn', han: '坤', tren: 'Khôn', duoi: 'Khôn', cat: 'cat', tomTat: 'Đất. Nhu thuận, chịu đựng; nên theo người dẫn dắt, làm nền thì bền.' },
  { so: 3, ten: 'Thủy Lôi Truân', han: '屯', tren: 'Khảm', duoi: 'Chấn', cat: 'hung', tomTat: 'Khó khăn buổi đầu; manh nha nhưng còn rối, cần kiên trì gỡ từng bước.' },
  { so: 4, ten: 'Sơn Thủy Mông', han: '蒙', tren: 'Cấn', duoi: 'Khảm', cat: 'binh', tomTat: 'Non trẻ, mờ mịt; cần người thầy chỉ đường, đừng tự đoán.' },
  { so: 5, ten: 'Thủy Thiên Nhu', han: '需', tren: 'Khảm', duoi: 'Càn', cat: 'binh', tomTat: 'Chờ đợi đúng thời; có hiểm phía trước, nên tích luỹ rồi mới tiến.' },
  { so: 6, ten: 'Thiên Thủy Tụng', han: '訟', tren: 'Càn', duoi: 'Khảm', cat: 'hung', tomTat: 'Tranh chấp; dễ kiện tụng, nên nhượng bộ và dàn xếp sớm.' },
  { so: 7, ten: 'Địa Thủy Sư', han: '師', tren: 'Khôn', duoi: 'Khảm', cat: 'binh', tomTat: 'Xuất quân; cần kỷ luật và người chỉ huy giỏi, đừng manh động.' },
  { so: 8, ten: 'Thủy Địa Tỷ', han: '比', tren: 'Khảm', duoi: 'Khôn', cat: 'cat', tomTat: 'Thân cận, kết giao; hợp tác thì lợi, nhưng phải chọn đúng người.' },
  { so: 9, ten: 'Phong Thiên Tiểu Súc', han: '小畜', tren: 'Tốn', duoi: 'Càn', cat: 'binh', tomTat: 'Tích nhỏ; chưa nên làm lớn, giữ sức và chờ thời.' },
  { so: 10, ten: 'Thiên Trạch Lý', han: '履', tren: 'Càn', duoi: 'Đoài', cat: 'binh', tomTat: 'Bước đi cẩn trọng; giữ lễ thì qua hiểm, liều lĩnh thì gặp nạn.' },
  { so: 11, ten: 'Địa Thiên Thái', han: '泰', tren: 'Khôn', duoi: 'Càn', cat: 'cat', tomTat: 'Thông suốt; trên dưới hoà hợp, vạn sự hanh thông.' },
  { so: 12, ten: 'Thiên Địa Bĩ', han: '否', tren: 'Càn', duoi: 'Khôn', cat: 'hung', tomTat: 'Tắc nghẽn; bế tắc tạm thời, nên giữ mình chờ chuyển.' },
  { so: 13, ten: 'Thiên Hỏa Đồng Nhân', han: '同人', tren: 'Càn', duoi: 'Ly', cat: 'cat', tomTat: 'Đồng lòng; hợp tác công khai thì thành, chia bè thì bại.' },
  { so: 14, ten: 'Hỏa Thiên Đại Hữu', han: '大有', tren: 'Ly', duoi: 'Càn', cat: 'cat', tomTat: 'Của cải lớn; thành quả đến, cần khiêm để giữ.' },
  { so: 15, ten: 'Địa Sơn Khiêm', han: '謙', tren: 'Khôn', duoi: 'Cấn', cat: 'cat', tomTat: 'Khiêm tốn; càng nhún càng được, đây là quẻ tốt lành.' },
  { so: 16, ten: 'Lôi Địa Dự', han: '豫', tren: 'Chấn', duoi: 'Khôn', cat: 'cat', tomTat: 'Vui vẻ, chuẩn bị; có người ủng hộ, nhưng đừng buông lỏng kỷ luật.' },
  { so: 17, ten: 'Trạch Lôi Tùy', han: '隨', tren: 'Đoài', duoi: 'Chấn', cat: 'binh', tomTat: 'Tuỳ thời; theo cái đúng thì thuận, a dua thì lạc.' },
  { so: 18, ten: 'Sơn Phong Cổ', han: '蠱', tren: 'Cấn', duoi: 'Tốn', cat: 'binh', tomTat: 'Sửa cái đã hỏng; phải dọn gốc rễ cũ mới mong yên.' },
  { so: 19, ten: 'Địa Trạch Lâm', han: '臨', tren: 'Khôn', duoi: 'Đoài', cat: 'cat', tomTat: 'Tới gần; thời đang mở, nhưng thịnh không bền, lo trước thì hơn.' },
  { so: 20, ten: 'Phong Địa Quán', han: '觀', tren: 'Tốn', duoi: 'Khôn', cat: 'binh', tomTat: 'Quan sát; nhìn cho rõ rồi hãy làm, đừng vội phán xét.' },
  { so: 21, ten: 'Hỏa Lôi Phệ Hạp', han: '噬嗑', tren: 'Ly', duoi: 'Chấn', cat: 'binh', tomTat: 'Cắn đứt vật cản; phải xử lý dứt điểm chỗ vướng, làm rõ đúng sai.' },
  { so: 22, ten: 'Sơn Hỏa Bí', han: '賁', tren: 'Cấn', duoi: 'Ly', cat: 'binh', tomTat: 'Trang sức; bề ngoài đẹp mà gốc chưa chắc, đừng lo hình thức.' },
  { so: 23, ten: 'Sơn Địa Bác', han: '剝', tren: 'Cấn', duoi: 'Khôn', cat: 'hung', tomTat: 'Bóc lột, suy tàn; nên thu mình, không nên khởi sự lớn.' },
  { so: 24, ten: 'Địa Lôi Phục', han: '復', tren: 'Khôn', duoi: 'Chấn', cat: 'cat', tomTat: 'Trở lại; một dương sinh, vận xoay theo chiều tốt, bắt đầu lại được.' },
  { so: 25, ten: 'Thiên Lôi Vô Vọng', han: '無妄', tren: 'Càn', duoi: 'Chấn', cat: 'binh', tomTat: 'Không càn bậy; làm đúng lẽ tự nhiên thì lợi, toan tính vặt thì hại.' },
  { so: 26, ten: 'Sơn Thiên Đại Súc', han: '大畜', tren: 'Cấn', duoi: 'Càn', cat: 'cat', tomTat: 'Tích lớn; nuôi sức để làm việc lớn, thời cơ đang đến.' },
  { so: 27, ten: 'Sơn Lôi Di', han: '頤', tren: 'Cấn', duoi: 'Chấn', cat: 'binh', tomTat: 'Nuôi dưỡng; chú ý ăn uống, lời nói và việc nuôi người.' },
  { so: 28, ten: 'Trạch Phong Đại Quá', han: '大過', tren: 'Đoài', duoi: 'Tốn', cat: 'hung', tomTat: 'Gánh nặng quá sức; việc đã quá tay, cần chống đỡ khéo léo.' },
  { so: 29, ten: 'Thuần Khảm', han: '坎', tren: 'Khảm', duoi: 'Khảm', cat: 'hung', tomTat: 'Hiểm trùng điệp; phải giữ lòng tin và đi từng bước, đừng liều.' },
  { so: 30, ten: 'Thuần Ly', han: '離', tren: 'Ly', duoi: 'Ly', cat: 'cat', tomTat: 'Lửa sáng; sáng sủa nhưng phải bám vào cái đúng, đừng cháy quá đà.' },
  { so: 31, ten: 'Trạch Sơn Hàm', han: '咸', tren: 'Đoài', duoi: 'Cấn', cat: 'cat', tomTat: 'Cảm ứng; tình cảm, duyên phận thuận, nên chân thành.' },
  { so: 32, ten: 'Lôi Phong Hằng', han: '恆', tren: 'Chấn', duoi: 'Tốn', cat: 'cat', tomTat: 'Bền lâu; giữ nếp cũ thì lợi, thay đổi vô cớ thì hại.' },
  { so: 33, ten: 'Thiên Sơn Độn', han: '遯', tren: 'Càn', duoi: 'Cấn', cat: 'binh', tomTat: 'Ẩn lui; lùi đúng lúc để bảo toàn, không phải hèn.' },
  { so: 34, ten: 'Lôi Thiên Đại Tráng', han: '大壯', tren: 'Chấn', duoi: 'Càn', cat: 'cat', tomTat: 'Sức mạnh lớn; có thế nhưng đừng lạm dụng, mạnh quá dễ gãy.' },
  { so: 35, ten: 'Hỏa Địa Tấn', han: '晉', tren: 'Ly', duoi: 'Khôn', cat: 'cat', tomTat: 'Tiến lên; được đề bạt, sáng sủa, thuận về công danh.' },
  { so: 36, ten: 'Địa Hỏa Minh Di', han: '明夷', tren: 'Khôn', duoi: 'Ly', cat: 'hung', tomTat: 'Ánh sáng bị che; phải giấu tài chờ thời, đừng phô trương.' },
  { so: 37, ten: 'Phong Hỏa Gia Nhân', han: '家人', tren: 'Tốn', duoi: 'Ly', cat: 'cat', tomTat: 'Việc nhà; giữ lễ trong nhà thì yên, lỏng lẻo thì loạn.' },
  { so: 38, ten: 'Hỏa Trạch Khuê', han: '睽', tren: 'Ly', duoi: 'Đoài', cat: 'hung', tomTat: 'Chia rẽ; bất đồng ý, nên tìm điểm chung nhỏ trước.' },
  { so: 39, ten: 'Thủy Sơn Kiển', han: '蹇', tren: 'Khảm', duoi: 'Cấn', cat: 'hung', tomTat: 'Trước hiểm sau núi; khó tiến, nên quay lại tìm người giúp.' },
  { so: 40, ten: 'Lôi Thủy Giải', han: '解', tren: 'Chấn', duoi: 'Khảm', cat: 'cat', tomTat: 'Cởi mở; giải toả được ách tắc, nên sớm xử lý dứt điểm.' },
  { so: 41, ten: 'Sơn Trạch Tổn', han: '損', tren: 'Cấn', duoi: 'Đoài', cat: 'binh', tomTat: 'Bớt đi; giảm mình để thêm cho gốc, hao trước lợi sau.' },
  { so: 42, ten: 'Phong Lôi Ích', han: '益', tren: 'Tốn', duoi: 'Chấn', cat: 'cat', tomTat: 'Thêm lên; lợi cho việc mở rộng, nên chia sẻ lợi ích.' },
  { so: 43, ten: 'Trạch Thiên Quải', han: '夬', tren: 'Đoài', duoi: 'Càn', cat: 'binh', tomTat: 'Quyết dứt; phải dứt khoát nhưng công khai, tránh thù oán.' },
  { so: 44, ten: 'Thiên Phong Cấu', han: '姤', tren: 'Càn', duoi: 'Tốn', cat: 'binh', tomTat: 'Gặp gỡ bất ngờ; có duyên lạ, nhưng cảnh giác cái mới quá nhanh.' },
  { so: 45, ten: 'Trạch Địa Tụy', han: '萃', tren: 'Đoài', duoi: 'Khôn', cat: 'cat', tomTat: 'Tụ họp; đông người thì cần người đứng đầu, tránh hỗn loạn.' },
  { so: 46, ten: 'Địa Phong Thăng', han: '升', tren: 'Khôn', duoi: 'Tốn', cat: 'cat', tomTat: 'Đi lên từng bậc; tiến chậm mà chắc, cần cố gắng đều.' },
  { so: 47, ten: 'Trạch Thủy Khốn', han: '困', tren: 'Đoài', duoi: 'Khảm', cat: 'hung', tomTat: 'Khốn cùng; thiếu thốn, cần giữ chí và lời ăn tiếng nói.' },
  { so: 48, ten: 'Thủy Phong Tỉnh', han: '井', tren: 'Khảm', duoi: 'Tốn', cat: 'binh', tomTat: 'Giếng; nguồn lâu bền, lo cho cái chung thì có phúc.' },
  { so: 49, ten: 'Trạch Hỏa Cách', han: '革', tren: 'Đoài', duoi: 'Ly', cat: 'cat', tomTat: 'Thay đổi; cải cách đúng lúc thì tốt, nhưng phải được lòng người.' },
  { so: 50, ten: 'Hỏa Phong Đỉnh', han: '鼎', tren: 'Ly', duoi: 'Tốn', cat: 'cat', tomTat: 'Cái vạc; đổi mới, nâng đỡ người hiền, thành quả lớn.' },
  { so: 51, ten: 'Thuần Chấn', han: '震', tren: 'Chấn', duoi: 'Chấn', cat: 'binh', tomTat: 'Sấm động; biến cố làm giật mình nhưng vô hại nếu giữ bình tĩnh.' },
  { so: 52, ten: 'Thuần Cấn', han: '艮', tren: 'Cấn', duoi: 'Cấn', cat: 'binh', tomTat: 'Dừng lại; dừng đúng chỗ thì yên, cố tiến thì lỗi.' },
  { so: 53, ten: 'Phong Sơn Tiệm', han: '漸', tren: 'Tốn', duoi: 'Cấn', cat: 'cat', tomTat: 'Tiến dần; như cây lớn, chậm mà vững, đừng nóng.' },
  { so: 54, ten: 'Lôi Trạch Quy Muội', han: '歸妹', tren: 'Chấn', duoi: 'Đoài', cat: 'hung', tomTat: 'Gả muộn; tình thế lệch, làm việc lớn dễ hỏng, nên giữ phận.' },
  { so: 55, ten: 'Lôi Hỏa Phong', han: '豐', tren: 'Chấn', duoi: 'Ly', cat: 'cat', tomTat: 'Đầy đặn; thịnh cực, hãy lo lúc còn thịnh, đừng kiêu.' },
  { so: 56, ten: 'Hỏa Sơn Lữ', han: '旅', tren: 'Ly', duoi: 'Cấn', cat: 'binh', tomTat: 'Lữ khách; đi xa, thân cô, giữ lễ và khiêm thì an.' },
  { so: 57, ten: 'Thuần Tốn', han: '巽', tren: 'Tốn', duoi: 'Tốn', cat: 'binh', tomTat: 'Gió len; mềm mỏng, thấm dần, nên dùng lời lẽ khéo.' },
  { so: 58, ten: 'Thuần Đoài', han: '兌', tren: 'Đoài', duoi: 'Đoài', cat: 'cat', tomTat: 'Vui vẻ; giao tiếp thuận, nhưng vui quá dễ mất kiểm soát.' },
  { so: 59, ten: 'Phong Thủy Hoán', han: '渙', tren: 'Tốn', duoi: 'Khảm', cat: 'hung', tomTat: 'Tan ra; ly tán, cần gom lại và giữ lòng trung.' },
  { so: 60, ten: 'Thủy Trạch Tiết', han: '節', tren: 'Khảm', duoi: 'Đoài', cat: 'binh', tomTat: 'Tiết chế; giữ mức độ thì bền, keo kiệt quá thì khổ.' },
  { so: 61, ten: 'Phong Trạch Trung Phu', han: '中孚', tren: 'Tốn', duoi: 'Đoài', cat: 'cat', tomTat: 'Lòng thành; chân thật thì cảm được người, dối trá thì bại.' },
  { so: 62, ten: 'Lôi Sơn Tiểu Quá', han: '小過', tren: 'Chấn', duoi: 'Cấn', cat: 'binh', tomTat: 'Vượt nhỏ; chỉ nên làm việc nhỏ, việc lớn phải chờ.' },
  { so: 63, ten: 'Thủy Hỏa Ký Tế', han: '既濟', tren: 'Khảm', duoi: 'Ly', cat: 'cat', tomTat: 'Đã xong; thành công nhưng phải giữ, chủ quan dễ sinh biến.' },
  { so: 64, ten: 'Hỏa Thủy Vị Tế', han: '未濟', tren: 'Ly', duoi: 'Khảm', cat: 'binh', tomTat: 'Chưa xong; còn dở dang, cẩn thận bước cuối.' },
];

/** Khoá 6 hào (dưới → trên) → quẻ */
const THEO_HOA: Record<string, Que> = Object.fromEntries(
  QUE.map((q) => [NHI_PHAN_QUAI[q.duoi] + NHI_PHAN_QUAI[q.tren], q]),
);

export function queTheoHao(hao: readonly number[]): Que | null {
  if (hao.length !== 6) return null;
  if (hao.some((h) => h !== 6 && h !== 7 && h !== 8 && h !== 9)) return null;
  const key = hao.map((h) => (h === 7 || h === 9 ? '1' : '0')).join('');
  return THEO_HOA[key] ?? null;
}

export interface HaoGieo {
  /** 6, 7, 8 hoặc 9 */
  giaTri: number;
  duong: boolean;
  dong: boolean;
}

export interface KetQuaGieo {
  hao: HaoGieo[];
  chu: Que;
  bien: Que | null;
  /** Vị trí hào động, 1 = sơ hào */
  viTriDong: number[];
}

/**
 * Dựng lại kết quả gieo từ 6 giá trị hào (6/7/8/9).
 *
 * Dùng khi mở lại một lần gieo đã lưu: chỉ cần giữ 6 con số là đủ dựng lại
 * quẻ chủ, quẻ biến và vị trí hào động, không phải lưu cả object.
 */
export function dungQueTuHao(giaTri: readonly number[]): KetQuaGieo {
  if (giaTri.length !== 6) throw new Error('Cần đúng 6 hào để dựng quẻ');
  if (giaTri.some((g) => ![6, 7, 8, 9].includes(g))) throw new Error('Giá trị hào phải là 6, 7, 8 hoặc 9');

  const hao: HaoGieo[] = giaTri.map((g) => ({
    giaTri: g,
    duong: g === 7 || g === 9,
    dong: g === 6 || g === 9,
  }));

  const chu = queTheoHao(giaTri);
  if (!chu) throw new Error('Không dựng được quẻ từ 6 hào');

  const bienHao = hao.map((h) => (h.dong ? (h.duong ? 8 : 7) : h.giaTri));
  const bien = hao.some((h) => h.dong) ? queTheoHao(bienHao) : null;

  return {
    hao,
    chu,
    bien,
    viTriDong: hao.map((h, i) => (h.dong ? i + 1 : 0)).filter(Boolean),
  };
}

export function gieoQue(rng: () => number = Math.random): KetQuaGieo {
  const giaTri: number[] = [];
  for (let i = 0; i < 6; i += 1) {
    let tong = 0;
    for (let j = 0; j < 3; j += 1) tong += rng() < 0.5 ? 2 : 3;
    giaTri.push(tong);
  }
  return dungQueTuHao(giaTri);
}

export const TEN_HAO = ['Sơ', 'Nhị', 'Tam', 'Tứ', 'Ngũ', 'Thượng'];

export const NGHIA_HOA_DONG = [
  'Sơ hào: việc còn ở giai đoạn đầu, nên thận trọng.',
  'Nhị hào: việc đang ở nội bộ, nên lo bên trong trước.',
  'Tam hào: dễ gặp trở ngại ở bước chuyển, cần bình tĩnh.',
  'Tứ hào: việc đã ra ngoài, nên xem lại quan hệ và cách phối hợp.',
  'Ngũ hào: vị trí chủ đạo, kết quả tuỳ cách dùng quyền.',
  'Thượng hào: việc đã tới cuối, nên biết dừng đúng lúc.',
];
