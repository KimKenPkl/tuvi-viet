import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BirthForm from './components/BirthForm';
import ChartBoard from './components/ChartBoard';
import DetailPanel from './components/DetailPanel';
import ReadingPanel from './components/ReadingPanel';
import HistoryPanel from './components/HistoryPanel';
import CompatibilityView from './components/CompatibilityView';
import NoteBox from './components/NoteBox';
import CareerOrientation from './components/CareerOrientation';
import VanHanPanel from './components/VanHanPanel';
import XemNgayPanel from './components/XemNgayPanel';
import XemTuoiPanel from './components/XemTuoiPanel';
import AiPanel from './components/AiPanel';
import { StarField, Divider } from './components/Ornaments';
import LinhVat from './components/LinhVat';
import { LienKet, chuyen, useMeta } from './lib/router';
import { docPhien, luuPhien, nguCanhTuLaSo, xoaPhien } from './lib/phien';
import {
  lapLaSo,
  vanHan,
  cungTheoTen,
  type BirthInput,
  type Cung,
  type LaSo,
} from './lib/chart';
import { luanGiai } from './lib/interpret';
import { danhSachLaSo, idLaSo, laSoSangInput, luuLaSo } from './lib/storage';

type CheDo = 'la-so' | 'luan-giai';

const NAM_NAY = new Date().getFullYear();

/**
 * Lá số mẫu: người mới phải thấy được sản phẩm trước khi chịu nhập ngày sinh.
 * Đây là "minimum path to value" — một cú bấm là có lá số đầy đủ.
 */
const LA_SO_MAU: BirthInput = {
  ten: 'Lá số mẫu',
  gioiTinh: 'Nam',
  lich: 'duong',
  ngay: '1990-05-15',
  gio: 6,
  thangNhuan: false,
  kinhDo: null,
  dungGioThat: false,
};

/** Màu nền ảnh xuất, bám theo bảng màu đang bật để ảnh không bị "lạc tông". */
function nenAnhXuat(): string {
  return document.documentElement.dataset.giaoDien === 'sang' ? '#f6f2e9' : '#0e1219';
}

/** Đọc tham số chia sẻ từ URL */
function tuUrl(): { input: BirthInput; namXem: number } | null {
  try {
    const q = new URLSearchParams(window.location.search);
    const ngay = q.get('ngay');
    if (!ngay || !/^\d{4}-\d{2}-\d{2}$/.test(ngay)) return null;
    return {
      input: {
        ten: q.get('ten') ?? '',
        gioiTinh: q.get('gt') === 'Nữ' ? 'Nữ' : 'Nam',
        lich: q.get('lich') === 'am' ? 'am' : 'duong',
        ngay,
        gio: Number(q.get('gio') ?? 2),
        thangNhuan: q.get('nhuan') === '1',
        kinhDo: null,
        dungGioThat: false,
      },
      namXem: Number(q.get('nam') ?? NAM_NAY),
    };
  } catch {
    return null;
  }
}

/** Bỏ dấu tiếng Việt để đặt tên file an toàn */
function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

