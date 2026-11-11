/**
 * Kiểu dữ liệu cho lớp "hỏi AI" (BYOK - bring your own key).
 *
 * Toàn bộ nội dung chạy trong trình duyệt: key do người dùng dán vào, chỉ gửi
 * thẳng tới nhà cung cấp model, không đi qua máy chủ nào của dự án.
 */

export type AiProviderId = 'gemini' | 'openrouter';

export type AiMode = 'mot-cau' | 'van-han' | 'toan-bo';

export interface AiSettings {
  provider: AiProviderId;
  apiKey: string;
  model: string;
}

export type MaVanDe =
  | 'thieu-cau-hoi'
  | 'cau-hoi-dai'
  | 'nam-khac'
  | 'tuoi-ngoai-pham-vi'
  | 'chu-the-khac'
  | 'gio-da-chinh'
  | 'an-toan-y-te'
  | 'an-toan-phap-ly'
  | 'an-toan-dau-tu';

export interface PrecheckIssue {
  code: MaVanDe;
  level: 'error' | 'warn' | 'info';
  message: string;
  goiY?: string;
}

export interface PostcheckResult {
  ok: boolean;
  wordCount: number;
  /** Tên các sao trong lá số được câu trả lời nhắc tới */
  starHits: string[];
  issues: string[];
  confidence: 'cao' | 'vừa' | 'thấp' | null;
}

export interface AiReading {
  id: string;
  chartId: string;
  mode: AiMode;
  question: string;
  content: string;
  provider: AiProviderId;
  model: string;
  promptVersion: string;
  namXem: number;
  createdAt: number;
  latencyMs: number;
  wordCount: number;
  charCount: number;
  estTokens: number;
  estCostUsd: number;
  postcheck: PostcheckResult;
}

export interface AiContext {
  laSo: import('../chart').LaSo;
  namXem: number;
  mode: AiMode;
  question: string;
}
