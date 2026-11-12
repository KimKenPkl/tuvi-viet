import { useEffect, useMemo, useRef, useState } from 'react';
import { CHI } from '../lib/amlich';
import {
  CUNG,
  SAO,
  SON,
  banNam,
  lapBanPhiTinh,
  saoNam,
  saoTheoSo,
  sonTheoDo,
  type CungPhiTinh,
} from '../lib/phiTinh';
import { bonLopThoiGian, type KieuThang, type LopThoiGian } from '../lib/phiTinhThoiGian';
import { docHuongChon } from '../lib/phiTinhLuu';
import { lapBanTheQuai, type BanTheQuai } from '../lib/theQuai';
import { slugTen, xuatNodePdf, xuatNodePng } from '../lib/xuatAnh';
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

/** Chín cung theo đúng thứ tự vẽ, tính một lần lúc nạp module. */
const CUNG_VE = [...CUNG].sort((a, b) => a.viTri - b.viTri);

/** Khung giờ của 12 chi, chỉ để hiện trong ô chọn. */
const KHUNG_GIO = [
  '23–01',
  '01–03',
  '03–05',
  '05–07',
  '07–09',
  '09–11',
  '11–13',
  '13–15',
  '15–17',
  '17–19',
  '19–21',
  '21–23',
] as const;

const TEN_LOP: Record<LopThoiGian['loai'], string> = {
  nam: 'Niên tinh',
  thang: 'Nguyệt tinh',
  ngay: 'Nhật tinh',
  gio: 'Thời tinh',
};