export default function App() {
  const [laSo, setLaSo] = useState<LaSo | null>(null);
  const [input, setInput] = useState<BirthInput | null>(null);
  const [namXem, setNamXem] = useState(NAM_NAY);
  const [cheDo, setCheDo] = useState<CheDo>('la-so');
  const [cungChon, setCungChon] = useState<Cung | null>(null);
  const [daSaoChep, setDaSaoChep] = useState(false);
  const [moLichSu, setMoLichSu] = useState(false);
  const [moSoSanh, setMoSoSanh] = useState(false);
  const [moHuongNghiep, setMoHuongNghiep] = useState(false);
  const [moVanHan, setMoVanHan] = useState(false);
  const [moXemNgay, setMoXemNgay] = useState(false);
  const [moXemTuoi, setMoXemTuoi] = useState(false);
  const [daLuu, setDaLuu] = useState(false);
  const [dangXuatAnh, setDangXuatAnh] = useState(false);
  const [dangXuatPdf, setDangXuatPdf] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  // Lịch âm hôm nay chỉ dùng cho một chip nhỏ: nạp sau để không kéo 294 kB vào
  // đường tải đầu của trang chủ.
  const [am, setAm] = useState<ReturnType<
    typeof import('./lib/amlich')['amLichHomNay']
  > | null>(null);

  useEffect(() => {
    let huy = false;
    import('./lib/amlich')
      .then((m) => {
        if (!huy) setAm(m.amLichHomNay());
      })
      .catch(() => {
        /* không có lịch âm thì ẩn chip, không chặn trang */
      });
    return () => {
      huy = true;
    };
  }, []);

  useMeta(
    'Tử Vi Việt — lập lá số Tử Vi Đẩu Số miễn phí',
    'Lập lá số Tử Vi Việt theo cổ pháp: 12 cung, 14 chính tinh, tứ hoá, đại hạn, lưu niên. Miễn phí, chạy hoàn toàn trên trình duyệt.',
  );

  // Khôi phục từ URL khi mở trang
  useEffect(() => {
    const u = tuUrl();
    if (u) {
      try {
        setLaSo(lapLaSo(u.input));
        setInput(u.input);
        setNamXem(u.namXem);
      } catch {
        /* bỏ qua tham số hỏng */
      }
      return;
    }
    const p = docPhien();
    if (!p) return;
    try {
      setLaSo(lapLaSo(p.input));
      setInput(p.input);
      setNamXem(p.namXem);
    } catch {
      /* phiên cũ hỏng — bỏ qua */
    }
  }, []);

  // Lưu phiên để sang trang Phương Đông rồi quay lại vẫn còn lá số.
  useEffect(() => {
    if (!laSo || !input) return;
    luuPhien({ input, namXem, nguCanh: nguCanhTuLaSo(laSo) });
  }, [laSo, input, namXem]);

  // Mở modal theo ?mo= khi hub Phương Đông trỏ tới.
  useEffect(() => {
    const moTheoUrl = () => {
      const mo = new URLSearchParams(window.location.search).get('mo');
      if (!mo) return;
      if (mo === 'xay-nha') setMoXemTuoi(true);
      else if (mo === 'nghe-nghiep') setMoHuongNghiep(true);
      else if (mo === 'lich-su') setMoLichSu(true);
      else if (mo === 'xem-ngay') setMoXemNgay(true);
      else if (mo === 'van-han') setMoVanHan(true);
    };
    moTheoUrl();
    window.addEventListener('tuvi:dieu-huong', moTheoUrl);
    window.addEventListener('popstate', moTheoUrl);
    return () => {
      window.removeEventListener('tuvi:dieu-huong', moTheoUrl);
      window.removeEventListener('popstate', moTheoUrl);
    };
  }, []);

  const taoLaSo = useCallback((i: BirthInput) => {
    try {
      const ls = lapLaSo(i);
      setLaSo(ls);
      setInput(i);
      setCungChon(null);
      setCheDo('la-so');
      setDaLuu(false);
    } catch (e) {
      alert(
        'Không lập được lá số với thông tin đã nhập. Vui lòng kiểm tra lại ngày giờ sinh (đặc biệt là ngày âm lịch và tháng nhuận).',
      );
      console.error(e);
    }
  }, []);

  const vh = useMemo(() => (laSo ? vanHan(laSo, namXem) : null), [laSo, namXem]);
  const lg = useMemo(() => (laSo ? luanGiai(laSo, namXem) : null), [laSo, namXem]);
  const khoa = useMemo(() => (input ? idLaSo(input) : ''), [input]);

  const linkChiaSe = useMemo(() => {
    if (!input) return '';
    const q = new URLSearchParams({
      ngay: input.ngay,
      gio: String(input.gio),
      gt: input.gioiTinh,
      lich: input.lich,
      nam: String(namXem),
    });
    if (input.ten) q.set('ten', input.ten);
    if (input.thangNhuan) q.set('nhuan', '1');
    return `${window.location.origin}${window.location.pathname}?${q.toString()}`;
  }, [input, namXem]);

  function xoaMo() {
    if (new URLSearchParams(window.location.search).has('mo')) chuyen('/', true);
  }

  async function saoChep() {
    try {
      await navigator.clipboard.writeText(linkChiaSe);
      setDaSaoChep(true);
      setTimeout(() => setDaSaoChep(false), 2000);
    } catch {
      window.prompt('Sao chép liên kết lá số:', linkChiaSe);
    }
  }

  function luu() {
    if (!input) return;
    luuLaSo(input);
    setDaLuu(true);
    setTimeout(() => setDaLuu(false), 2400);
  }

  /**
   * Xuất ảnh lá số. Thư viện html-to-image được nạp động để không làm nặng
   * bundle chính — ai chỉ xem lá số thì không phải tải thêm ~15 kB.
   */
  async function taiAnh() {
    const node = boardRef.current;
    if (!node || !laSo) return;
    setDangXuatAnh(true);
    try {
      const { toPng } = await import('html-to-image');
      // Đầu/cuối ảnh chỉ mount lúc xuất: chờ hai nhịp vẽ để chúng kịp vào DOM.
      await new Promise<void>((xong) =>
        requestAnimationFrame(() => requestAnimationFrame(() => xong())),
      );
      const dataUrl = await toPng(node, {
        backgroundColor: nenAnhXuat(),
        pixelRatio: 2,
        cacheBust: true,
        filter: (el) => !(el as HTMLElement).classList?.contains('board-legend'),
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `la-so-${slug(laSo.ten || 'tu-vi')}-${slug(laSo.duongLich)}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      alert('Không xuất được ảnh trên trình duyệt này. Bạn có thể dùng nút In để lưu thành PDF.');
    } finally {
      setDangXuatAnh(false);
    }
  }

  /**
   * Xuất PDF: ghép lá số (hoặc phần luận giải đang mở) và ghi chú thành tệp A4.
   * jspdf và html-to-image đều nạp động — chỉ tải khi người dùng bấm nút.
   */
  async function xuatPdf() {
    if (!laSo) return;
    setDangXuatPdf(true);
    try {
      const [{ jsPDF }, { toCanvas }] = await Promise.all([
        import('jspdf'),
        import('html-to-image'),
      ]);
      const nodes = [boardRef.current, readingRef.current, noteRef.current].filter(
        (n): n is HTMLDivElement => Boolean(n),
      );
      if (!nodes.length) throw new Error('Không có nội dung để xuất');

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const rongTrang = pdf.internal.pageSize.getWidth();
      const caoTrang = pdf.internal.pageSize.getHeight();
      const le = 10;
      const rongNoiDung = rongTrang - le * 2;
      let daCoTrang = false;

      for (const node of nodes) {
        const canvas = await toCanvas(node, {
          backgroundColor: nenAnhXuat(),
          pixelRatio: 2,
          cacheBust: true,
          filter: (el) => !(el as HTMLElement).classList?.contains('board-legend'),
        });
        if (!canvas.width || !canvas.height) continue;

        const pxTrenMm = canvas.width / rongNoiDung;
        const caoDung = caoTrang - le * 2;
        let cat = 0;
        while (cat < canvas.height) {
          const caoCat = Math.min(Math.round(caoDung * pxTrenMm), canvas.height - cat);
          const mieng = document.createElement('canvas');
          mieng.width = canvas.width;
          mieng.height = caoCat;
          const ctx = mieng.getContext('2d');
          if (!ctx) break;
          ctx.fillStyle = '#080a11';
          ctx.fillRect(0, 0, mieng.width, mieng.height);
          ctx.drawImage(canvas, 0, cat, canvas.width, caoCat, 0, 0, canvas.width, caoCat);

          if (daCoTrang) pdf.addPage();
          pdf.addImage(
            mieng.toDataURL('image/jpeg', 0.92),
            'JPEG',
            le,
            le,
            rongNoiDung,
            caoCat / pxTrenMm,
          );
          daCoTrang = true;
          cat += caoCat;
        }
      }

      if (!daCoTrang) throw new Error('Không có nội dung để xuất');
      pdf.save(`tu-vi-${slug(laSo.ten || 'la-so')}-${namXem}.pdf`);
    } catch (e) {
      console.error(e);
      alert(
        'Không xuất được PDF trên trình duyệt này. Bạn có thể dùng nút In rồi chọn "Lưu thành PDF".',
      );
    } finally {
      setDangXuatPdf(false);
    }
  }

  return (
    <>
      <header className="site-head">
        <LienKet className="brand" to="/">
          <LinhVat size={40} className="brand-logo" />
          <span className="brand-text">
            <strong>Tử Vi Việt</strong>
            <em>Lá số theo cổ pháp</em>
          </span>
        </LienKet>
        <nav className="head-nav">
          <button onClick={() => setMoHuongNghiep(true)}>Định hướng nghề nghiệp</button>
          {laSo && <button onClick={() => setMoVanHan(true)}>Vận hạn</button>}
          <button onClick={() => setMoXemNgay(true)}>Xem ngày</button>
          <button onClick={() => setMoXemTuoi(true)}>Xây nhà/Cưới hỏi</button>
          <LienKet to="/phuong-dong">Phương Đông</LienKet>
          <button onClick={() => setMoLichSu(true)}>Lịch sử</button>
          {laSo && (
            <>
              <button className={cheDo === 'la-so' ? 'on' : ''} onClick={() => setCheDo('la-so')}>
                Lá số
              </button>
              <button
                className={cheDo === 'luan-giai' ? 'on' : ''}
                onClick={() => setCheDo('luan-giai')}
              >
                Luận giải
              </button>
              <button
                className="btn-ai"
                title="Hỏi AI về lá số này (cần API key của bạn)"
                onClick={() => {
                  setCheDo('luan-giai');
                  requestAnimationFrame(() =>
                    requestAnimationFrame(() =>
                      document
                        .getElementById('ai-panel')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                    ),
                  );
                }}
              >
                Hỏi AI
              </button>
            </>
          )}
          {laSo && (
            <button
              className="btn-new"
              onClick={() => {
                setLaSo(null);
                setInput(null);
                setCungChon(null);
                xoaPhien();
              }}
            >
              Lá số mới
            </button>
          )}
        </nav>
      </header>

      <main className="site-main">
        {!laSo && (
          <>
            <section className="hero">
              <StarField />
              <p className="eyebrow">Tử Vi Việt · Lá số theo cổ pháp</p>
              <h1>
                Lá số Tử Vi của bạn,
                <br />
                <span>an sao trong 10 giây.</span>
              </h1>
              <p className="hero-desc">
                12 cung, 14 chính tinh, tứ hoá, đại hạn và lưu niên — an theo cổ pháp, đọc bằng
                tiếng Việt. Miễn phí, không cần tài khoản, ngày sinh không rời khỏi máy bạn.
              </p>

              <div className="hero-actions">
                <button
                  className="btn-primary"
                  onClick={() => {
                    taoLaSo(LA_SO_MAU);
                    const giamChuyenDong = window.matchMedia(
                      '(prefers-reduced-motion: reduce)',
                    ).matches;
                    requestAnimationFrame(() =>
                      requestAnimationFrame(() =>
                        document.getElementById('ket-qua')?.scrollIntoView({
                          behavior: giamChuyenDong ? 'auto' : 'smooth',
                          block: 'start',
                        }),
                      ),
                    );
                  }}
                >
                  Xem lá số mẫu
                </button>
                <span className="hero-actions-note">chưa cần nhập ngày sinh</span>
              </div>

              <div className="hero-stats">
                <div>
                  <strong>12</strong>
                  <span>cung</span>
                </div>
                <div>
                  <strong>14</strong>
                  <span>chính tinh</span>
                </div>
                <div>
                  <strong>100+</strong>
                  <span>phụ tinh</span>
                </div>
                <div>
                  <strong>0đ</strong>
                  <span>trọn đời</span>
                </div>
              </div>
            </section>

            <section className="form-wrap">
              <BirthForm onSubmit={taoLaSo} namMacDinh={NAM_NAY} />
            </section>

            {(() => {
              const ganDay = danhSachLaSo().slice(0, 3);
              if (!ganDay.length) return null;
              return (
                <section className="recent">
                  <div className="recent-head">
                    <h2>Lá số gần đây</h2>
                    <button className="btn-ghost" onClick={() => setMoLichSu(true)}>
                      Xem tất cả
                    </button>
                  </div>
                  <div className="recent-grid">
                    {ganDay.map((ls) => (
                      <button
                        key={ls.id}
                        className="recent-card"
                        onClick={() => taoLaSo(laSoSangInput(ls))}
                      >
                        <strong>{ls.nhan || ls.ten || 'Không tên'}</strong>
                        <span>
                          {ls.gioiTinh} · {ls.ngay.split('-').reverse().join('/')} ·{' '}
                          {ls.lich === 'am' ? 'âm lịch' : 'dương lịch'}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })()}

            <Divider className="section-divider" />

            <section className="features">
              <article>
                <h3>An sao chuẩn cổ pháp</h3>
                <p>
                  Dùng engine <code>iztro</code> (MIT) đã kiểm chứng qua hàng nghìn lá số, kèm bộ
                  test hồi quy cho tháng nhuận, tiết khí và biên giới Lập Xuân.
                </p>
              </article>
              <article>
                <h3>Thuật ngữ Việt chuẩn</h3>
                <p>
                  Toàn bộ tên sao, cung, độ sáng (Miếu/Vượng/Đắc/Hãm) và tứ hoá (Lộc/Quyền/Khoa/Kỵ)
                  được viết lại cho người Việt — không dùng bản dịch máy.
                </p>
              </article>
              <article>
                <h3>Luận giải có căn cứ</h3>
                <p>
                  Nhận định bám theo dữ liệu thật của lá số: chính tinh, độ sáng, tứ hoá, tam
                  phương tứ chính và cách cục. Không hù doạ, không hứa hẹn tuyệt đối.
                </p>
              </article>
              <article>
                <h3>Lưu lại và đối chiếu</h3>
                <p>
                  Cất lá số kèm ghi chú riêng trên máy, mở lại bất cứ lúc nào, và đối chiếu hai lá
                  số để thấy mức tương hợp cùng những điểm cần bàn rõ trước.
                </p>
              </article>
            </section>
          </>
        )}

        {laSo && vh && (
          <>
            <div className="chart-toolbar" id="ket-qua">
              <div className="chart-title">
                <h2>{laSo.ten || 'Lá số Tử Vi'}</h2>
                <p>
                  {laSo.gioiTinh} · sinh {laSo.gio.ten} ngày {laSo.duongLich} · {laSo.cuc}
                </p>
              </div>
              <div className="chart-actions">
                <label className="nam-xem">
                  <span>Năm xem</span>
                  <input
                    type="number"
                    value={namXem}
                    min={1900}
                    max={2200}
                    onChange={(e) => setNamXem(Number(e.target.value) || NAM_NAY)}
                  />
                </label>
                {am && (
                  <span
                    className={`am-chip ${am.hoangDao ? 'tot' : 'xau'}`}
                    title={`Hôm nay: ${am.canChiNam} · ${am.canChiThang} · ${am.nhan}`}
                  >
                    <b>
                      Âm {am.ngay}/{am.thang}
                      {am.nhuan ? ' nhuận' : ''}
                    </b>
                    <em>{am.canChiNgay}</em>
                    <i>Trực {am.truc}</i>
                  </span>
                )}
                <button className="btn-ghost" onClick={luu}>
                  {daLuu ? 'Đã lưu ✓' : 'Lưu lá số'}
                </button>
                <button className="btn-ghost" onClick={() => setMoSoSanh(true)}>
                  Đối chiếu
                </button>
                <button className="btn-ghost" onClick={taiAnh} disabled={dangXuatAnh}>
                  {dangXuatAnh ? 'Đang xuất…' : 'Tải ảnh'}
                </button>
                <button className="btn-ghost" onClick={saoChep}>
                  {daSaoChep ? 'Đã chép ✓' : 'Chia sẻ'}
                </button>
                <button className="btn-ghost" onClick={xuatPdf} disabled={dangXuatPdf}>
                  {dangXuatPdf ? 'Đang xuất…' : 'Xuất PDF'}
                </button>
                <button className="btn-ghost" onClick={() => window.print()}>
                  In
                </button>
              </div>
            </div>

            {cheDo === 'la-so' && (
              <>
                <div
                  ref={boardRef}
                  className={`board-xuat${dangXuatAnh ? ' dang-xuat' : ''}`}
                >
                  {dangXuatAnh && (
                    <div className="share-head">
                      <LinhVat size={36} className="share-logo" />
                      <span className="share-ten">
                        <strong>Tử Vi Việt</strong>
                        <em>Lá số theo cổ pháp</em>
                      </span>
                    </div>
                  )}
                  <ChartBoard
                    laSo={laSo}
                    vanHan={vh}
                    namXem={namXem}
                    cungDangChon={cungChon}
                    onChon={setCungChon}
                  />
                  {dangXuatAnh && (
                    <div className="share-foot">
                      <span>Tử Vi Việt · kimkenpkl.github.io/tuvi-viet</span>
                      <span>Lập miễn phí, ngay trên trình duyệt</span>
                    </div>
                  )}
                </div>
                <p className="board-hint">
                  Nhấn vào một cung để xem chi tiết các sao, ý nghĩa cung và tam phương tứ chính.
                </p>
                <div className="quick-menh">
                  {(() => {
                    const menh = cungTheoTen(laSo, 'Mệnh');
                    if (!menh) return null;
                    return (
                      <div className="quick-card">
                        <h3>
                          Cung Mệnh — {menh.can} {menh.chi}
                        </h3>
                        <p>
                          Chính tinh:{' '}
                          <b>
                            {menh.chinhTinh.length
                              ? menh.chinhTinh
                                  .map(
                                    (s) =>
                                      `${s.ten}${s.doSang ? ` (${s.doSang})` : ''}${s.tuHoa ? ` [${s.tuHoa}]` : ''}`,
                                  )
                                  .join(', ')
                              : 'Vô chính diệu'}
                          </b>
                        </p>
                        <button className="btn-ghost" onClick={() => setCheDo('luan-giai')}>
                          Xem luận giải đầy đủ →
                        </button>
                      </div>
                    );
                  })()}
                </div>
                <div ref={noteRef}>
                  <NoteBox id={khoa} />
                </div>
              </>
            )}

            {cheDo === 'luan-giai' && lg && (
              <div ref={readingRef}>
                <ReadingPanel luanGiai={lg} namXem={namXem} />
                <AiPanel laSo={laSo} namXem={namXem} chartId={khoa} />
              </div>
            )}
          </>
        )}
      </main>

      <footer className="site-foot">
        <p>
          <b>Tử Vi Việt</b> — mã nguồn mở, engine an sao <code>iztro</code> (MIT). Nội dung luận
          giải do dự án tự biên soạn bằng tiếng Việt. Dữ liệu bạn nhập và ghi chú chỉ nằm trong trình
          duyệt của bạn.
        </p>
        <p className="muted">
          Công cụ tham khảo, không phải lời khuyên y tế / pháp lý / tài chính. Không có lá số nào đủ
          để quyết định thay bạn.
        </p>
      </footer>

      {cungChon && <DetailPanel cung={cungChon} laSo={laSo!} onClose={() => setCungChon(null)} />}

      {moLichSu && (
        <HistoryPanel
          onLoad={taoLaSo}
          onClose={() => {
            setMoLichSu(false);
            xoaMo();
          }}
        />
      )}

      {moSoSanh && input && (
        <CompatibilityView
          laSoChinh={laSo!}
          inputChinh={input}
          onClose={() => setMoSoSanh(false)}
        />
      )}

      {moHuongNghiep && (
        <CareerOrientation
          onClose={() => {
            setMoHuongNghiep(false);
            xoaMo();
          }}
        />
      )}
      {moVanHan && laSo && <VanHanPanel laSo={laSo} onClose={() => setMoVanHan(false)} />}
      {moXemNgay && <XemNgayPanel onClose={() => setMoXemNgay(false)} />}
      {moXemTuoi && (
        <XemTuoiPanel
          onClose={() => {
            setMoXemTuoi(false);
            xoaMo();
          }}
        />
      )}
    </>
  );
}
