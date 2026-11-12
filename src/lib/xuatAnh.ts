/**
 * Xuất một khối DOM ra PNG hoặc PDF.
 *
 * Cả `html-to-image` và `jspdf` đều được nạp động, nên ai chỉ xem công cụ thì
 * không phải tải thêm. Hai nơi dùng chung là bàn phi tinh và la bàn, nhờ vậy
 * ảnh và PDF xuất ra giống nhau: cùng tỉ lệ 2x, cùng màu nền theo bảng màu
 * đang bật.
 *
 * PDF nhúng nguyên ảnh thay vì gọi `addText`: font mặc định của jsPDF không có
 * glyph tiếng Việt, chèn chữ sẽ ra dấu hỏi. Nhúng ảnh thì giữ đúng chữ, đúng
 * màu, đúng bố cục — đổi lại tệp nặng hơn một chút và không trích chữ được.
 */

/** Màu nền ảnh, bám theo bảng màu đang bật để ảnh không bị "lệch tông". */
export function nenAnhXuat(): string {
  return document.documentElement.dataset.giaoDien === 'sang' ? '#f6f2e9' : '#0e1219';
}

/** Bỏ dấu tiếng Việt để đặt tên tệp an toàn. */
export function slugTen(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** Chờ hai nhịp vẽ để mọi thay đổi vừa setState kịp vào DOM trước khi chụp. */
function choHaiNhip(): Promise<void> {
  return new Promise<void>((xong) =>
    requestAnimationFrame(() => requestAnimationFrame(() => xong())),
  );
}

async function chupPng(node: HTMLElement): Promise<string> {
  const { toPng } = await import('html-to-image');
  await choHaiNhip();
  return toPng(node, {
    backgroundColor: nenAnhXuat(),
    pixelRatio: 2,
    cacheBust: true,
  });
}

/** Tải một data URL xuống máy. */
function taiXuong(href: string, tenTep: string): void {
  const a = document.createElement('a');
  a.href = href;
  a.download = tenTep;
  a.click();
}

/**
 * Chụp `node` thành PNG và tải về.
 * @throws lỗi của html-to-image để nơi gọi tự hiện thông báo
 */
export async function xuatNodePng(node: HTMLElement, tenTep: string): Promise<void> {
  taiXuong(await chupPng(node), tenTep);
}

/**
 * Chụp `node` rồi đặt vừa một trang A4 dọc, canh giữa, chừa lề 12 mm.
 *
 * Ảnh được thu theo tỉ lệ để luôn nằm trọn trong một trang: bàn phi tinh và
 * la bàn đều là khối vuông hoặc gần vuông, chia nhiều trang sẽ cắt mất hình.
 *
 * @param node Khối cần chụp
 * @param tenTep Tên tệp .pdf, nên là ASCII không dấu
 */
export async function xuatNodePdf(node: HTMLElement, tenTep: string): Promise<void> {
  const dataUrl = await chupPng(node);
  const { jsPDF } = await import('jspdf');

  // Đo ảnh để biết tỉ lệ thật trước khi đặt vào trang.
  const anh = new Image();
  await new Promise<void>((xong, loi) => {
    anh.onload = () => xong();
    anh.onerror = () => loi(new Error('Không đọc được ảnh vừa chụp.'));
    anh.src = dataUrl;
  });

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const rongTrang = doc.internal.pageSize.getWidth();
  const caoTrang = doc.internal.pageSize.getHeight();
  const le = 12;
  const rongKhaDung = rongTrang - le * 2;
  const caoKhaDung = caoTrang - le * 2;

  const tiLe = Math.min(rongKhaDung / anh.width, caoKhaDung / anh.height);
  const rongAnh = anh.width * tiLe;
  const caoAnh = anh.height * tiLe;

  doc.addImage(
    dataUrl,
    'PNG',
    (rongTrang - rongAnh) / 2,
    (caoTrang - caoAnh) / 2,
    rongAnh,
    caoAnh,
    undefined,
    'FAST',
  );
  doc.save(tenTep);
}