/** Ngày hôm nay dạng yyyy-mm-dd theo giờ máy. */
function homNay(): string {
  const d = new Date();
  const thang = String(d.getMonth() + 1).padStart(2, '0');
  const ngayTrongThang = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${thang}-${ngayTrongThang}`;
}

/** Chuỗi yyyy-mm-dd thành Date đúng ngày, đặt 12:00 để không lệch múi giờ. */
function ngayTuChuoi(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

/** Chỉ số giờ Tý…Hợi của thời điểm hiện tại. */
function gioHienTai(): number {
  return Math.floor(((new Date().getHours() + 1) % 24) / 2);
}

/** Một bàn sao thời gian thu nhỏ: 3×3, ô giữa là sao nhập trung. */
function BangLop({ lop }: { lop: LopThoiGian }) {
  return (
    <div className="pst-the">
      <div className="pst-the-head">
        <strong>{TEN_LOP[lop.loai]}</strong>
        <span className={`pst-trung sao-mau-${lop.sao}`} title={`Sao ${lop.sao} nhập trung`}>
          {lop.sao}
        </span>
      </div>
      <p className="pst-the-nhan">{lop.nhan}</p>
      <div className="pst-ban" role="img" aria-label={`Bàn ${TEN_LOP[lop.loai].toLowerCase()}`}>
        {CUNG_VE.map((c) => (
          <span
            key={c.so}
            className={`pst-o${c.so === 5 ? ' is-trung' : ''} sao-mau-${lop.ban[c.so]}`}
          >
            {lop.ban[c.so]}
          </span>
        ))}
      </div>
      <p className="pst-the-ghi">{lop.ghiChu}</p>
    </div>
  );
}

/** Bàn thế quái thu nhỏ: mỗi ô hai số, trên là sơn tinh, dưới là hướng tinh. */
function BangTheQuai({ ban }: { ban: BanTheQuai }) {
  return (
    <div className="pst-theq-luoi" role="img" aria-label="Bàn thế quái">
      {ban.cung.map((c) => (
        <span key={c.so} className={`pst-theq-o${c.so === 5 ? ' is-trung' : ''}`}>
          <b className={`sao-mau-${c.son}`}>{c.son}</b>
          <i className={`sao-mau-${c.huongSao}`}>{c.huongSao}</i>
        </span>
      ))}
    </div>
  );
}

export default function PhiTinhView() {
  const [nam, setNam] = useState(() => Math.min(NAM_CUOI, Math.max(NAM_DAU, NAM_NAY)));
  const [huong, setHuong] = useState(180);
  const [hienNien, setHienNien] = useState(false);
  const [dangXuat, setDangXuat] = useState<'' | 'png' | 'pdf' | 'tg'>('');
  const [loiXuat, setLoiXuat] = useState('');

  // Khối bốn lớp sao thời gian: ngày, giờ và cách chia tháng.
  const [ngay, setNgay] = useState(homNay);
  const [gio, setGio] = useState(gioHienTai);
  const [kieuThang, setKieuThang] = useState<KieuThang>('tiet-khi');

  const vungAnh = useRef<HTMLDivElement>(null);
  const vungThoiGian = useRef<HTMLDivElement>(null);

  // Hướng do trang la bàn chuyển sang. Đọc trong effect để StrictMode không
  // "ăn" mất giá trị ở lần chạy thử thứ nhất.
  useEffect(() => {
    const v = docHuongChon();
    if (v !== null) setHuong(Math.round(v * 2) / 2);
  }, []);

  const ban = useMemo(() => lapBanPhiTinh(nam, huong), [nam, huong]);
  const nien = useMemo(() => banNam(nam), [nam]);
  const theQuai = useMemo(() => lapBanTheQuai(nam, huong), [nam, huong]);
  const ngayChon = useMemo(() => ngayTuChuoi(ngay), [ngay]);
  const bonLop = useMemo(
    () => bonLopThoiGian(ngayChon, gio, kieuThang),
    [ngayChon, gio, kieuThang],
  );
  const huongSon = ban.huongSon;
  const toaSon = ban.toaSon;

  async function xuat(kieu: 'png' | 'pdf' | 'tg') {
    const node = kieu === 'tg' ? vungThoiGian.current : vungAnh.current;
    if (!node) return;
    setDangXuat(kieu);
    setLoiXuat('');
    try {
      const goc = `phi-tinh-${ban.nam}-${slugTen(`${huongSon.ten}-${ban.huongDo}`)}`;
      if (kieu === 'png') await xuatNodePng(node, `${goc}.png`);
      else if (kieu === 'pdf') await xuatNodePdf(node, `${goc}.pdf`);
      else await xuatNodePng(node, `${goc}-bon-lop-thoi-gian.png`);
    } catch (e) {
      console.error(e);
      setLoiXuat('Trình duyệt không xuất được tệp. Bạn có thể chụp màn hình thay thế.');
    } finally {
      setDangXuat('');
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
        <button
          className="btn-ghost"
          type="button"
          onClick={() => xuat('png')}
          disabled={dangXuat !== ''}
        >
          {dangXuat === 'png' ? 'Đang xuất…' : 'Xuất ảnh PNG'}
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={() => xuat('pdf')}
          disabled={dangXuat !== ''}
        >
          {dangXuat === 'pdf' ? 'Đang xuất…' : 'Xuất PDF'}
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
            <>
              <Card
                style={{ borderColor: 'var(--red-vien)', background: 'var(--red-mo)', padding: 14 }}
              >
                <strong style={{ color: 'var(--red)', fontSize: 13 }}>
                  Kiêm hướng — trục đo cách ranh giới {ban.lechRanh.toFixed(1)}°
                </strong>
                <p style={{ margin: '6px 0 0', color: 'var(--text)', fontSize: 12.8, lineHeight: 1.75 }}>
                  Hướng rơi vào vùng sát ranh giới hai sơn. Các phái lập bàn xử lý trường hợp này
                  khác nhau (lấy sơn gần nhất, thế quái, phân kim…), nên bàn phía trên lập theo sơn
                  gần nhất và chỉ nên đọc như một phương án tham khảo. Đo lại bằng la bàn thật hoặc
                  máy toàn đạc nếu việc chọn hướng quan trọng.
                </p>
              </Card>

              {theQuai && (
                <Card style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Pill tone="gold">Bàn thế quái</Pill>
                    <span style={{ color: 'var(--muted-2)', fontSize: 11.5 }}>
                      {toaSon.ten} kiêm {theQuai.kiemToa?.ten ?? '—'} · {huongSon.ten} kiêm{' '}
                      {theQuai.kiemHuongSon?.ten ?? '—'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      marginTop: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <BangTheQuai ban={theQuai} />
                    <div style={{ flex: '1 1 170px', minWidth: 160 }}>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.7, color: 'var(--text)' }}>
                        Sơn tinh nhập trung {theQuai.sonThe} · hướng tinh nhập trung{' '}
                        {theQuai.huongThe}.
                      </p>
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: 12.5,
                          lineHeight: 1.7,
                          color: 'var(--muted)',
                        }}
                      >
                        Hạ quái dùng {theQuai.sonHaQuai} và {theQuai.huongHaQuai}.
                        {theQuai.khongDoi
                          ? ' Thế tinh trùng sao hạ quái, tức "tạm không thay" — hai bàn giống nhau.'
                          : ' Thế tinh khác sao hạ quái nên hai bàn khác nhau.'}
                      </p>
                      <p
                        style={{
                          margin: '6px 0 0',
                          fontSize: 11.8,
                          lineHeight: 1.65,
                          color: 'var(--muted-2)',
                        }}
                      >
                        Lối lấy thế tinh của sơn kiêm cho ra {theQuai.sonTheKiem} /{' '}
                        {theQuai.huongTheKiem}.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          ) : (
            <GhiChu>
              Trục đo nằm giữa sơn {huongSon.ten}, cách ranh giới gần nhất {ban.lechRanh.toFixed(1)}°
              — không phải kiêm hướng, bàn lập được thẳng.
            </GhiChu>
          )}
        </div>
      </div>

      <Card style={{ padding: 18 }}>
        <div
          style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 4 }}
        >
          <h4 style={{ margin: 0, fontSize: 14, color: 'var(--cream)' }}>Bốn lớp sao thời gian</h4>
          <span style={{ color: 'var(--muted-2)', fontSize: 11.5 }}>
            nguyệt tinh · nhật tinh · thời tinh
          </span>
        </div>
        <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>
          Bàn phía trên lập theo vận nhập trạch. Bốn bàn dưới đây là sao của phái Tử Bạch cho một
          ngày giờ bất kỳ: năm, tháng, ngày và giờ.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 14,
          }}
        >
          <Field label="Ngày" hint="Tính theo giờ Việt Nam (UTC+7).">
            <input
              type="date"
              min="1900-01-01"
              max="2100-12-31"
              value={ngay}
              onChange={(e) => {
                if (e.target.value) setNgay(e.target.value);
              }}
              style={inputStyle}
            />
          </Field>

          <Field label="Giờ" hint="Giờ Tý tính từ 23:00; ở đây giờ Tý thuộc chính ngày đang chọn.">
            <select value={gio} onChange={(e) => setGio(Number(e.target.value))} style={inputStyle}>
              {CHI.map((c, i) => (
                <option key={c} value={i}>
                  Giờ {c} · {KHUNG_GIO[i]}h
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Cách chia tháng"
            hint="Tiết khí: Lập Xuân khởi tháng Giêng. Âm lịch: theo tháng âm."
          >
            <select
              value={kieuThang}
              onChange={(e) => setKieuThang(e.target.value as KieuThang)}
              style={inputStyle}
            >
              <option value="tiet-khi">Tháng tiết khí (Lập Xuân)</option>
              <option value="am-lich">Tháng âm lịch</option>
            </select>
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => xuat('tg')}
            disabled={dangXuat !== ''}
          >
            {dangXuat === 'tg' ? 'Đang xuất…' : 'Xuất ảnh bốn bàn'}
          </button>
        </div>

        <div ref={vungThoiGian} className="pst-hop">
          <div className="pst-luoi">
            {bonLop.map((l) => (
              <BangLop key={l.loai} lop={l} />
            ))}
          </div>
          <p className="pst-chan">
            Ngày {ngay.split('-').reverse().join('/')} · giờ {CHI[gio]} ·{' '}
            {kieuThang === 'tiet-khi' ? 'tháng tiết khí' : 'tháng âm lịch'} — tuvi-viet.github.io
          </p>
        </div>

        <GhiChu>
          <strong style={{ color: 'var(--text)' }}>Ba lưu ý khi đọc:</strong> niên tinh đổi ở Lập
          Xuân và luôn phi thuận; nguyệt tinh lùi một sao mỗi tháng rồi phi thuận; nhật tinh và thời
          tinh lấy ngày Giáp Tý gần tiết khí mốc nhất, nửa dương phi thuận, nửa âm phi nghịch. Giờ
          Tý muộn (23:00–24:00) theo lệ cổ thuộc ngày hôm sau, ở đây tính cho ngày đang chọn. Các
          phái còn lệch nhau ở chỗ dùng tháng tiết khí hay tháng âm lịch, nên đổi qua lại để đối
          chiếu.
        </GhiChu>
      </Card>

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
