/**
 * Khối "Hỏi AI" đặt ngay dưới phần luận giải.
 *
 * Nguyên tắc thiết kế:
 * - Không có key thì chỉ hiện lời mời cấu hình, không gọi mạng.
 * - Câu hỏi được kiểm tra trước (precheck) để khỏi tốn token vô ích.
 * - Bài trả lời chạy dạng stream, lưu lại trên máy và đo chất lượng thô.
 * - Key nằm trong localStorage, gửi thẳng tới nhà cung cấp.
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { cungTheoTen, type LaSo } from '../lib/chart';
import {
  MODEL_GOI_Y,
  TEN_NHA_CUNG_CAP,
  coKey,
  docCaiDat,
  luuCaiDat,
  xoaKey,
} from '../lib/ai/settings';
import { precheck, coAnToan } from '../lib/ai/precheck';
import { postcheck, tachDoChac } from '../lib/ai/postcheck';
import { PHIEN_BAN_PROMPT, heThongPrompt, nguoiDungPrompt } from '../lib/ai/prompt';
import { LoiAi, lietKeModel, streamChat } from '../lib/ai/provider';
import { docBaiDoc, luuBaiDoc, taoId, uocTinhChiPhi, xoaBaiDoc } from '../lib/ai/store';
import type { AiMode, AiProviderId, AiReading, AiSettings, PrecheckIssue } from '../lib/ai/types';
import { docGhiChu, luuGhiChu } from '../lib/storage';

interface Props {
  laSo: LaSo;
  namXem: number;
  chartId: string;
}

const CHE_DO: { key: AiMode; ten: string; moTa: string }[] = [
  { key: 'mot-cau', ten: 'Hỏi một câu', moTa: '350–500 từ' },
  { key: 'van-han', ten: 'Vận hạn năm', moTa: '12 mảng · 1.600–2.200 từ' },
  { key: 'toan-bo', ten: 'Toàn bộ lá số', moTa: '2.000–2.800 từ' },
];

function goiYCauHoi(laSo: LaSo, namXem: number): string[] {
  const menh = cungTheoTen(laSo, 'Mệnh');
  const chinh = menh?.chinhTinh.map((s) => s.ten).slice(0, 2).join(', ');
  return [
    `Năm ${namXem} tôi có nên đổi việc không?`,
    `Tài chính năm ${namXem} của tôi thế nào?`,
    `Tình cảm năm ${namXem} có gì cần lưu ý?`,
    chinh ? `Cung Mệnh có ${chinh}, tôi hợp nghề gì?` : 'Tôi hợp với ngành nghề nào?',
    `Sức khoẻ năm ${namXem} cần chú ý gì?`,
  ];
}

/** In đậm bằng **...** mà không dùng dangerouslySetInnerHTML. */
function noiDong(s: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}

/** Markdown tối giản: tiêu đề, danh sách, đoạn văn, in đậm. */
function Markdown({ text }: { text: string }) {
  const khoi: ReactNode[] = [];
  let ds: string[] = [];
  let khoa = 0;

  const xa = () => {
    if (ds.length) {
      khoi.push(
        <ul key={`u${khoa++}`}>
          {ds.map((item, i) => (
            <li key={i}>{noiDong(item)}</li>
          ))}
        </ul>,
      );
      ds = [];
    }
  };

  for (const raw of text.split('\n')) {
    const dong = raw.trim();
    if (!dong) {
      xa();
      continue;
    }
    if (dong.startsWith('### ')) {
      xa();
      khoi.push(<h5 key={`h${khoa++}`}>{noiDong(dong.slice(4))}</h5>);
    } else if (dong.startsWith('## ')) {
      xa();
      khoi.push(<h4 key={`h${khoa++}`}>{noiDong(dong.slice(3))}</h4>);
    } else if (dong.startsWith('# ')) {
      xa();
      khoi.push(<h4 key={`h${khoa++}`}>{noiDong(dong.slice(2))}</h4>);
    } else if (/^[-*•]\s+/.test(dong)) {
      ds.push(dong.replace(/^[-*•]\s+/, ''));
    } else if (/^\d+[.)]\s+/.test(dong)) {
      ds.push(dong.replace(/^\d+[.)]\s+/, ''));
    } else if (dong === '---') {
      xa();
    } else {
      xa();
      khoi.push(<p key={`p${khoa++}`}>{noiDong(dong)}</p>);
    }
  }
  xa();

  return <div className="md">{khoi}</div>;
}

