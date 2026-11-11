/**
 * Chuyển lá số thành bản mô tả ngắn, đủ căn cứ để model luận mà không cần
 * tự an sao. Mọi dữ liệu ở đây lấy từ engine `iztro` đã tính trong `chart.ts`.
 */

import {
  cungTheoTen,
  tamPhuongTuChinh,
  tuHoa,
  vanHan,
  type Cung,
  type LaSo,
  type Sao,
} from '../chart';

const TOI_DA_PHU_TINH = 10;

function moTaSao(s: Sao): string {
  const phan = [s.ten];
  if (s.doSang) phan.push(s.doSang);
  if (s.tuHoa) phan.push(`[${s.tuHoa}]`);
  return phan.join(' ');
}

function gioiHan(ds: string[], n: number): string {
  if (ds.length <= n) return ds.join(', ');
  return `${ds.slice(0, n).join(', ')} … (+${ds.length - n} sao khác)`;
}

/** Một cung: chính tinh + phụ tinh + đại hạn. */
export function moTaCung(c: Cung): string {
  const chinh = c.chinhTinh.length
    ? c.chinhTinh.map(moTaSao).join(', ')
    : 'Vô chính diệu';
  const phu = c.phuTinh.length
    ? gioiHan(c.phuTinh.map(moTaSao), TOI_DA_PHU_TINH)
    : 'không có';
  const nhan = c.laThan ? ' [Thân cư]' : '';
  return `${c.ten} (${c.can} ${c.chi})${nhan}: chính tinh ${chinh}; phụ tinh ${phu}; đại hạn ${c.daiHan.tuoiBatDau}–${c.daiHan.tuoiKetThuc} tuổi`;
}

/** Tóm tắt toàn lá số theo dạng văn bản gọn cho prompt. */
export function tomTatLaSo(laSo: LaSo, namXem: number): string {
  const vh = vanHan(laSo, namXem);
  const tenCung = (index: number) => laSo.cung.find((c) => c.index === index)?.ten ?? '—';
  const menh = cungTheoTen(laSo, 'Mệnh');
  const tamPhuong = menh ? tamPhuongTuChinh(laSo.cung, menh).map((c) => c.ten).join(' · ') : '—';
  const hoa = tuHoa(laSo);
  const goc = hoa.goc.length
    ? hoa.goc.map((h) => `${h.hoa}: ${h.sao}`).join(', ')
    : 'không có';
  const luu = hoa.luuNien.length
    ? hoa.luuNien.map((h) => `${h.hoa}: ${h.sao}`).join(', ')
    : 'không có';

  const dong: string[] = [
    `- Giới tính: ${laSo.gioiTinh}`,
    `- Dương lịch: ${laSo.duongLich} | Âm lịch: ${laSo.amLich}`,
    `- Giờ sinh: ${laSo.gio.ten} (${laSo.gio.khoang})${laSo.gioDaChinh ? ' — đã quy đổi theo giờ thật' : ''}`,
    `- Tứ trụ: ${laSo.tuTru.map((t) => `${t.nhan} ${t.can} ${t.chi}`).join(' · ')}`,
    `- Cục: ${laSo.cuc} | Bản mệnh: ${laSo.conGiap} | Cung hoàng đạo: ${laSo.cungHoangDao}`,
    `- Mệnh chủ: ${laSo.menhChu} | Thân chủ: ${laSo.thanChu}`,
    `- Mệnh tại ${laSo.menhCung} | Thân cư ${laSo.thanCung}`,
    `- Tứ hoá năm sinh: ${goc}`,
    `- Tứ hoá lưu niên ${namXem}: ${luu}`,
    `- Vận hạn ${namXem}: đại hạn cung ${tenCung(vh.daiHan.index)} (${vh.daiHan.can} ${vh.daiHan.chi}, tuổi ${vh.daiHan.tuoi[0]}–${vh.daiHan.tuoi[1]}), tiểu hạn cung ${tenCung(vh.tieuHan.index)} (${vh.tieuHan.tuoi} tuổi), lưu niên ${vh.luuNien.can} ${vh.luuNien.chi} cung ${tenCung(vh.luuNien.index)}`,
    `- Tam phương tứ chính cung Mệnh: ${tamPhuong}`,
  ];

  const cung = laSo.cung.map((c) => `- ${moTaCung(c)}`);

  return [...dong, '', 'MƯỜI HAI CUNG:', ...cung].join('\n');
}

/** Danh sách tên sao có trong lá số — dùng cho postcheck. */
export function tenSaoTrongLaSo(laSo: LaSo): string[] {
  const tap = new Set<string>();
  for (const c of laSo.cung) {
    for (const s of [...c.chinhTinh, ...c.phuTinh, ...c.tapTinh]) {
      if (s.ten && s.ten.length >= 2) tap.add(s.ten);
    }
  }
  return [...tap];
}
