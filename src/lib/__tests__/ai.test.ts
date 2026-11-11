/**
 * Test cho lớp AI: dựng prompt, kiểm tra đầu vào, kiểm tra đầu ra.
 *
 * Không gọi mạng — chỉ kiểm tra các hàm thuần. Nhờ vậy test chạy được trong CI
 * mà không cần API key.
 *
 * Chạy bằng `npx tsx src/lib/__tests__/ai.test.ts`.
 */

import { lapLaSo } from '../chart';
import { tenSaoTrongLaSo, tomTatLaSo } from '../ai/chartDigest';
import { PHIEN_BAN_PROMPT, heThongPrompt, nguoiDungPrompt } from '../ai/prompt';
import { precheck } from '../ai/precheck';
import { postcheck, tachDoChac } from '../ai/postcheck';

let loi = 0;

function kiemTra(dieuKien: boolean, moTa: string, chiTiet?: string) {
  if (dieuKien) {
    console.log(`✓ ${moTa}`);
  } else {
    loi++;
    console.error(`✗ ${moTa}${chiTiet ? ` — ${chiTiet}` : ''}`);
  }
}

const laSo = lapLaSo({
  ten: 'Mẫu',
  gioiTinh: 'Nam',
  lich: 'duong',
  ngay: '1990-05-15',
  gio: 6,
  thangNhuan: false,
  kinhDo: null,
  dungGioThat: false,
});

const NAM = 2026;

// ── 1. Bản mô tả lá số ───────────────────────────────────────────────────

console.log('— Bản mô tả lá số —');
const moTa = tomTatLaSo(laSo, NAM);
kiemTra(moTa.includes('MƯỜI HAI CUNG'), 'Có tiêu đề 12 cung');
kiemTra(moTa.includes('Mệnh'), 'Có nhắc cung Mệnh');
kiemTra(/chính tinh/i.test(moTa), 'Có nhãn chính tinh');
kiemTra(moTa.includes(String(NAM)), 'Có năm xem vận hạn');
kiemTra(moTa.split('\n').length >= 20, 'Mô tả đủ dài để làm căn cứ', String(moTa.split('\n').length));

const dsSao = tenSaoTrongLaSo(laSo);
kiemTra(dsSao.length > 10, 'Trích được danh sách sao', String(dsSao.length));
kiemTra(new Set(dsSao).size === dsSao.length, 'Danh sách sao không trùng');

// ── 2. Prompt ────────────────────────────────────────────────────────────

console.log('\n— Prompt —');
kiemTra(/^v\d+\.\d+\.\d+$/.test(PHIEN_BAN_PROMPT), 'Có phiên bản prompt', PHIEN_BAN_PROMPT);
const heThong = heThongPrompt('mot-cau');
kiemTra(heThong.includes('ĐỘ CHẮC'), 'Prompt hệ thống yêu cầu dòng độ chắc');
kiemTra(heThong.includes('Không bịa thêm sao'), 'Prompt hệ thống cấm bịa sao');
kiemTra(heThongPrompt('van-han').includes('## Con người'), 'Chế độ vận hạn có 12 mục');

const nguoi = nguoiDungPrompt({
  laSo,
  namXem: NAM,
  mode: 'mot-cau',
  question: 'Năm 2026 tôi có nên đổi việc không?',
});
kiemTra(nguoi.includes('DỮ LIỆU LÁ SỐ'), 'Prompt người dùng có dữ liệu lá số');
kiemTra(nguoi.includes('có nên đổi việc'), 'Prompt người dùng giữ nguyên câu hỏi');

// ── 3. Precheck ──────────────────────────────────────────────────────────

console.log('\n— Precheck —');
const ngan = precheck({ laSo, namXem: NAM, mode: 'mot-cau', question: 'Việc?' });
kiemTra(ngan.some((v) => v.code === 'thieu-cau-hoi' && v.level === 'error'), 'Chặn câu hỏi quá ngắn');

const dai = precheck({ laSo, namXem: NAM, mode: 'mot-cau', question: 'a'.repeat(700) });
kiemTra(dai.some((v) => v.code === 'cau-hoi-dai'), 'Chặn câu hỏi quá dài');

const lechNam = precheck({
  laSo,
  namXem: NAM,
  mode: 'mot-cau',
  question: 'Năm 2027 tôi có nên mua nhà không?',
});
kiemTra(lechNam.some((v) => v.code === 'nam-khac'), 'Cảnh báo lệch năm xem');

const hoiNguoiKhac = precheck({
  laSo,
  namXem: NAM,
  mode: 'mot-cau',
  question: 'Xem lá số của vợ tôi năm nay thế nào?',
});
kiemTra(hoiNguoiKhac.some((v) => v.code === 'chu-the-khac'), 'Cảnh báo hỏi lá số người khác');

const yTe = precheck({
  laSo,
  namXem: NAM,
  mode: 'mot-cau',
  question: 'Năm nay tôi có nguy cơ ung thư không?',
});
kiemTra(yTe.some((v) => v.code === 'an-toan-y-te'), 'Gắn cờ an toàn y tế');

const hopLe = precheck({
  laSo,
  namXem: NAM,
  mode: 'van-han',
  question: '',
});
kiemTra(hopLe.every((v) => v.level !== 'error'), 'Chế độ vận hạn cho phép để trống câu hỏi');

// ── 4. Postcheck ─────────────────────────────────────────────────────────

console.log('\n— Postcheck —');
const tach = tachDoChac('Nội dung bài viết.\n[ĐỘ CHẮC: vừa]');
kiemTra(tach.confidence === 'vừa', 'Đọc đúng độ chắc', String(tach.confidence));
kiemTra(!tach.content.includes('ĐỘ CHẮC'), 'Bỏ dòng độ chắc khỏi nội dung');

const sao = tenSaoTrongLaSo(laSo).slice(0, 3);
const baiDu = `## Trả lời thẳng\n${Array.from({ length: 130 }, () => 'chữ').join(' ')} ${sao.join(' ')}`;
const kqDu = postcheck(baiDu, laSo, 'mot-cau');
kiemTra(kqDu.ok, 'Bài đủ dài + có tên sao thì đạt', kqDu.issues.join(' | '));
kiemTra(kqDu.starHits.length === 3, 'Đếm đúng số sao được nhắc', String(kqDu.starHits.length));

const kqNgan = postcheck('Quá ngắn.', laSo, 'mot-cau');
kiemTra(!kqNgan.ok, 'Bài quá ngắn bị đánh dấu');
kiemTra(kqNgan.issues.some((i) => i.includes('ngắn')), 'Nêu lý do bài ngắn');

const kqKhongSao = postcheck(
  Array.from({ length: 130 }, () => 'chữ').join(' '),
  laSo,
  'mot-cau',
);
kiemTra(kqKhongSao.issues.some((i) => i.includes('tên sao')), 'Phát hiện bài không nhắc sao');

const kqTuyetDoi = postcheck(
  `${Array.from({ length: 130 }, () => 'chữ').join(' ')} ${sao.join(' ')} chắc chắn 100% sẽ giàu.`,
  laSo,
  'mot-cau',
);
kiemTra(kqTuyetDoi.issues.some((i) => i.includes('tuyệt đối')), 'Phát hiện từ tuyệt đối');

if (loi) {
  console.error(`\n${loi} lỗi ở lớp AI.`);
  process.exitCode = 1;
} else {
  console.log('\nTất cả kiểm tra lớp AI đều đạt.');
}
