import { useMemo, useState } from 'react';
import type { NguCanh } from '../lib/phien';
import { xemNgayTotXau } from '../lib/canChi';
import { tietKhiCuaNgay, tietKhiKeTiep, tietKhiTrongNam } from '../lib/tietKhi';
import { Card, Field, GhiChu, Pill, inputStyle } from './dp-ui';

const pad = (n: number) => String(n).padStart(2, '0');
const homNay = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const THU = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/** Lịch Can Chi: tra một ngày, giờ hoàng đạo, việc nên/kiêng và cả tháng. */
export default function LichCanChiView({ nguCanh: _nguCanh }: { nguCanh?: NguCanh | null }) {
  const [ngay, setNgay] = useState(homNay());
  const [thangXem, setThangXem] = useState(() => {
    const d = new Date();
    return { nam: d.getFullYear(), thang: d.getMonth() };
  });

  const date = new Date(`${ngay}T00:00:00`);
  const hopLe = !Number.isNaN(date.getTime());
  const kq = useMemo(() => (hopLe ? xemNgayTotXau(date) : null), [ngay, hopLe]);
  const tietKhi = useMemo(() => (hopLe ? tietKhiCuaNgay(date) : null), [ngay, hopLe]);
  const chuKyTiet = useMemo(() => (hopLe ? tietKhiKeTiep(date) : null), [ngay, hopLe]);
  const dsTietKhi = useMemo(() => (hopLe ? tietKhiTrongNam(date.getFullYear()) : []), [ngay, hopLe]);

  const o = useMemo(() => {
    const dau = new Date(thangXem.nam, thangXem.thang, 1);
    const soNgay = new Date(thangXem.nam, thangXem.thang + 1, 0).getDate();
    const lech = (dau.getDay() + 6) % 7;
    const ds: { ngay: number; duong: Date; info: ReturnType<typeof xemNgayTotXau> | null }[] = [];
    for (let i = 0; i < lech; i += 1) ds.push({ ngay: 0, duong: dau, info: null });
    for (let d = 1; d <= soNgay; d += 1) {
      const duong = new Date(thangXem.nam, thangXem.thang, d);
      ds.push({ ngay: d, duong, info: xemNgayTotXau(duong) });
    }
    return ds;
  }, [thangXem]);

  function doiThang(delta: number) {
    setThangXem((t) => {
      const d = new Date(t.nam, t.thang + delta, 1);
      return { nam: d.getFullYear(), thang: d.getMonth() };
    });
  }

  function chonNgay(d: Date) {
    setNgay(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
        Lịch Can Chi: chọn một ngày để xem Can Chi ngày — tháng — năm, 12 Trực, 24 tiết khí, giờ
        Hoàng Đạo và việc nên kiêng. Bảng bên dưới là lịch cả tháng, ngày Hoàng Đạo tô xanh.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <Field label="Chọn ngày dương lịch">
          <input
            type="date"
            style={inputStyle}
            value={ngay}
            onChange={(e) => {
              setNgay(e.target.value);
              const d = new Date(`${e.target.value}T00:00:00`);
              if (!Number.isNaN(d.getTime())) setThangXem({ nam: d.getFullYear(), thang: d.getMonth() });
            }}
          />
        </Field>
        <Field label="Hoặc chọn nhanh">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-ghost" type="button" onClick={() => chonNgay(new Date())}>
              Hôm nay
            </button>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => chonNgay(new Date(Date.now() + 86400000))}
            >
              Ngày mai
            </button>
          </div>
        </Field>
      </div>

      {kq && (
        <>
          <Card
            style={{
              padding: 22,
              background: 'linear-gradient(180deg, var(--gold-mo), transparent)',
              border: '1px solid var(--line-strong)',
            }}
          >
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
              {kq.duongLich} dương lịch · {kq.amLich} âm lịch
            </p>
            <h3
              style={{
                margin: '8px 0 4px',
                fontSize: 30,
                color: 'var(--gold)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {kq.canChi}
            </h3>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13.5 }}>
              Tháng {kq.canChiThang} · Năm {kq.canChiNam} · Trực {kq.truc}
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <Pill tone={kq.hoangDao ? 'green' : 'red'}>
                {kq.hoangDao ? 'Ngày Hoàng Đạo' : 'Ngày Hắc Đạo'}
              </Pill>
              <Pill tone="muted">{kq.danhGia}</Pill>
              {tietKhi && <Pill tone="gold">Tiết {tietKhi.ten}</Pill>}
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            <Card>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--green)' }}>Việc nên làm</h4>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text)', fontSize: 13.5, lineHeight: 1.8 }}>
                {kq.tot.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--red)' }}>Việc nên tránh</h4>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--text)', fontSize: 13.5, lineHeight: 1.8 }}>
                {kq.xau.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Card>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px', fontSize: 14 }}>Giờ Hoàng Đạo</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
              {kq.gioHoangDao.map((g) => (
                <div
                  key={g.gio}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 10,
                    border: '1px solid var(--green-vien)',
                    background: 'var(--green-mo)',
                  }}
                >
                  <strong style={{ display: 'block', color: 'var(--green)', fontSize: 13.5 }}>
                    Giờ {g.gioChi}
                  </strong>
                  <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>
                    {g.gio} · {g.than}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {hopLe && tietKhi && chuKyTiet && (
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 8,
            }}
          >
            <h4 style={{ margin: 0, fontSize: 14 }}>Tiết khí năm {date.getFullYear()}</h4>
            <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>
              Đang: <strong style={{ color: 'var(--gold-2)' }}>{tietKhi.ten}</strong>
              {chuKyTiet.conLai > 0
                ? ` · còn ${chuKyTiet.conLai} ngày tới ${chuKyTiet.keTiep.ten}`
                : ''}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
            {dsTietKhi.map((t) => {
              const chon = t.ngay === tietKhi.ngay;
              return (
                <button
                  key={t.ngay}
                  type="button"
                  title={`${t.ten} · ${t.moTa}`}
                  onClick={() => chonNgay(new Date(`${t.ngay}T00:00:00`))}
                  style={{
                    flex: '0 0 auto',
                    minWidth: 88,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    padding: '8px 10px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    border: `1px solid ${chon ? 'var(--line-strong)' : 'var(--line)'}`,
                    background: chon ? 'var(--gold-mo)' : 'var(--glass-1)',
                  }}
                >
                  <span style={{ fontSize: 12, color: chon ? 'var(--gold-2)' : 'var(--cream)' }}>
                    {t.ten}
                  </span>
                  <span style={{ fontSize: 10.5, color: 'var(--muted-2)' }}>
                    {t.ngayTrongThang}/{t.thang} · {t.loai === 'tiet' ? 'tiết' : 'khí'}
                  </span>
                </button>
              );
            })}
          </div>

          <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 12.5, lineHeight: 1.65 }}>
            <strong style={{ color: 'var(--text)' }}>{tietKhi.ten}</strong> — {tietKhi.moTa} Bắt đầu{' '}
            {tietKhi.gio} ngày {tietKhi.ngayTrongThang}/{tietKhi.thang}.
          </p>
        </div>
      )}

      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 10,
            flexWrap: 'wrap',
          }}
        >
          <h4 style={{ margin: 0, fontSize: 14 }}>
            Lịch tháng {thangXem.thang + 1}/{thangXem.nam}
          </h4>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-ghost" type="button" onClick={() => doiThang(-1)} aria-label="Tháng trước">
              ←
            </button>
            <button
              className="btn-ghost"
              type="button"
              onClick={() => {
                const d = new Date();
                setThangXem({ nam: d.getFullYear(), thang: d.getMonth() });
              }}
            >
              Tháng này
            </button>
            <button className="btn-ghost" type="button" onClick={() => doiThang(1)} aria-label="Tháng sau">
              →
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {THU.map((t) => (
            <div
              key={t}
              style={{
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--muted-2)',
                padding: '4px 0',
                letterSpacing: '0.06em',
              }}
            >
              {t}
            </div>
          ))}
          {o.map((c, i) => {
            if (!c.ngay || !c.info) return <div key={`e${i}`} />;
            const chon = `${c.duong.getFullYear()}-${pad(c.duong.getMonth() + 1)}-${pad(c.duong.getDate())}` === ngay;
            return (
              <button
                key={chon ? `d${c.ngay}` : `d${c.ngay}`}
                type="button"
                onClick={() => chonNgay(c.duong)}
                title={`${c.info.duongLich} · ${c.info.canChi} · Trực ${c.info.truc}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  padding: '6px 2px',
                  minHeight: 58,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  border: `1px solid ${chon ? 'var(--line-strong)' : 'var(--line)'}`,
                  background: chon
                    ? 'var(--gold-mo)'
                    : c.info.hoangDao
                      ? 'var(--green-mo)'
                      : 'var(--sheen-0)',
                }}
              >
                <span style={{ fontSize: 14, color: chon ? 'var(--gold-2)' : 'var(--cream)' }}>
                  {c.ngay}
                </span>
                <span style={{ fontSize: 10, color: c.info.hoangDao ? 'var(--green)' : 'var(--muted-2)' }}>
                  {c.info.amLich.split('/')[0]}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    color: 'var(--muted-2)',
                    lineHeight: 1.2,
                    textAlign: 'center',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.info.canChi.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <GhiChu>
        <strong style={{ color: 'var(--text)' }}>Lưu ý:</strong> Can Chi và 12 Trực tính theo lịch
        vạn niên Việt Nam (múi giờ 7). Ngày Hoàng Đạo / Hắc Đạo là cách chọn ngày theo 12 Trực, chỉ
        nên dùng làm tham khảo — việc lớn còn phải xét tuổi, giờ và hoàn cảnh thực tế.
      </GhiChu>
    </div>
  );
}