function CauHinh({
  caiDat,
  onLuu,
  onDong,
}: {
  caiDat: AiSettings;
  onLuu: (s: AiSettings) => void;
  onDong: () => void;
}) {
  const [tam, setTam] = useState<AiSettings>(caiDat);
  const [dsModel, setDsModel] = useState<string[]>(MODEL_GOI_Y[caiDat.provider]);
  const [hienKey, setHienKey] = useState(false);
  const [dangKiemTra, setDangKiemTra] = useState(false);
  const [thongBao, setThongBao] = useState('');
  const [loi, setLoi] = useState('');

  useEffect(() => {
    setDsModel(MODEL_GOI_Y[tam.provider]);
  }, [tam.provider]);

  function doiNha(p: AiProviderId) {
    setTam((t) => ({ ...t, provider: p, model: MODEL_GOI_Y[p][0] }));
    setThongBao('');
    setLoi('');
  }

  async function kiemTra() {
    setDangKiemTra(true);
    setThongBao('');
    setLoi('');
    try {
      const ds = await lietKeModel(tam);
      if (ds.length) setDsModel(ds);
      setThongBao(`✓ Kết nối được · ${ds.length} model khả dụng.`);
    } catch (e) {
      setLoi(e instanceof LoiAi ? e.message : String((e as Error)?.message ?? e));
    } finally {
      setDangKiemTra(false);
    }
  }

  function luu() {
    const s: AiSettings = {
      provider: tam.provider,
      apiKey: tam.apiKey.trim(),
      model: tam.model.trim() || MODEL_GOI_Y[tam.provider][0],
    };
    luuCaiDat(s);
    onLuu(s);
    onDong();
  }

  return (
    <div className="ai-config">
      <div className="field">
        <span className="label">Nhà cung cấp</span>
        <div className="seg">
          {(['gemini', 'openrouter'] as const).map((p) => (
            <button
              type="button"
              key={p}
              className={tam.provider === p ? 'on' : ''}
              onClick={() => doiNha(p)}
            >
              {TEN_NHA_CUNG_CAP[p]}
            </button>
          ))}
        </div>
      </div>

      <label className="field">
        <span className="label">
          API key <em>(lưu trên máy này)</em>
        </span>
        <input
          type={hienKey ? 'text' : 'password'}
          value={tam.apiKey}
          onChange={(e) => setTam((t) => ({ ...t, apiKey: e.target.value }))}
          placeholder={tam.provider === 'gemini' ? 'AIza...' : 'sk-or-v1-...'}
          autoComplete="off"
          spellCheck={false}
        />
      </label>

      <label className="check">
        <input type="checkbox" checked={hienKey} onChange={(e) => setHienKey(e.target.checked)} />
        <span>Hiện key</span>
      </label>

      <label className="field">
        <span className="label">Model</span>
        <input
          type="text"
          value={tam.model}
          onChange={(e) => setTam((t) => ({ ...t, model: e.target.value }))}
          list="tuvi-ai-model"
          spellCheck={false}
        />
        <datalist id="tuvi-ai-model">
          {dsModel.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </label>

      <div className="ai-actions">
        <button type="button" className="btn-ghost" onClick={kiemTra} disabled={dangKiemTra}>
          {dangKiemTra ? 'Đang kiểm tra…' : 'Kiểm tra key'}
        </button>
        <button type="button" className="btn-ghost primary" onClick={luu}>
          Lưu cấu hình
        </button>
        <button
          type="button"
          className="btn-ghost danger"
          onClick={() => {
            xoaKey();
            setTam((t) => ({ ...t, apiKey: '' }));
            setThongBao('Đã xoá key khỏi trình duyệt.');
          }}
        >
          Xoá key
        </button>
      </div>

      {thongBao && <p className="hint">{thongBao}</p>}
      {loi && <p className="error">{loi}</p>}

      <p className="hint">
        Key chỉ nằm trong <code>localStorage</code> của trình duyệt này và được gửi thẳng tới{' '}
        {TEN_NHA_CUNG_CAP[tam.provider]} — không qua máy chủ trung gian. Dùng máy chung thì nên xoá
        key sau khi dùng. Chi phí do tài khoản của bạn trả cho nhà cung cấp.
      </p>
    </div>
  );
}

export default function AiPanel({ laSo, namXem, chartId }: Props) {
  const [caiDat, setCaiDat] = useState<AiSettings>(() => docCaiDat());
  const [moCauHinh, setMoCauHinh] = useState(() => !coKey(docCaiDat()));
  const [mode, setMode] = useState<AiMode>('mot-cau');
  const [cauHoi, setCauHoi] = useState('');
  const [dangChay, setDangChay] = useState(false);
  const [chu, setChu] = useState('');
  const [loi, setLoi] = useState('');
  const [vanDe, setVanDe] = useState<PrecheckIssue[]>([]);
  const [ketQua, setKetQua] = useState<AiReading | null>(null);
  const [dsBaiDoc, setDsBaiDoc] = useState<AiReading[]>(() => docBaiDoc(chartId));
  const [daChep, setDaChep] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const outRef = useRef<HTMLDivElement>(null);

  const goiY = useMemo(() => goiYCauHoi(laSo, namXem), [laSo, namXem]);
  const doChac = useMemo(() => tachDoChac(ketQua?.content ?? chu).confidence, [ketQua, chu]);

  useEffect(() => {
    setDsBaiDoc(docBaiDoc(chartId));
    setKetQua(null);
    setChu('');
    setVanDe([]);
    setLoi('');
    setCauHoi('');
  }, [chartId]);

  useEffect(() => {
    const node = outRef.current;
    if (node && dangChay) node.scrollTop = node.scrollHeight;
  }, [chu, dangChay]);

  async function chay() {
    setLoi('');
    setDaChep('');
    const kiemTra = precheck({ laSo, namXem, mode, question: cauHoi });
    setVanDe(kiemTra);
    if (kiemTra.some((v) => v.level === 'error')) return;

    if (!coKey(caiDat)) {
      setMoCauHinh(true);
      setLoi('Chưa có API key. Mở Cấu hình và dán key trước khi hỏi.');
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setDangChay(true);
    setChu('');
    setKetQua(null);
    const batDau = performance.now();
    let dem = '';

    try {
      const anToan = coAnToan(kiemTra);
      const system =
        heThongPrompt(mode) +
        (anToan.length ? `\n\nLƯU Ý AN TOÀN CHO CÂU HỎI NÀY:\n- ${anToan.join('\n- ')}` : '');
      const user = nguoiDungPrompt({ laSo, namXem, mode, question: cauHoi });

      const text = await streamChat({
        settings: caiDat,
        system,
        user,
        signal: ctrl.signal,
        onDelta: (t) => {
          dem += t;
          setChu(dem);
        },
        maxOutputTokens: mode === 'mot-cau' ? 3072 : 8192,
        temperature: mode === 'mot-cau' ? 0.7 : 0.65,
      });

      const kq = postcheck(text, laSo, mode);
      const sach = tachDoChac(text).content;
      const bai: AiReading = {
        id: taoId(),
        chartId,
        mode,
        question: cauHoi.trim(),
        content: sach,
        provider: caiDat.provider,
        model: caiDat.model,
        promptVersion: PHIEN_BAN_PROMPT,
        namXem,
        createdAt: Date.now(),
        latencyMs: Math.round(performance.now() - batDau),
        wordCount: kq.wordCount,
        charCount: sach.length,
        estTokens: Math.round(sach.length / 3.5),
        estCostUsd: uocTinhChiPhi(caiDat.provider, kq.wordCount),
        postcheck: kq,
      };

      setKetQua(bai);
      setChu(sach);
      setDsBaiDoc(luuBaiDoc(bai));
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        setLoi('Đã dừng theo yêu cầu. Phần đã viết vẫn còn ở trên, có thể chép lại.');
      } else if (e instanceof LoiAi) {
        setLoi(e.chiTiet ? `${e.message} (${e.chiTiet})` : e.message);
      } else {
        setLoi(String((e as Error)?.message ?? e));
      }
    } finally {
      setDangChay(false);
      abortRef.current = null;
    }
  }

  function dung() {
    abortRef.current?.abort();
  }

  async function chep() {
    const noiDung = ketQua?.content ?? tachDoChac(chu).content;
    if (!noiDung) return;
    try {
      await navigator.clipboard.writeText(noiDung);
      setDaChep('Đã chép bài.');
    } catch {
      window.prompt('Sao chép nội dung:', noiDung);
    }
    setTimeout(() => setDaChep(''), 2200);
  }

  function luuVaoGhiChu() {
    const noiDung = ketQua?.content ?? tachDoChac(chu).content;
    if (!noiDung) return;
    const nhan = CHE_DO.find((c) => c.key === mode)?.ten ?? 'Hỏi AI';
    const cu = docGhiChu(chartId);
    const moc = `── ${nhan} · ${new Date().toLocaleString('vi-VN')} ──\n${noiDung}`;
    luuGhiChu(chartId, cu ? `${cu}\n\n${moc}` : moc);
    setDaChep('Đã lưu vào ghi chú của lá số.');
    setTimeout(() => setDaChep(''), 2200);
  }

  const noiDungDangXem = ketQua?.content ?? tachDoChac(chu).content;
  const dangChayLanDau = dangChay && !noiDungDangXem;

  return (
    <section className="ai-panel" id="ai-panel">
      <div className="ai-head">
        <div>
          <h3>
            <span className="badge">AI</span>
            Hỏi thầy về lá số này
          </h3>
          <p>
            Đặt một câu hỏi cụ thể. AI đọc đúng dữ liệu lá số đang mở, nêu căn cứ sao – cung và nói
            rõ mức độ chắc. Câu trả lời chỉ nằm trên máy bạn.
          </p>
        </div>
        <div className="ai-actions">
          <button className="btn-ghost" onClick={() => setMoCauHinh((v) => !v)}>
            {moCauHinh ? 'Đóng cấu hình' : 'Cấu hình'}
          </button>
        </div>
      </div>

      {moCauHinh && (
        <CauHinh
          caiDat={caiDat}
          onLuu={(s) => {
            setCaiDat(s);
            setLoi('');
          }}
          onDong={() => setMoCauHinh(false)}
        />
      )}

      <div className="seg ai-modes" role="tablist">
        {CHE_DO.map((c) => (
          <button
            key={c.key}
            role="tab"
            aria-selected={mode === c.key}
            className={mode === c.key ? 'on' : ''}
            onClick={() => setMode(c.key)}
            disabled={dangChay}
          >
            {c.ten}
            <em>{c.moTa}</em>
          </button>
        ))}
      </div>

      <textarea
        className="ai-question"
        value={cauHoi}
        maxLength={600}
        rows={3}
        onChange={(e) => setCauHoi(e.target.value)}
        placeholder={
          mode === 'mot-cau'
            ? 'Ví dụ: Năm 2026 tôi có nên chuyển sang công việc mới không?'
            : 'Có thể để trống — AI sẽ luận theo chế độ đã chọn.'
        }
        disabled={dangChay}
      />

      <div className="ai-chips">
        {goiY.map((g) => (
          <button key={g} className="ai-chip" onClick={() => setCauHoi(g)} disabled={dangChay}>
            {g}
          </button>
        ))}
      </div>

      {vanDe.length > 0 && (
        <ul className="ai-issues">
          {vanDe.map((v, i) => (
            <li key={`${v.code}-${i}`} className={`ai-issue ai-issue-${v.level}`}>
              <b>{v.level === 'error' ? 'Lỗi' : v.level === 'warn' ? 'Lưu ý' : 'Thông tin'}:</b>{' '}
              {v.message}
              {v.goiY && <span className="ai-issue-goiy"> {v.goiY}</span>}
            </li>
          ))}
        </ul>
      )}

      <div className="ai-actions">
        {!dangChay ? (
          <button className="btn-ghost primary" onClick={chay} disabled={!coKey(caiDat)}>
            Hỏi thầy
          </button>
        ) : (
          <button className="btn-ghost danger" onClick={dung}>
            Dừng
          </button>
        )}
        {!coKey(caiDat) && <span className="hint">Chưa có API key — mở Cấu hình để dán key.</span>}
        {dangChay && <span className="hint">Đang viết… bài dài có thể mất 1–3 phút.</span>}
        {daChep && <span className="hint">{daChep}</span>}
      </div>

      {loi && <p className="error">{loi}</p>}

      {(noiDungDangXem || dangChayLanDau) && (
        <div className="ai-output" ref={outRef}>
          {dangChayLanDau ? (
            <p className="hint">Đang chờ model trả lời…</p>
          ) : (
            <Markdown text={noiDungDangXem} />
          )}
          {dangChay && noiDungDangXem && <span className="caret" />}

          <div className="ai-meta">
            <span>{TEN_NHA_CUNG_CAP[caiDat.provider]}</span>
            <span>{caiDat.model}</span>
            {doChac && (
              <span>
                Độ chắc: <b>{doChac}</b>
              </span>
            )}
            {ketQua && <span>{ketQua.wordCount} từ</span>}
            {ketQua && <span>{(ketQua.latencyMs / 1000).toFixed(1)} giây</span>}
            {ketQua && <span>prompt {ketQua.promptVersion}</span>}
            {ketQua && ketQua.estCostUsd > 0 && (
              <span>~${ketQua.estCostUsd.toFixed(5)}</span>
            )}
          </div>

          {ketQua && ketQua.postcheck.issues.length > 0 && (
            <ul className="ai-issues">
              {ketQua.postcheck.issues.map((v, i) => (
                <li key={i} className="ai-issue ai-issue-warn">
                  <b>Kiểm tra:</b> {v}
                </li>
              ))}
            </ul>
          )}

          <div className="ai-actions">
            <button className="btn-ghost" onClick={chep}>
              Chép bài
            </button>
            <button className="btn-ghost" onClick={luuVaoGhiChu}>
              Lưu vào ghi chú
            </button>
          </div>
        </div>
      )}

      {dsBaiDoc.length > 0 && (
        <details className="ai-saved">
          <summary>Bài đã lưu trên máy ({dsBaiDoc.length})</summary>
          <div className="ai-list">
            {dsBaiDoc.map((r) => (
              <div className="ai-item" key={r.id}>
                <button
                  className="ai-item-main"
                  onClick={() => {
                    setMode(r.mode);
                    setCauHoi(r.question);
                    setKetQua(r);
                    setChu(r.content);
                    setVanDe([]);
                    setLoi('');
                  }}
                >
                  <b>{CHE_DO.find((c) => c.key === r.mode)?.ten ?? r.mode}</b>
                  <span>{r.question || '(không có câu hỏi)'}</span>
                  <em>
                    {new Date(r.createdAt).toLocaleString('vi-VN')} · {r.wordCount} từ
                  </em>
                </button>
                <button
                  className="ai-item-xoa"
                  title="Xoá bài này"
                  onClick={() => setDsBaiDoc(xoaBaiDoc(chartId, r.id))}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      <p className="hint">
        AI chỉ đọc dữ liệu lá số do engine tính sẵn, không tự an sao. Nội dung để tham khảo, không
        thay lời khuyên y tế / pháp lý / tài chính. Key lưu trong trình duyệt này và gửi thẳng tới
        nhà cung cấp model.
      </p>
    </section>
  );
}
