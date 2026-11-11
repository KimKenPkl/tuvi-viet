/**
 * Kiểm tra đầu vào trước khi gọi model.
 *
 * Mục đích: chặn câu hỏi rỗng, phát hiện lệch năm xem, cảnh báo khi người hỏi
 * đang hỏi về lá số của người khác, và gắn cờ an toàn cho các chủ đề nhạy cảm.
 * Mỗi cảnh báo đều kèm cách sửa để người dùng tự chỉnh trước khi tốn token.
 */

import type { LaSo } from '../chart';
import type { AiMode, PrecheckIssue } from './types';

const NAM_TOI_THIEU = 13;
const NAM_TOI_DA = 100;
const CAU_HOI_DAI = 600;
const CAU_HOI_NGAN = 10;

function namSinh(laSo: LaSo): number | null {
  const phan = laSo.duongLich.split('/');
  const nam = Number(phan[2]);
  return Number.isFinite(nam) ? nam : null;
}

export interface PrecheckInput {
  laSo: LaSo;
  namXem: number;
  mode: AiMode;
  question: string;
}

export function precheck({ laSo, namXem, mode, question }: PrecheckInput): PrecheckIssue[] {
  const ds: PrecheckIssue[] = [];
  const q = question.trim();

  if (mode === 'mot-cau' && q.length < CAU_HOI_NGAN) {
    ds.push({
      code: 'thieu-cau-hoi',
      level: 'error',
      message: 'Câu hỏi quá ngắn hoặc để trống.',
      goiY: 'Viết một câu cụ thể, ví dụ: "Năm 2026 tôi có nên đổi việc không?"',
    });
  }

  if (q.length > CAU_HOI_DAI) {
    ds.push({
      code: 'cau-hoi-dai',
      level: 'error',
      message: `Câu hỏi dài ${q.length} ký tự (tối đa ${CAU_HOI_DAI}).`,
      goiY: 'Gộp lại thành một câu hỏi chính, các ý phụ hỏi ở lượt sau.',
    });
  }

  const sinh = namSinh(laSo);
  if (sinh) {
    const tuoi = namXem - sinh;
    if (tuoi < NAM_TOI_THIEU || tuoi > NAM_TOI_DA) {
      ds.push({
        code: 'tuoi-ngoai-pham-vi',
        level: 'warn',
        message: `Tuổi khi xem là ${tuoi} (ngoài khoảng ${NAM_TOI_THIEU}–${NAM_TOI_DA}).`,
        goiY: 'Kiểm tra lại ngày sinh hoặc năm xem vận hạn.',
      });
    }

    const namTrongCau = [...q.matchAll(/\b(1[89]\d{2}|20\d{2}|21\d{2})\b/g)]
      .map((m) => Number(m[1]))
      .filter((n) => n >= sinh && n !== namXem);

    if (namTrongCau.length) {
      const dsNam = [...new Set(namTrongCau)].join(', ');
      ds.push({
        code: 'nam-khac',
        level: 'warn',
        message: `Câu hỏi nhắc năm ${dsNam} nhưng năm xem đang đặt là ${namXem}.`,
        goiY: `Đổi ô "Năm xem" thành ${dsNam} nếu muốn luận đúng năm đó.`,
      });
    }
  }

  if (/(lá số|số)\s+(của|cho)\s+(vợ|chồng|bố|mẹ|cha|con|anh|chị|em|bạn|người yêu|sếp|đồng nghiệp)/i.test(q)) {
    ds.push({
      code: 'chu-the-khac',
      level: 'info',
      message: 'Câu hỏi có vẻ đang hỏi về lá số của người khác.',
      goiY: 'Lá số đang mở là của người nhập ngày sinh. Muốn luận cho người khác, hãy lập lá số riêng của họ.',
    });
  }

  if (laSo.gioDaChinh) {
    ds.push({
      code: 'gio-da-chinh',
      level: 'info',
      message: 'Giờ sinh đã được quy đổi theo giờ thật (true solar time).',
    });
  }

  if (/(ung thư|chẩn đoán|bệnh nặng|phẫu thuật|thuốc men|di căn)/i.test(q)) {
    ds.push({
      code: 'an-toan-y-te',
      level: 'info',
      message: 'Câu hỏi chạm tới sức khoẻ / y tế.',
      goiY: 'Phần luận chỉ nêu xu hướng, không thay thế bác sĩ.',
    });
  }

  if (/(kiện|tòa án|luật sư|án tù|tranh chấp pháp lý)/i.test(q)) {
    ds.push({
      code: 'an-toan-phap-ly',
      level: 'info',
      message: 'Câu hỏi chạm tới pháp lý.',
      goiY: 'Phần luận chỉ nêu xu hướng, không thay thế luật sư.',
    });
  }

  if (/(cổ phiếu|chứng khoán|crypto|bitcoin|đầu tư|vay tiền|lô đề|đánh bạc)/i.test(q)) {
    ds.push({
      code: 'an-toan-dau-tu',
      level: 'info',
      message: 'Câu hỏi chạm tới đầu tư / tiền bạc rủi ro.',
      goiY: 'Không có lá số nào đảm bảo lãi. Chỉ nên đọc như xu hướng tham khảo.',
    });
  }

  return ds;
}

/** Cờ an toàn để nhét thêm vào prompt. */
export function coAnToan(ds: PrecheckIssue[]): string[] {
  return ds.filter((d) => d.code.startsWith('an-toan')).map((d) => d.message);
}
