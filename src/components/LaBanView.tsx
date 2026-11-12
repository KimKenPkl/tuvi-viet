import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { SON, cungTheoSo, kiemHuong, sonTheoDo, viTriTrongSon } from '../lib/phiTinh';
import { luuHuongChon } from '../lib/phiTinhLuu';
import { chuyen } from '../lib/router';
import { slugTen, xuatNodePng } from '../lib/xuatAnh';
import { Card, Field, GhiChu, Pill, inputStyle } from './dp-ui';

const chuanHoa = (goc: number): number => ((goc % 360) + 360) % 360;

/** Toạ độ trên vòng tròn: 0° ở đỉnh (chính Bắc), thuận chiều kim đồng hồ. */
function toaDo(goc: number, r: number): [number, number] {
  const rad = ((goc - 90) * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
}

function cungTron(r: number, tu: number, den: number): string {
  const [x1, y1] = toaDo(tu, r);
  const [x2, y2] = toaDo(den, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

/** Vạch chia tĩnh, tính một lần lúc nạp module — kéo kim không phải dựng lại 360 vạch. */
const VACH = Array.from({ length: 72 }, (_, i) => i * 5).map((goc) => {
  const lon = goc % 15 === 0;
  const [x1, y1] = toaDo(goc, lon ? 148 : 158);
  const [x2, y2] = toaDo(goc, 168);
  return { goc, lon, x1, y1, x2, y2 };
});

// Bốn hướng chính đã có chữ BẮC/ĐÔNG/NAM/TÂY nên chỉ in số độ ở tám mốc còn lại,
// tránh chữ số chen vào tên sơn nằm cùng trục.
const DO_SO = [30, 60, 120, 150, 210, 240, 300, 330];

export default function LaBanView() {
  const [huong, setHuong] = useState(0);
  const [tuThien, setTuThien] = useState(0);
  const [dangKeo, setDangKeo] = useState(false);
  const [camBien, setCamBien] = useState(false);
  const [saiSo, setSaiSo] = useState<number | null>(null);
  const [loi, setLoi] = useState('');
  const [dangXuat, setDangXuat] = useState(false);

  const vungAnh = useRef<HTMLDivElement>(null);
  const dangKeoRef = useRef(false);

  const huongThat = chuanHoa(huong + tuThien);
  const son = sonTheoDo(huongThat);
  const toa = sonTheoDo(huongThat + 180);
  const kiem = kiemHuong(huongThat);
  const cung = cungTheoSo(son.cung);
  const trongSon = viTriTrongSon(huongThat);

  /** Góc dưới con trỏ, tính từ tâm SVG. */
  function gocDuoiChuot(e: ReactPointerEvent<SVGSVGElement>): number {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const goc = (Math.atan2(e.clientX - cx, cy - e.clientY) * 180) / Math.PI;
    return chuanHoa(goc);
  }

  /** Kéo trên mặt la bàn: đặt hướng kim sao cho đầu kim nằm đúng dưới ngón tay. */
  function datTheoConTro(e: ReactPointerEvent<SVGSVGElement>) {
    setHuong(chuanHoa(Math.round((gocDuoiChuot(e) - tuThien) * 2) / 2));
  }

  function batDauKeo(e: ReactPointerEvent<SVGSVGElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dangKeoRef.current = true;
    setDangKeo(true);
    datTheoConTro(e);
  }

  function keo(e: ReactPointerEvent<SVGSVGElement>) {
    if (!dangKeoRef.current) return;
    datTheoConTro(e);
  }

  function ketThucKeo(e: ReactPointerEvent<SVGSVGElement>) {
    dangKeoRef.current = false;
    setDangKeo(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  // Cảm biến hướng: chỉ gắn khi người dùng bật, và tháo ngay khi tắt.
  useEffect(() => {
    if (!camBien) return;
    let huy = false;

    function xuLy(e: DeviceOrientationEvent) {
      if (huy) return;
      const coWebkit = e as DeviceOrientationEvent & {
        webkitCompassHeading?: number;
        webkitCompassAccuracy?: number;
      };
      let goc: number | null = null;
      if (typeof coWebkit.webkitCompassHeading === 'number') {
        goc = coWebkit.webkitCompassHeading;
        setSaiSo(
          typeof coWebkit.webkitCompassAccuracy === 'number'
            ? Math.abs(coWebkit.webkitCompassAccuracy)
            : null,
        );
      } else if (typeof e.alpha === 'number') {
        // alpha quay ngược chiều kim đồng hồ khi máy nằm phẳng → đổi dấu.
        goc = 360 - e.alpha;
        setSaiSo(null);
      }
      if (goc !== null) setHuong(chuanHoa(Math.round(goc * 2) / 2));
    }

    const coTuyetDoi = 'ondeviceorientationabsolute' in window;
    window.addEventListener(
      coTuyetDoi ? 'deviceorientationabsolute' : 'deviceorientation',
      xuLy as EventListener,
    );
    return () => {
      huy = true;
      window.removeEventListener(
        coTuyetDoi ? 'deviceorientationabsolute' : 'deviceorientation',
        xuLy as EventListener,
      );
    };
  }, [camBien]);

  async function batCamBien() {
    setLoi('');
    if (typeof window.DeviceOrientationEvent === 'undefined') {
      setLoi('Thiết bị hoặc trình duyệt này không cung cấp cảm biến hướng. Hãy kéo tay hoặc nhập số.');
      return;
    }
    try {
      const D = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
      };
      if (typeof D.requestPermission === 'function') {
        const kq = await D.requestPermission();
        if (kq !== 'granted') {
          setLoi('Bạn chưa cấp quyền cảm biến. Cần cấp quyền trong cài đặt trình duyệt rồi thử lại.');
          return;
        }
      }
      setCamBien(true);
    } catch (e) {
      console.error(e);
      setLoi('Không bật được cảm biến. Trên máy tính để bàn, hãy dùng cách kéo tay.');
    }
  }

  async function xuatAnh() {
    if (!vungAnh.current) return;
    setDangXuat(true);
    setLoi('');
    try {
      await xuatNodePng(vungAnh.current, `la-ban-${slugTen(`${son.ten}-${Math.round(huongThat)}`)}.png`);
    } catch (e) {
      console.error(e);
      setLoi('Trình duyệt không xuất được ảnh. Bạn có thể chụp màn hình thay thế.');
    } finally {
      setDangXuat(false);
    }
  }

  function moPhiTinh() {
    luuHuongChon(huongThat);
    chuyen('/phuong-dong/phi-tinh');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
        Kéo trên mặt la bàn, nhập số độ hoặc dùng cảm biến của điện thoại để xác định hướng. Kết quả
        quy ra một trong 24 sơn, kèm toạ sơn đối diện và cảnh báo khi trục đo rơi sát ranh giới hai
        sơn — trường hợp các phái phong thuỷ xử lý khác nhau.
      </p>

      <div className="lb-luoi">
        <div ref={vungAnh} className="lb-anh">
          <p className="eyebrow" style={{ margin: '0 0 6px' }}>
            La bàn 24 sơn — bắc thật ở trên
          </p>

          <svg
            viewBox="-190 -190 380 380"
            className="lb-svg"
            role="img"
            aria-label={`La bàn đang chỉ ${son.ten}, ${Math.round(huongThat)} độ`}
            style={{ fontFamily: 'var(--font-ui)', touchAction: 'none', userSelect: 'none' }}
            onPointerDown={batDauKeo}
            onPointerMove={keo}
            onPointerUp={ketThucKeo}
            onPointerCancel={ketThucKeo}
          >
            <circle r="168" fill="none" stroke="var(--line-strong)" strokeWidth="1" />
            <circle r="146" fill="none" stroke="var(--line)" strokeWidth="0.7" />

            {VACH.map((v) => (
              <line
                key={v.goc}
                x1={v.x1}
                y1={v.y1}
                x2={v.x2}
                y2={v.y2}
                stroke={v.lon ? 'var(--line-strong)' : 'var(--line)'}
                strokeWidth={v.lon ? 1 : 0.6}
              />
            ))}

            {DO_SO.map((goc) => {
              const [x, y] = toaDo(goc, 184);
              return (
                <text
                  key={goc}
                  className="lb-do-so"
                  x={x}
                  y={y}
                  fill="var(--muted-2)"
                  fontSize="7.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {goc}°
                </text>
              );
            })}

            {/* Sơn hiện tại và toạ sơn: hai cung đậm trên vành trong */}
            <path
              d={cungTron(132, chuanHoa(son.batDau), chuanHoa(son.batDau + 15))}
              fill="none"
              stroke="var(--gold)"
              strokeWidth="6"
              strokeLinecap="butt"
              opacity="0.75"
            />
            <path
              d={cungTron(132, chuanHoa(toa.batDau), chuanHoa(toa.batDau + 15))}
              fill="none"
              stroke="var(--blue)"
              strokeWidth="6"
              strokeLinecap="butt"
              opacity="0.5"
              strokeDasharray="4 3"
            />

            <circle r="112" fill="none" stroke="var(--line)" strokeWidth="0.8" />

            {SON.map((s) => {
              const [x, y] = toaDo(s.batDau + 7.5, 141);
              const chon = s.ten === son.ten;
              return (
                <text
                  key={s.ten}
                  className="lb-son-ten"
                  x={x}
                  y={y}
                  fontSize={chon ? 11 : 9.5}
                  fontWeight={chon ? 700 : 400}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={chon ? 'var(--gold-2)' : s.duong ? 'var(--cream)' : 'var(--muted)'}
                >
                  {s.ten}
                </text>
              );
            })}

            {(
              [
                ['Bắc', 0],
                ['Đông', 90],
                ['Nam', 180],
                ['Tây', 270],
              ] as const
            ).map(([ten, goc]) => {
              const [x, y] = toaDo(goc, 106);
              return (
                <text
                  key={ten}
                  className="lb-huong-chinh"
                  x={x}
                  y={y}
                  fontSize="8"
                  letterSpacing="0.08em"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--muted-2)"
                >
                  {ten.toUpperCase()}
                </text>
              );
            })}

            <g transform={`rotate(${huongThat})`}>
              <polygon points="0,-88 5.5,-16 0,-6 -5.5,-16" fill="var(--gold)" />
              <polygon points="0,88 4.5,26 0,16 -4.5,26" fill="var(--red)" opacity="0.75" />
            </g>

            <circle r="11" fill="var(--bg-2)" stroke="var(--line-strong)" strokeWidth="1.5" />
            <circle r="3" fill="var(--gold)" />

            {dangKeo && (
              <circle r="168" fill="none" stroke="var(--gold)" strokeWidth="1.5" opacity="0.4" />
            )}
          </svg>

          <div className="lb-doc">
            <strong>{Math.round(huongThat * 10) / 10}°</strong>
            <span>
              {son.ten} {son.han} · cung {cung.ten} ({cung.huong})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ padding: 18 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
              }}
            >
              <Field label="Hướng kim la bàn" hint="Độ đọc trên la bàn hoặc trên điện thoại.">
                <input
                  type="number"
                  min={0}
                  max={359.5}
                  step={0.5}
                  value={huong}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) setHuong(chuanHoa(Math.round(v * 2) / 2));
                  }}
                  style={inputStyle}
                />
              </Field>

              <Field
                label="Độ từ thiên"
                hint="Cộng vào hướng kim để ra bắc thật. Việt Nam thường trong khoảng −1° đến +1°."
              >
                <input
                  type="number"
                  min={-10}
                  max={10}
                  step={0.1}
                  value={tuThien}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v)) setTuThien(Math.round(v * 10) / 10);
                  }}
                  style={inputStyle}
                />
              </Field>
            </div>

            <input
              type="range"
              min={0}
              max={359}
              step={0.5}
              value={huongThat}
              onChange={(e) => setHuong(chuanHoa(Number(e.target.value) - tuThien))}
              aria-label="Quay la bàn"
              style={{ width: '100%', marginTop: 14, accentColor: 'var(--gold)' }}
            />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {camBien ? (
                <button className="btn-ghost" type="button" onClick={() => setCamBien(false)}>
                  Tắt cảm biến
                </button>
              ) : (
                <button className="btn-ghost" type="button" onClick={batCamBien}>
                  Dùng cảm biến điện thoại
                </button>
              )}
              <button className="btn-ghost" type="button" onClick={xuatAnh} disabled={dangXuat}>
                {dangXuat ? 'Đang xuất…' : 'Xuất ảnh PNG'}
              </button>
              <button className="btn-primary" type="button" onClick={moPhiTinh}>
                Lập bàn phi tinh
              </button>
            </div>

            {camBien && (
              <p style={{ margin: '10px 0 0', color: 'var(--muted)', fontSize: 12 }}>
                Đang đọc cảm biến{saiSo !== null ? ` (sai số khai báo ±${saiSo.toFixed(0)}°)` : ''}.
                Kim từ trường lệch khi gần sắt thép, loa, tủ điện hoặc điện thoại khác — tránh xa
                các vật đó khi đo.
              </p>
            )}
            {loi && (
              <p style={{ margin: '10px 0 0', color: 'var(--red)', fontSize: 12.5 }} role="status">
                {loi}
              </p>
            )}
          </Card>

          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Pill tone={kiem.kiem ? 'red' : 'green'}>
                {kiem.kiem ? `Kiêm hướng ${kiem.lech.toFixed(1)}°` : 'Chính hướng'}
              </Pill>
              <Pill tone="gold">Hướng {son.ten}</Pill>
              <Pill tone="blue">Toạ {toa.ten}</Pill>
            </div>

            <div className="lb-facts">
              <div>
                <span>Hướng thật</span>
                <strong>{Math.round(huongThat * 10) / 10}°</strong>
              </div>
              <div>
                <span>Sơn</span>
                <strong>
                  {son.ten} <em>{son.han}</em> · {son.duong ? 'dương' : 'âm'}
                </strong>
              </div>
              <div>
                <span>Cung</span>
                <strong>
                  {cung.ten} · {cung.huong}
                </strong>
              </div>
              <div>
                <span>Toạ sơn</span>
                <strong>
                  {toa.ten} <em>{toa.han}</em>
                </strong>
              </div>
              <div>
                <span>Vị trí trong sơn</span>
                <strong>{trongSon.toFixed(1)}° tính từ đầu sơn</strong>
              </div>
              <div>
                <span>Cách ranh giới</span>
                <strong>{kiem.lech.toFixed(1)}°</strong>
              </div>
            </div>

            <p style={{ margin: '12px 0 0', color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.75 }}>
              {kiem.kiem
                ? 'Trục đo nằm trong 3° sát ranh giới hai sơn. Các phái lập bàn khác nhau ở đây (lấy sơn gần nhất, thế quái, phân kim), nên hãy đo lại cẩn thận trước khi dùng để chọn hướng.'
                : `Trục đo nằm giữa sơn ${son.ten}. Đây là chính hướng, lập bàn được thẳng.`}
            </p>
          </Card>

          <Card style={{ padding: 18 }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--cream)' }}>
              24 sơn — bấm để đặt hướng
            </h4>
            <div className="lb-son">
              {SON.map((s) => (
                <button
                  key={s.ten}
                  type="button"
                  aria-pressed={s.ten === son.ten}
                  onClick={() => setHuong(chuanHoa(s.batDau + 7.5 - tuThien))}
                  title={`${s.ten} ${s.han} — ${chuanHoa(s.batDau + 7.5)}°, ${s.huong}`}
                  style={{
                    padding: '6px 4px',
                    borderRadius: 8,
                    fontFamily: 'inherit',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: s.ten === son.ten ? 'var(--gold-2)' : s.duong ? 'var(--cream)' : 'var(--muted)',
                    background: s.ten === son.ten ? 'var(--gold-mo)' : 'transparent',
                    border: `1px solid ${s.ten === son.ten ? 'var(--line-strong)' : 'var(--line)'}`,
                  }}
                >
                  {s.ten}
                </button>
              ))}
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--muted-2)', fontSize: 11.5 }}>
              Chữ sáng là dương sơn, chữ mờ là âm sơn — dương phi thuận, âm phi nghịch khi lập bàn.
            </p>
          </Card>
        </div>
      </div>

      <GhiChu>
        <strong style={{ color: 'var(--text)' }}>Lưu ý:</strong> la bàn này vẽ theo bắc thật; cảm
        biến điện thoại thường cho hướng từ trường nên cần cộng độ từ thiên (thường dưới 1° ở Việt
        Nam, có thể tra theo mô hình IGRF). Máy tính để bàn không có cảm biến — hãy dùng thanh trượt
        hoặc nhập số. Sai số đo hướng 1–2° có thể đẩy trục đo từ sơn này sang sơn khác khi đang ở
        gần ranh giới, nên đọc cảnh báo kiêm hướng trước khi kết luận.
      </GhiChu>
    </div>
  );
}
