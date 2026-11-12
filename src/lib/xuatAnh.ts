/**
 * Xuất một khối DOM ra PNG.
 *
 * html-to-image được nạp động nên ai chỉ xem công cụ thì không phải tải thêm.
 * Dùng chung cho bàn phi tinh và la bàn để hai nơi xuất ảnh giống nhau: cùng
 * tỉ lệ 2x, cùng màu nền theo bảng màu đang bật.
 */

/** Màu nền ảnh, bám theo bảng màu đang bật để ảnh không bị "lạc tông". */
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

/**
 * Chụp `node` thành PNG và tải về.
 * @throws lỗi của html-to-image để nơi gọi tự hiện thông báo
 */
export async function xuatNodePng(node: HTMLElement, tenTep: string): Promise<void> {
  const { toPng } = await import('html-to-image');
  // Chờ hai nhịp vẽ để mọi thứ vừa đổi (số, màu) kịp vào DOM trước khi chụp.
  await new Promise<void>((xong) => requestAnimationFrame(() => requestAnimationFrame(() => xong())));
  const dataUrl = await toPng(node, {
    backgroundColor: nenAnhXuat(),
    pixelRatio: 2,
    cacheBust: true,
  });
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = tenTep;
  a.click();
}
