import { useEffect, useMemo, useRef, useState } from 'react';
import {
  SAO,
  SON,
  banNam,
  lapBanPhiTinh,
  saoNam,
  saoTheoSo,
  sonTheoDo,
  type CungPhiTinh,
} from '../lib/phiTinh';
import { docHuongChon } from '../lib/phiTinhLuu';
import { slugTen, xuatNodePng } from '../lib/xuatAnh';
import { Card, Field, GhiChu, Pill, inputStyle } from './dp-ui';

const NAM_NAY = new Date().getFullYear();
const NAM_DAU = 1864;
const NAM_CUOI = 2043;

const HUONG_NHANH: readonly (readonly [string, number])[] = [
  ['Bắc', 0],
  ['Đông Bắc', 45],
  ['Đông', 90],
  ['Đông Nam', 135],
  ['Nam', 180],
  ['Tây Nam', 225],
  ['Tây', 270],
  ['Tây Bắc', 315],
];

const chuanHoa = (goc: number): number => ((goc % 360) + 360) % 360;

function O({
  c,
  laToa,
  laHuong,
  nien,
}: {
  c: CungPhiTinh;
  laToa: boolean;
  laHuong: boolean;
  nien: number | null;
}) {
  const lop = ['pt-cell'];
  if (laToa) lop.push('is-toa');
  if (laHuong) lop.push('is-huong');

  return (
    <div
      className={lop.join(' ')}
      aria-label={`${c.ten} ${c.huong}: sơn tinh ${c.son}, vận tinh ${c.van}, hướng tinh ${c.huongSao}`}
    >
      <div className="pt-cung">
        <span className="pt-ten-cung">{c.so === 5 ? 'Trung cung' : c.ten}</span>
        <span className="pt-nhan-cu">
          {laToa ? 'toạ' : laHuong ? 'hướng' : c.so === 5 ? '' : c.huong}
        </span>
      </div>

      <div className="pt-so">
        <span className={`pt-sao son sao-mau-${c.son}`}>{c.son}</span>
        <span className={`pt-sao van sao-mau-${c.van}`}>{c.van}</span>
        <span className={`pt-sao huong sao-mau-${c.huongSao}`}>{c.huongSao}</span>
      </div>

      <div className="pt-nhan">
        <span>sơn</span>
        <span>vận</span>
        <span>hướng</span>
      </div>

      {nien !== null && <div className="pt-nien">niên tinh {nien}</div>}
    </div>
  );
}

