/**
 * Kiểm tra đầu ra sau khi model viết xong.
 *
 * Không nhằm chấm đúng/sai (không có cách nào tự động), mà để bắt các lỗi
 * máy móc: bài quá ngắn, không nhắc tên sao nào trong lá số, dùng từ tuyệt đối.
 * Kết quả được lưu kèm bài đọc để đối chiếu chất lượng giữa các prompt version.
 */

import type { LaSo } from '../chart';
import { tenSaoTrongLaSo } from './chartDigest';
import type { AiMode, PostcheckResult } from './types';

const NGUONG_TU: Record<AiMode, number> = {
  'mot-cau': 120,
  'van-han': 600,
  'toan-bo': 700,
};

const TU_TUYET_DOI =
  /(chắc chắn 100%|100% chắc|đảm bảo tuyệt đối|nhất định sẽ|chắc chắn sẽ|không thể sai)/i;

const CHU_DE_NANG = /(ung thư|chết|tai nạn chết|tù tội|phá sản)/i;

/** Tách dòng "ĐỘ CHẮC" ra khỏi bài, trả về nội dung sạch + mức chắc. */
export function tachDoChac(noiDung: string): {
  content: string;
  confidence: PostcheckResult['confidence'];
} {
  let confidence: PostcheckResult['confidence'] = null;
  const m = noiDung.match(/ĐỘ CHẮC\s*[:：]\s*(cao|vừa|thấp)/i);
  if (m) {
    const tu = m[1].toLowerCase();
    confidence = tu === 'cao' ? 'cao' : tu === 'thấp' ? 'thấp' : 'vừa';
  }

  const content = noiDung
    .replace(/^[ \t]*\[?[ \t]*ĐỘ CHẮC[ \t]*[:：].*$/gim, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { content, confidence };
}

export function postcheck(noiDung: string, laSo: LaSo, mode: AiMode): PostcheckResult {
  const { content, confidence } = tachDoChac(noiDung);
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const tatCaSao = tenSaoTrongLaSo(laSo);
  const chuThuong = content.toLowerCase();
  const starHits = tatCaSao.filter((s) => chuThuong.includes(s.toLowerCase()));

  const issues: string[] = [];

  if (wordCount < NGUONG_TU[mode]) {
    issues.push(`Bài hơi ngắn: ${wordCount} từ (ngưỡng ${NGUONG_TU[mode]}).`);
  }
  if (starHits.length === 0) {
    issues.push('Không nhắc tên sao nào có trong lá số — cần kiểm tra lại căn cứ.');
  }
  if (TU_TUYET_DOI.test(content)) {
    issues.push('Dùng từ tuyệt đối (chắc chắn / đảm bảo) — nên đọc lại chỗ đó.');
  }
  if (CHU_DE_NANG.test(content) && mode === 'mot-cau') {
    issues.push('Bài nhắc tới chủ đề nặng (bệnh, chết, tù, phá sản) — chỉ nên đọc như cảnh báo tham khảo.');
  }

  return {
    ok: issues.length === 0,
    wordCount,
    starHits: starHits.slice(0, 20),
    issues,
    confidence,
  };
}
