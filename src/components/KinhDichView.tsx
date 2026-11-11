import { useMemo, useState } from 'react';
import {
  HAN_QUAI,
  NGHIA_QUAI,
  QUE,
  TEN_HAO,
  dungQueTuHao,
  gieoQue,
  type KetQuaGieo,
  type Que,
} from '../lib/kinhDich';
import { docLichSu, luuLanGieo, xoaHet, xoaMot, type MucLichSu } from '../lib/kinhDichLuu';
import { Card, GhiChu, Pill, inputStyle } from './dp-ui';

const MAU_QUE: Record<string, { tone: 'green' | 'red' | 'gold'; chu: string }> = {
  cat: { tone: 'green', chu: 'Cát' },
  hung: { tone: 'red', chu: 'Hung' },
  binh: { tone: 'gold', chu: 'Bình' },
};

const TAB = [
  { key: 'gieo', ten: 'Gieo quẻ' },
  { key: 'tra-cuu', ten: 'Tra cứu 64 quẻ' },
] as const;

type TabKey = (typeof TAB)[number]['key'];

function VeHao({ duong, dong, viTri }: { duong: boolean; dong: boolean; viTri: number }) {
  const mau = dong ? 'var(--gold)' : 'var(--cream)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 54, color: 'var(--muted-2)', fontSize: 11.5, textAlign: 'right' }}>
        {TEN_HAO[viTri - 1]}
      </span>
      <div style={{ width: 132, height: 11, display: 'flex', gap: 8 }}>
        {duong ? (
          <div style={{ flex: 1, background: mau, borderRadius: 2 }} />
        ) : (
          <>
            <div style={{ flex: 1, background: mau, borderRadius: 2 }} />
            <div style={{ flex: 1, background: mau, borderRadius: 2 }} />
          </>
        )}
      </div>
      <span style={{ width: 56, color: dong ? 'var(--gold)' : 'var(--muted-2)', fontSize: 11.5 }}>
        {dong ? 'động' : duong ? 'dương' : 'âm'}
      </span>
    </div>
  );
}

function KhoiQue({ kq }: { kq: KetQuaGieo }) {
  const mau = MAU_QUE[kq.chu.cat];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 4 }}>
        {[...kq.hao].reverse().map((h, i) => (
          <VeHao key={i} duong={h.duong} dong={h.dong} viTri={6 - i} />
        ))}
      </div>
      <div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}>
            {kq.chu.so}. {kq.chu.ten}
          </h3>
          <Pill tone={mau.tone}>{mau.chu}</Pill>
        </div>
        <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12.5 }}>
          {kq.chu.han} · trên {NGHIA_QUAI[kq.chu.tren]} {HAN_QUAI[kq.chu.tren]} / dưới{' '}
          {NGHIA_QUAI[kq.chu.duoi]} {HAN_QUAI[kq.chu.duoi]}
        </p>
        <p style={{ margin: '10px 0 0', color: 'var(--text)', lineHeight: 1.75, fontSize: 14 }}>
          {kq.chu.tomTat}
        </p>
        {kq.viTriDong.length > 0 && (
          <p style={{ margin: '10px 0 0', color: 'var(--gold-2)', fontSize: 12.5 }}>
            Hào động: {kq.viTriDong.map((v) => TEN_HAO[v - 1]).join(', ')}
          </p>
        )}
        {kq.bien && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--line)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 12 }}>Quẻ biến</p>
            <strong style={{ color: 'var(--cream)', fontSize: 16 }}>
              {kq.bien.so}. {kq.bien.ten}
            </strong>
            <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: 13, lineHeight: 1.7 }}>
              {kq.bien.tomTat}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChiTietQue({ que, onDong }: { que: Que; onDong: () => void }) {
  const mau = MAU_QUE[que.cat];
  return (
    <Card style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', color: 'var(--gold)' }}
          >
            {que.so}. {que.ten}
          </h3>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 12.5 }}>
            {que.han} · trên {NGHIA_QUAI[que.tren]} {HAN_QUAI[que.tren]} / dưới{' '}
            {NGHIA_QUAI[que.duoi]} {HAN_QUAI[que.duoi]}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Pill tone={mau.tone}>{mau.chu}</Pill>
          <button className="btn-ghost" type="button" onClick={onDong}>
            Đóng
          </button>
        </div>
      </div>
      <p style={{ margin: '12px 0 0', color: 'var(--text)', lineHeight: 1.75, fontSize: 14 }}>
        {que.tomTat}
      </p>
    </Card>
  );
}