export default function PhiTinhView() {
  const [nam, setNam] = useState(() => Math.min(NAM_CUOI, Math.max(NAM_DAU, NAM_NAY)));
  const [huong, setHuong] = useState(180);
  const [hienNien, setHienNien] = useState(false);
  const [dangXuat, setDangXuat] = useState(false);
  const [loiXuat, setLoiXuat] = useState('');

  const vungAnh = useRef<HTMLDivElement>(null);

  // Hướng do trang la bàn chuyển sang. Đọc trong effect để StrictMode không
  // "ăn" mất giá trị ở lần chạy thử thứ nhất.
  useEffect(() => {
    const v = docHuongChon();
    if (v !== null) setHuong(Math.round(v * 2) / 2);
  }, []);

  const ban = useMemo(() => lapBanPhiTinh(nam, huong), [nam, huong]);
  const nien = useMemo(() => banNam(nam), [nam]);
  const huongSon = ban.huongSon;
  const toaSon = ban.toaSon;

  async function xuatAnh() {
    if (!vungAnh.current) return;
    setDangXuat(true);
    setLoiXuat('');
    try {
      await xuatNodePng(
        vungAnh.current,
        `phi-tinh-${ban.nam}-${slugTen(`${huongSon.ten}-${ban.huongDo}`)}.png`,
      );
    } catch (e) {
      console.error(e);
      setLoiXuat('Trình duyệt không xuất được ảnh. Bạn có thể chụp màn hình thay thế.');
    } finally {
      setDangXuat(false);
    }
  }

  const ngoaiPhamVi = ban.ngoaiPhamVi;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
        Lập bàn Huyền Không cho một ngôi nhà: nhập năm nhập trạch và hướng nhà theo la bàn. Bàn
        gồm ba lớp sao — sơn tinh (nhân đinh), vận tinh (khí vận) và hướng tinh (tài lộc) — mỗi lớp
        phi theo đường Lạc Thư từ trung cung ra tám cung.
      </p>

      <Card style={{ padding: 18 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
          }}
        >
          <Field label="Năm nhập trạch" hint={`Từ ${NAM_DAU} đến ${NAM_CUOI}; mỗi vận 20 năm.`}>
            <input
              type="number"
              min={NAM_DAU}
              max={NAM_CUOI}
              step={1}
              value={nam}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) setNam(Math.round(v));
              }}
              style={inputStyle}
            />
          </Field>

          <Field label="Hướng nhà (độ la bàn)" hint="0° là chính Bắc, tăng theo chiều kim đồng hồ.">
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

          <Field label="Chọn theo 24 sơn" hint="Chọn sơn thì lấy đúng giữa sơn làm hướng.">
            <select
              value={huongSon.ten}
              onChange={(e) => {
                const s = SON.find((x) => x.ten === e.target.value);
                if (s) setHuong(chuanHoa(s.batDau + 7.5));
              }}
              style={inputStyle}
            >
              {SON.map((s) => (
                <option key={s.ten} value={s.ten}>
                  {s.ten} ({s.han}) — {chuanHoa(s.batDau + 7.5)}°
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ marginTop: 14 }}>
          <span style={{ display: 'block', color: 'var(--muted)', fontSize: 12, marginBottom: 6 }}>
            Hoặc chọn nhanh tám hướng
          </span>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {HUONG_NHANH.map(([ten, do_]) => {
              const chon = chuanHoa(huong - do_) < 22.5 || chuanHoa(do_ - huong) < 22.5;
              return (
                <button
                  key={ten}
                  type="button"
                  aria-pressed={chon}
                  onClick={() => setHuong(do_)}
                  style={{
                    padding: '7px 13px',
                    borderRadius: 999,
                    fontFamily: 'inherit',
                    fontSize: 13,
                    cursor: 'pointer',
                    color: chon ? 'var(--gold-2)' : 'var(--muted)',
                    background: chon ? 'var(--gold-mo)' : 'transparent',
                    border: `1px solid ${chon ? 'var(--line-strong)' : 'var(--line)'}`,
                  }}
                >
                  {ten} <span style={{ opacity: 0.65 }}>{do_}°</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Pill tone="gold">
          Vận {ban.van} · {ban.tamNguyen}
        </Pill>
        <Pill tone="red">
          Hướng {huongSon.ten} {ban.huongDo}°
        </Pill>
        <Pill tone="blue">
          Toạ {toaSon.ten} {ban.toaDo}°
        </Pill>
        <button className="btn-ghost" type="button" onClick={xuatAnh} disabled={dangXuat}>
          {dangXuat ? 'Đang xuất…' : 'Xuất ảnh PNG'}
        </button>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            marginLeft: 'auto',
            color: 'var(--muted)',
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={hienNien}
            onChange={(e) => setHienNien(e.target.checked)}
          />
          Chồng niên tinh {nam}
        </label>
      </div>

      {loiXuat && (
        <p style={{ margin: 0, color: 'var(--red)', fontSize: 12.5 }} role="status">
          {loiXuat}
        </p>
      )}

      {ngoaiPhamVi && (
        <Card style={{ borderColor: 'var(--red-vien)', background: 'var(--red-mo)', padding: 14 }}>
          <strong style={{ color: 'var(--red)' }}>Năm {nam} nằm ngoài phạm vi ba nguyên</strong>
          <p style={{ margin: '4px 0 0', color: 'var(--text)', fontSize: 13, lineHeight: 1.7 }}>
            Bàn Huyền Không chỉ định nghĩa vận 1–9 trong khoảng {NAM_DAU}–{NAM_CUOI}. Con số dưới
            đây là vận {ban.van} kẹp ở biên, không phải bàn của năm {nam}.
          </p>
        </Card>
      )}

      <div className="pt-luoi">
        <div ref={vungAnh} className="pt-anh">
          <div className="pt-anh-head">
            <p className="eyebrow">Huyền Không Phi Tinh</p>
            <h3>
              {ban.nam} · {toaSon.ten} sơn {huongSon.ten} hướng
            </h3>
            <p>
              Vận {ban.van} — {ban.tamNguyen} · hướng {ban.huongDo}° · toạ {ban.toaDo}°
              {hienNien ? ` · niên tinh ${saoNam(nam)} nhập trung` : ''}
            </p>
          </div>

          <div className="pt-grid">
            {ban.cung.map((c) => (
              <O
                key={c.so}
                c={c}
                laToa={c.so === toaSon.cung}
                laHuong={c.so === huongSon.cung}
                nien={hienNien ? nien[c.so] : null}
              />
            ))}
          </div>

          <p className="pt-anh-foot">
            Nam ở trên, Bắc ở dưới. Sơn tinh · vận tinh · hướng tinh — tuvi-viet.github.io
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Pill tone={ban.phanTich.tot ? 'green' : 'red'}>{ban.phanTich.tieuDe}</Pill>
              <span style={{ color: 'var(--muted-2)', fontSize: 11.5 }}>
                đọc theo cung toạ và cung hướng
              </span>
            </div>
            <p style={{ margin: '10px 0 0', color: 'var(--text)', fontSize: 13.5, lineHeight: 1.8 }}>
              {ban.phanTich.moTa}
            </p>
          </Card>

          <div className="pt-facts">
            <div>
              <span>Hướng sơn</span>
              <strong>
                {huongSon.ten} <em>{huongSon.han}</em> · {huongSon.duong ? 'dương' : 'âm'}
              </strong>
            </div>
            <div>
              <span>Toạ sơn</span>
              <strong>
                {toaSon.ten} <em>{toaSon.han}</em> · {toaSon.duong ? 'dương' : 'âm'}
              </strong>
            </div>
            <div>
              <span>Sơn tinh nhập trung</span>
              <strong>
                {ban.sonNhapTrung} · {saoTheoSo(ban.sonNhapTrung).ten}
              </strong>
            </div>
            <div>
              <span>Hướng tinh nhập trung</span>
              <strong>
                {ban.huongNhapTrung} · {saoTheoSo(ban.huongNhapTrung).ten}
              </strong>
            </div>
          </div>

          {ban.kiemHuong ? (
            <Card
              style={{ borderColor: 'var(--red-vien)', background: 'var(--red-mo)', padding: 14 }}
            >
              <strong style={{ color: 'var(--red)', fontSize: 13 }}>
                Kiêm hướng — trục đo cách ranh giới {ban.lechRanh.toFixed(1)}°
              </strong>
              <p style={{ margin: '6px 0 0', color: 'var(--text)', fontSize: 12.8, lineHeight: 1.75 }}>
                Hướng rơi vào vùng sát ranh giới hai sơn. Các phái lập bàn xử lý trường hợp này
                khác nhau (lấy sơn gần nhất, thế quái, phân kim…), nên bàn dưới đây lập theo sơn
                gần nhất và chỉ nên đọc như một phương án tham khảo. Đo lại bằng la bàn thật hoặc
                máy toàn đạc nếu việc chọn hướng quan trọng.
              </p>
            </Card>
          ) : (
            <GhiChu>
              Trục đo nằm giữa sơn {huongSon.ten}, cách ranh giới gần nhất {ban.lechRanh.toFixed(1)}°
              — không phải kiêm hướng, bàn lập được thẳng.
            </GhiChu>
          )}
        </div>
      </div>

      <Card style={{ padding: 18 }}>
        <h4 style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--cream)' }}>
          Chín sao trong bàn
        </h4>
        <div className="pt-legend">
          {SAO.map((s) => (
            <div key={s.so} className="pt-legend-item">
              <span className={`pt-cham sao-mau-${s.so}`} aria-hidden="true" />
              <span>
                <strong className={`sao-mau-${s.so}`}>{s.so}</strong>{' '}
                <span style={{ color: 'var(--text)' }}>{s.ten}</span>{' '}
                <span style={{ color: 'var(--muted-2)' }}>({s.hanh})</span> — {s.yNghia}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <GhiChu>
        <strong style={{ color: 'var(--text)' }}>Cách đọc:</strong> trong mỗi cung, số bên trái là
        sơn tinh, số giữa là vận tinh, số bên phải là hướng tinh. Cung viền xanh là toạ (phía sau
        nhà), viền đỏ là hướng (phía trước). Bàn lập theo phái Tam Nguyên với 24 sơn; các phái khác
        (Tam Hợp, Phiên tinh, Thẩm thị biến thể) có thể cho bàn khác. Đây là công cụ học và tham
        khảo, không thay cho việc đo đạc tại nhà.
      </GhiChu>
    </div>
  );
}
