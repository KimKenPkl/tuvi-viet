/**
 * Cầu nối giữa la bàn và bàn phi tinh.
 *
 * Người dùng đo hướng ở trang la bàn rồi bấm "lập bàn phi tinh": hướng đó được
 * ghi vào sessionStorage để trang phi tinh mở ra đúng con số vừa đo. Dùng
 * sessionStorage chứ không localStorage vì đây là dữ liệu chuyển tay trong một
 * lần xem, không phải thứ cần nhớ lâu; đóng tab là hết.
 *
 * Không có gì được gửi lên mạng — đúng nguyên tắc của site.
 */

const KHOA = 'tuvi:phi-tinh:huong';

const chuanHoa = (goc: number): number => ((goc % 360) + 360) % 360;

/** Ghi hướng vừa đo. Lỗi storage (chế độ riêng tư) thì bỏ qua im lặng. */
export function luuHuongChon(do_: number): void {
  try {
    sessionStorage.setItem(KHOA, String(chuanHoa(do_)));
  } catch {
    /* trình duyệt chặn storage — không sao, người dùng vẫn nhập tay được */
  }
}

/** Đọc và xoá hướng đã ghi. Trả `null` nếu không có hoặc dữ liệu hỏng. */
export function docHuongChon(): number | null {
  try {
    const v = sessionStorage.getItem(KHOA);
    if (v === null) return null;
    sessionStorage.removeItem(KHOA);
    const n = Number(v);
    return Number.isFinite(n) ? chuanHoa(n) : null;
  } catch {
    return null;
  }
}