/** Đọc lại một lần gieo đã lưu; dữ liệu hỏng thì báo thay vì làm sập màn. */
function moTaMuc(muc: MucLichSu): { chu: string; bien: string } {
  try {
    const q = dungQueTuHao(muc.hao);
    return {
      chu: `${q.chu.so}. ${q.chu.ten}`,
      bien: q.bien ? `${q.bien.so}. ${q.bien.ten}` : '',
    };
  } catch {
    return { chu: 'Không đọc được', bien: '' };
  }
}

export default function KinhDichView() {
  const [kq, setKq] = useState<KetQuaGieo | null>(null);
  const [lichSu, setLichSu] = useState<MucLichSu[]>(() => docLichSu());
  const [tab, setTab] = useState<TabKey>('gieo');
  const [tuKhoa, setTuKhoa] = useState('');
  const [queChon, setQueChon] = useState<Que | null>(null);

  const dsQue = useMemo(() => {
    const q = tuKhoa.trim().toLowerCase();
    if (!q) return QUE;
    return QUE.filter(
      (x) =>
        x.ten.toLowerCase().includes(q) ||
        x.han.includes(q) ||
        String(x.so) === q ||
        String(x.so).padStart(2, '0') === q,
    );
  }, [tuKhoa]);

  function gieo() {
    const moi = gieoQue();
    setKq(moi);
    setLichSu(luuLanGieo(moi.hao.map((h) => h.giaTri)));
  }

  function moLai(m: MucLichSu) {
    try {
      setKq(dungQueTuHao(m.hao));
      setTab('gieo');
    } catch {
      setLichSu(xoaMot(m.id));
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TAB.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={tab === t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontFamily: 'inherit',
              fontSize: 13.5,
              cursor: 'pointer',
              color: tab === t.key ? 'var(--gold-2)' : 'var(--muted)',
              background: tab === t.key ? 'var(--gold-mo)' : 'transparent',
              border: `1px solid ${tab === t.key ? 'var(--line-strong)' : 'var(--line)'}`,
            }}
          >
            {t.ten}
          </button>
        ))}
      </div>

      {tab === 'gieo' ? (
        <>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
            Gieo quẻ tam tiền: mỗi lần tung 3 đồng xu, mặt ngửa tính 3, mặt sấp tính 2. Gieo 6 lần
            từ dưới lên để được 6 hào; hào 6 và 9 là hào động, tạo ra quẻ biến. Mỗi lần gieo được
            lưu lại trên máy để xem về sau.
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn-primary" type="button" onClick={gieo}>
              {kq ? 'Gieo lại' : 'Gieo quẻ'}
            </button>
            {kq && (
              <span style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: 12.5 }}>
                Quẻ chỉ ứng với thời điểm gieo; lòng thành và câu hỏi rõ ràng quan trọng hơn số lần
                gieo.
              </span>
            )}
          </div>

          {!kq && (
            <Card style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>
              Bấm “Gieo quẻ” để bắt đầu. Trước khi gieo, hãy tự hỏi một việc cụ thể — càng rõ càng
              dễ đối chiếu.
            </Card>
          )}

          {kq && (
            <Card style={{ padding: 20 }}>
              <KhoiQue kq={kq} />
            </Card>
          )}

          {lichSu.length > 0 && (
            <Card style={{ padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginBottom: 10,
                }}
              >
                <h4 style={{ margin: 0, fontSize: 14 }}>Lịch sử gieo ({lichSu.length})</h4>
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => setLichSu(xoaHet())}
                >
                  Xoá hết
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lichSu.map((m) => {
                  const t = moTaMuc(m);
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'stretch',
                        gap: 8,
                        border: '1px solid var(--line)',
                        borderRadius: 10,
                        background: 'var(--glass-1)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => moLai(m)}
                        title="Mở lại lần gieo này"
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                          padding: '10px 12px',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 0,
                          color: 'var(--text)',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        <strong style={{ fontSize: 13, color: 'var(--gold-2)' }}>
                          {t.chu}
                          {t.bien && (
                            <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                              {' '}
                              → {t.bien}
                            </span>
                          )}
                        </strong>
                        <em style={{ fontStyle: 'normal', fontSize: 11.5, color: 'var(--muted-2)' }}>
                          {new Date(m.luc).toLocaleString('vi-VN')} · hào {m.hao.join(' ')}
                        </em>
                      </button>
                      <button
                        type="button"
                        title="Xoá lần gieo này"
                        onClick={() => setLichSu(xoaMot(m.id))}
                        style={{
                          width: 38,
                          border: 0,
                          borderLeft: '1px solid var(--line)',
                          background: 'transparent',
                          color: 'var(--muted-2)',
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
            Tra 64 quẻ theo số, tên Việt hoặc chữ Hán. Bấm vào một quẻ để xem phần tóm tắt ý chính;
            phần này không thay cho việc gieo quẻ.
          </p>

          <input
            type="search"
            style={{ ...inputStyle, maxWidth: 440 }}
            value={tuKhoa}
            onChange={(e) => setTuKhoa(e.target.value)}
            placeholder="Ví dụ: 11, Thái, 泰, Càn…"
            aria-label="Tìm quẻ"
          />

          <p style={{ margin: 0, color: 'var(--muted-2)', fontSize: 12 }}>
            {dsQue.length}/64 quẻ
          </p>

          {queChon && <ChiTietQue que={queChon} onDong={() => setQueChon(null)} />}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 10,
            }}
          >
            {dsQue.map((q) => (
              <button
                key={q.so}
                type="button"
                onClick={() => setQueChon(q)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  padding: '12px 14px',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  borderRadius: 12,
                  border: `1px solid ${queChon?.so === q.so ? 'var(--line-strong)' : 'var(--line)'}`,
                  background: queChon?.so === q.so ? 'var(--gold-mo)' : 'var(--glass-1)',
                  color: 'var(--text)',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    gap: 8,
                  }}
                >
                  <strong style={{ fontSize: 13.5, color: 'var(--gold-2)' }}>
                    {q.so}. {q.ten}
                  </strong>
                  <span style={{ fontSize: 18, color: 'var(--cream)' }}>{q.han}</span>
                </span>
                <span style={{ fontSize: 11.5, color: 'var(--muted-2)' }}>
                  {HAN_QUAI[q.tren]} {NGHIA_QUAI[q.tren]} / {HAN_QUAI[q.duoi]} {NGHIA_QUAI[q.duoi]}
                </span>
                <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.55 }}>
                  {q.tomTat}
                </span>
              </button>
            ))}
          </div>

          {dsQue.length === 0 && (
            <Card style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
              Không tìm thấy quẻ nào khớp “{tuKhoa}”. Thử số từ 1 đến 64 hoặc một phần tên quẻ.
            </Card>
          )}
        </>
      )}

      <GhiChu>
        <strong style={{ color: 'var(--text)' }}>Lưu ý:</strong> lời quẻ ở đây là bản tóm tắt ý
        chính của 64 quẻ, không phải lời giảng đầy đủ. Kinh Dịch cổ có nhiều tầng nghĩa (quẻ, hào,
        thể, dụng); muốn hiểu sâu nên đọc kèm sách có chú giải. Lịch sử gieo chỉ lưu trên máy bạn,
        không gửi đi đâu.
      </GhiChu>
    </div>
  );
}
