import { lazy, Suspense, type ComponentType, type CSSProperties } from 'react';
import { LienKet, useDuong, useMeta } from '../lib/router';
import { docPhien, type NguCanh } from '../lib/phien';
import KhungCho from '../components/KhungCho';

// Mỗi công cụ là một chunk riêng: vào hub không phải tải lịch âm, Kinh Dịch…
const CanLuongView = lazy(() => import('../components/CanLuongView'));
const SaoHanView = lazy(() => import('../components/SaoHanView'));
const PhongThuyView = lazy(() => import('../components/PhongThuyView'));
const PhiTinhView = lazy(() => import('../components/PhiTinhView'));
const LaBanView = lazy(() => import('../components/LaBanView'));
const KinhDichView = lazy(() => import('../components/KinhDichView'));
const TuongSoView = lazy(() => import('../components/TuongSoView'));
const LichCanChiView = lazy(() => import('../components/LichCanChiView'));
const SoSimView = lazy(() => import('../components/SoSimView'));
const TuoiHanView = lazy(() => import('../components/TuoiHanView'));

/**
 * Hub Phương Đông: mỗi công cụ là một trang riêng (/phuong-dong/<slug>).
 *
 * Vì sao tách trang thay vì modal: mỗi công cụ cần một URL để chia sẻ và để
 * Google lập chỉ mục; nội dung giải thích nằm ngay dưới công cụ nên trang tự
 * đứng được như một bài viết, không phải một cái tab trống.
 */

type ViewProps = { nguCanh?: NguCanh | null };

interface CongCu {
  slug: string;
  ten: string;
  icon: string;
  nhom: string;
  /** Một dòng trên thẻ ở hub */
  moTa: string;
  /** Tiêu đề trang (H1 + title) */
  tieuDe: string;
  /** Đoạn dẫn dưới H1 */
  moTaDai: string;
  /** Meta description */
  meta: string;
  /** Công cụ mới thêm, hiện nhãn ở hub */
  moi?: boolean;
  View: ComponentType<ViewProps>;
  bai: { muc: string; doan: string[] }[];
  nguon: string;
  lienQuan: string[];
}

const CONG_CU: CongCu[] = [
  {
    slug: 'can-luong',
    ten: 'Cân lượng',
    icon: '⚖',
    nhom: 'Mệnh số',
    moTa: 'Quy đổi năm – tháng – ngày – giờ sinh ra lượng chỉ và đọc bài thơ tương ứng.',
    tieuDe: 'Cân lượng — cân xương tính số theo năm tháng ngày giờ sinh',
    moTaDai:
      'Nhập ngày giờ sinh âm lịch để quy ra lượng chỉ của bốn trụ năm, tháng, ngày, giờ; cộng lại rồi tra bảng 51 mức cân lượng kèm bài thơ bốn câu.',
    meta:
      'Cân xương tính số: cách quy đổi năm tháng ngày giờ sinh ra lượng chỉ, bảng 51 mức cân lượng và cách đọc bài thơ. Công cụ tính online, không gửi dữ liệu đi đâu.',
    View: CanLuongView,
    bai: [
      {
        muc: 'Cân lượng là gì',
        doan: [
          'Cân xương tính số là phép quy đổi bốn mốc thời gian sinh — năm, tháng, ngày, giờ — ra một con số gọi là "lượng chỉ", rồi cộng lại để tra một bài thơ bốn câu. Mỗi mức trong bảng có một cái tên như "Kim bảng đề danh", "Mã vận kim an" hay "Mệnh bạc như tờ giấy".',
          'Sách dân gian truyền rằng phép này do Viên Thiên Cương đời Đường đặt ra, có bản ghi là của Quỷ Cốc Tử. Ở Việt Nam nó phổ biến qua các cuốn "Vạn niên lịch" và sách gia đình in trước 1975, nên mỗi nhà sách có thể in một dị bản khác nhau vài dòng.',
        ],
      },
      {
        muc: 'Cách tính',
        doan: [
          'Mỗi năm Can Chi có một lượng riêng: Giáp Tý là 1 lượng 2 chỉ, Bính Tý 1 lượng 6 chỉ, Mậu Tý 1 lượng 5 chỉ… Tháng âm lịch tính từ tháng Giêng đến tháng Chạp, mỗi tháng một lượng. Ngày âm lịch chia theo mức: ngày 1–5, 6–10, 11–15, 16–20, 21–25, 26–30. Giờ sinh chia theo 12 chi.',
          'Cộng bốn con số lại, phần lẻ vượt quá 10 chỉ được quy thành 1 lượng, rồi tra bảng tổng. Ví dụ một người sinh giờ Tý ngày 15 tháng Giêng năm Giáp Tý: 1,2 + 0,6 + 1,0 + 1,6 = 4 lượng 4 chỉ, tra mức "Tứ lượng tứ tiền".',
          'Bảng trong công cụ này lấy theo bản lưu hành phổ biến ở miền Nam trước 1975, đối chiếu với bản in trong "Vạn niên lịch" của Nhà xuất bản Đồng Nai. Phần giờ và một vài năm có chỗ khác giữa các bản — đó là chuyện bình thường với văn bản dân gian truyền miệng.',
        ],
      },
      {
        muc: 'Đọc kết quả thế nào',
        doan: [
          'Bài thơ bốn câu thường nói về một nét lớn của đời người: công danh, tiền tài, vợ chồng, con cái. Có mức nói "sớm vất vả, sau an nhàn", có mức nói "tay trắng làm nên". Cách đọc hợp lý là đọc như một câu chuyện để ngẫm, không phải bản án.',
          'Đừng cộng điểm, đừng so mức của mình với mức của người khác. Bảng này không tính đến hoàn cảnh gia đình, học vấn, sức khoẻ, thời đại — những thứ quyết định phần lớn cuộc đời. Cùng một mức ba lượng sáu chỉ, người sinh năm 1940 và người sinh năm 2000 có cuộc sống hoàn toàn khác nhau.',
          'Nếu dùng trong lớp học, đây là một ví dụ tốt để nói về cách người xưa hệ thống hoá thời gian bằng Can Chi, và về sự khác nhau giữa "mô hình" và "dự báo".',
        ],
      },
    ],
    nguon:
      'Cân xương tính số, tương truyền Viên Thiên Cương; bảng đối chiếu theo bản in trong Vạn niên lịch lưu hành tại miền Nam trước 1975. Bảng có dị bản giữa các nhà sách.',
    lienQuan: ['van-han-tuoi', 'lich-can-chi', 'sao-han'],
  },
  {
    slug: 'sao-han',
    ten: 'Sao hạn',
    icon: '✦',
    nhom: 'Mệnh số',
    moTa: 'Cửu Diệu chiếu mệnh theo tuổi, mức cát hung và bài văn khấn dâng sao.',
    tieuDe: 'Sao hạn — Cửu Diệu chiếu mệnh và văn khấn dâng sao',
    moTaDai:
      'Tính sao Cửu Diệu chiếu mệnh theo tuổi âm và giới tính, xem mức cát hung của từng sao, kèm bài văn khấn dâng sao theo lệ dân gian.',
    meta:
      'Xem sao hạn theo tuổi: Cửu Diệu chiếu mệnh (La Hầu, Kế Đô, Thái Dương, Thái Âm, Mộc Đức, Thủy Diệu, Hỏa Đức, Thổ Tú, Thái Bạch), cách tính và văn khấn dâng sao.',
    View: SaoHanView,
    bai: [
      {
        muc: 'Cửu Diệu là gì',
        doan: [
          'Cửu Diệu là chín "sao" của thiên văn cổ phương Đông, gồm bảy sao thật trên bầu trời — Thái Dương, Thái Âm, Mộc Đức (sao Mộc), Thủy Diệu (sao Thuỷ), Hỏa Đức (sao Hoả), Thổ Tú (sao Thổ), Thái Bạch (sao Kim) — cộng thêm hai điểm giao hội của mặt trăng là La Hầu và Kế Đô.',
          'Cách tính dân gian rất đơn giản: nam khởi La Hầu năm 10 tuổi, nữ khởi Kế Đô năm 10 tuổi, rồi cứ mỗi năm một sao theo đúng thứ tự, vòng 9 năm quay lại. Vì vậy hai người cùng tuổi khác giới sẽ có sao khác nhau, và cứ chín năm mình gặp lại đúng sao cũ.',
        ],
      },
      {
        muc: 'Sao nào tốt, sao nào cần thận',
        doan: [
          'Nhóm cát: Thái Dương (uy quyền, hanh thông), Thái Âm (mềm mỏng, lợi về nhà cửa), Mộc Đức (hanh thông, có quý nhân), Thủy Diệu (thuận về tài lộc, đi lại). Nhóm cần thận: La Hầu (thị phi, kiện tụng), Kế Đô (buồn phiền, hao tài), Thái Bạch (tai nạn, thị phi), Hỏa Đức (nóng nảy, hoả hoạn), Thổ Tú (trì trệ, bệnh lâu).',
          'Cách phân loại này là quy ước của sách dân gian, mỗi nơi có thể xếp Hỏa Đức hay Thổ Tú vào nhóm khác. Công cụ hiển thị đúng thứ tự sao và mức phân loại phổ biến, không thêm bớt lời phán.',
        ],
      },
      {
        muc: 'Văn khấn dâng sao',
        doan: [
          'Lệ dân gian thường dâng sao vào đầu năm, mùng 8 tháng Giêng hoặc ngày rằm tháng Giêng, có nơi làm theo ngày của từng sao. Lễ vật đơn giản: hương, hoa, trái cây, chén nước, đèn nến; không cần mâm cao cỗ đầy.',
          'Bài khấn trong công cụ này soạn theo lối văn khấn gia đình, mục đích là để người lớn tuổi đọc được dễ dàng. Đây là nghi lễ tâm linh mang tính an ủi tinh thần, không phải phương pháp chữa bệnh hay thay thế tư vấn y tế. Nếu trong nhà có người ốm, việc đầu tiên vẫn là đi khám.',
        ],
      },
    ],
    nguon:
      'Cửu Diệu theo thiên văn cổ Ấn Độ – Trung Hoa du nhập vào Việt Nam; cách tính tuổi theo lệ dân gian ghi trong Ngọc Hạp Thông Thư và các bản sao lưu hành trong gia đình.',
    lienQuan: ['can-luong', 'van-han-tuoi', 'lich-can-chi'],
  },
  {
    slug: 'phong-thuy',
    ten: 'Phong thuỷ',
    icon: '⌘',
    nhom: 'Nhà cửa',
    moTa: 'Quái mệnh Bát Trạch, Đông/Tây tứ mệnh và 8 hướng tốt xấu theo tuổi.',
    tieuDe: 'Phong thuỷ Bát Trạch — hướng nhà hợp tuổi theo quái mệnh',
    moTaDai:
      'Tính quái mệnh theo năm sinh và giới tính, xác định Đông tứ mệnh hay Tây tứ mệnh, rồi tra 8 hướng Sinh Khí, Thiên Y, Diên Niên, Phục Vị và bốn hướng xấu.',
    meta:
      'Xem hướng nhà hợp tuổi theo Bát Trạch: cách tính quái mệnh, Đông tứ mệnh – Tây tứ mệnh, 8 hướng cát hung và cách áp dụng cho cửa, bếp, giường.',
    View: PhongThuyView,
    bai: [
      {
        muc: 'Bát Trạch tính cái gì',
        doan: [
          'Bát Trạch là trường phái phong thuỷ dựa trên quan hệ giữa "quái mệnh" của người ở và tám hướng của ngôi nhà. Quái mệnh lấy từ năm sinh: nam và nữ tính khác nhau, vì nam đi thuận nữ đi nghịch trong vòng Lạc Hà cửu tinh.',
          'Kết quả chia làm hai nhóm. Đông tứ mệnh gồm Khảm, Ly, Chấn, Tốn; Tây tứ mệnh gồm Càn, Đoài, Cấn, Khôn. Người Đông tứ mệnh hợp bốn hướng Đông, Đông Nam, Nam, Bắc; người Tây tứ mệnh hợp bốn hướng Tây, Tây Bắc, Tây Nam, Đông Bắc.',
        ],
      },
      {
        muc: 'Tám hướng và mức cát hung',
        doan: [
          'Bốn hướng tốt: Sinh Khí (mạnh nhất, lợi về tài lộc và con cái), Thiên Y (sức khoẻ), Diên Niên (hoà thuận, bền lâu), Phục Vị (bình yên, trung tính nhưng ổn). Bốn hướng xấu: Tuyệt Mệnh (nặng nhất), Ngũ Quỷ (thị phi, hao tài), Lục Sát (kiện tụng, tai nạn), Họa Hại (lặt vặt, khẩu thiệt).',
          'Mức độ được xếp theo phép biến hào của quái: mỗi lần đổi một hào trong quẻ mà ra một "du niên". Công cụ tính đúng theo phép này chứ không dùng bảng tra sẵn, nên kết quả khớp với sách khi kiểm tra tay.',
        ],
      },
      {
        muc: 'Áp dụng thực tế',
        doan: [
          'Nguyên tắc cổ là "toạ hung hướng cát" — ngồi vào phương xấu, nhìn về phương tốt. Cửa chính, bếp và giường là ba chỗ được xét trước. Tuy nhiên phong thuỷ có hai lớp: hình thế (loan đầu — đường đi, ánh sáng, gió, hàng xóm) và lý khí (hướng, tuổi). Lớp hình thế quan trọng hơn nhiều, nhưng các trang bói thường bỏ qua vì không bán được.',
          'Một ngôi nhà tối, ẩm, cửa mở ra cột điện thì hướng đẹp mấy cũng không cứu được. Ngược lại nhà sáng, thoáng, bố trí hợp lý thì hướng "xấu" cũng chỉ là một chi tiết nhỏ. Đừng vì một hướng mà đập nhà.',
        ],
      },
    ],
    nguon:
      'Bát Trạch Minh Kính và Dương Trạch Tam Yếu; phép biến hào du niên đối chiếu theo bản dịch phổ biến tại Việt Nam.',
    lienQuan: ['van-han-tuoi', 'can-luong', 'lich-can-chi'],
  },
  {
    slug: 'phi-tinh',
    ten: 'Phi tinh Huyền Không',
    icon: '✧',
    nhom: 'Nhà cửa',
    moi: true,
    moTa:
      'Lập bàn 9 cung theo vận và hướng nhà, đọc bốn thế bàn, chồng niên tinh và xuất ảnh.',
    tieuDe: 'Huyền Không Phi Tinh — lập bàn chín cung theo vận và hướng nhà',
    moTaDai:
      'Nhập năm nhập trạch và hướng nhà để lập bàn phi tinh ba lớp — sơn tinh, vận tinh, hướng tinh — xem bốn thế bàn thường gặp, chồng niên tinh của năm và xuất ảnh PNG.',
    meta:
      'Lập bàn Huyền Không Phi Tinh online: vận 1–9, ba lớp sao sơn – vận – hướng, bốn thế bàn vượng sơn vượng hướng, song tinh hội hướng, thượng sơn hạ thuỷ và cảnh báo kiêm hướng.',
    View: PhiTinhView,
    bai: [
      {
        muc: 'Ba lớp sao trong một cung',
        doan: [
          'Bàn Huyền Không chia hình vuông thành chín cung theo đồ hình Lạc Thư, cung giữa gọi là trung cung. Mỗi cung mang ba con số. Sao của vận đang cai quản nhập trung cung rồi phi theo đường Lạc Thư (Trung → Càn → Đoài → Cấn → Ly → Khảm → Khôn → Chấn → Tốn), cho ra lớp vận tinh — lớp khí vận của cả ngôi nhà.',
          'Lớp thứ hai là sơn tinh: lấy sao vận tại cung của toạ, cho nhập trung rồi phi thuận nếu toạ là dương sơn, phi nghịch nếu là âm sơn. Lớp thứ ba là hướng tinh: làm y hệt nhưng lấy cung của hướng. Sơn tinh chủ về nhân đinh, sức khoẻ, con cái; hướng tinh chủ về tài lộc, công việc. Vận tinh là nền khí vận, hai lớp kia là cách ngôi nhà "ăn" vào nền đó.',
        ],
      },
      {
        muc: 'Bốn thế bàn thường gặp',
        doan: [
          'Vượng sơn vượng hướng: sơn tinh đương vận tới cung toạ, hướng tinh đương vận tới cung hướng — cả nhân đinh lẫn tài lộc đều đắc. Song tinh hội hướng: cả hai sao đương vận cùng tụ ở cung hướng, mạnh về tiền nhưng yếu về người. Song tinh hội toạ: ngược lại, mạnh về người, kém về tiền.',
          'Thượng sơn hạ thuỷ: sơn tinh bay tới cung hướng còn hướng tinh bay tới cung toạ, tức cả hai đều nghịch chỗ. Đây là bàn bất lợi nhất trong bốn thế, nhưng sách cổ cũng nói nó chỉ nặng khi ngôi nhà thật sự "hạ thuỷ" — phía trước thấp trũng, thoát nước, phía sau trống — chứ không phải cứ thấy bàn là đập nhà.',
          'Công cụ chỉ kết luận theo bốn thế trên. Những cách đọc chi tiết hơn (phi tinh kết hợp loan đầu, bát trạch, niên nguyệt nhật thời phi tinh) cần thêm dữ liệu và không nằm trong phạm vi một cái bàn chín cung.',
        ],
      },
      {
        muc: 'Kiêm hướng và giới hạn',
        doan: [
          'Khi trục đo rơi trong khoảng 3° sát ranh giới hai sơn, gọi là kiêm hướng. Các phái xử lý khác nhau: có phái lấy sơn gần nhất, có phái lập bàn thế quái, có phái dùng phân kim 120 long. Vì vậy công cụ lập bàn theo sơn gần nhất nhưng luôn cảnh báo, không tự chọn hộ.',
          'Một bàn phi tinh chỉ nói về lý khí. Phong thuỷ còn lớp hình thế — hướng gió, ánh sáng, độ ẩm, đường đi, hàng xóm — và lớp đó thường quyết định phần lớn. Nhà hướng đẹp mà tối, ẩm, cửa mở ra cột điện thì không cứu được bằng bất kỳ bàn sao nào. Dùng công cụ để học cách người xưa mô hình hoá không gian, đừng dùng để phán một căn nhà chỉ qua hai con số.',
        ],
      },
    ],
    nguon:
      'Trầm Thị Huyền Không Học (Thẩm Trúc Nhưng) và Trạch Vận Tân Án; cách lập bàn theo phái Tam Nguyên. Bàn trong công cụ được đối chiếu với các ca kinh điển bằng kiểm thử tự động trong mã nguồn.',
    lienQuan: ['phong-thuy', 'la-ban', 'lich-can-chi'],
  },
  {
    slug: 'la-ban',
    ten: 'La bàn 24 sơn',
    icon: '◈',
    nhom: 'Nhà cửa',
    moi: true,
    moTa:
      'Kéo tay hoặc dùng cảm biến điện thoại để đo hướng, quy ra 24 sơn, toạ sơn và cảnh báo kiêm hướng.',
    tieuDe: 'La bàn 24 sơn — đo hướng nhà, quy ra sơn và cảnh báo kiêm hướng',
    moTaDai:
      'Mặt la bàn số vẽ theo bắc thật: kéo trên vòng tròn, nhập số độ hoặc bật cảm biến điện thoại để ra hướng, sơn, cung, toạ sơn đối diện và cảnh báo khi trục đo sát ranh giới hai sơn.',
    meta:
      'La bàn 24 sơn online: đo hướng nhà bằng cảm biến điện thoại hoặc kéo tay, quy ra 24 sơn, xác định toạ – hướng, cảnh báo kiêm hướng và xuất ảnh PNG.',
    View: LaBanView,
    bai: [
      {
        muc: 'Hai mươi bốn sơn chia thế nào',
        doan: [
          'Vòng 360° được chia thành 24 sơn, mỗi sơn 15°. Mười hai sơn là mười hai địa chi (Tý, Sửu, Dần… Hợi), tám sơn là tám thiên can (Giáp, Ất, Bính, Đinh, Canh, Tân, Nhâm, Quý), bốn sơn còn lại là bốn quái ở góc (Cấn, Tốn, Khôn, Càn). Mậu và Kỷ không có sơn vì thuộc trung cung Thổ.',
          'Sơn Tý không nằm gọn trong 0–15° mà nằm vắt qua 0°, từ 352,5° đến 7,5°. Vì vậy trên la bàn, chính Bắc là ranh giới giữa nửa cuối sơn Nhâm và nửa đầu sơn Quý, còn 0° rơi đúng giữa sơn Tý. Đây là chỗ nhiều người mới đọc nhầm thành "Tý bắt đầu từ 0°".',
        ],
      },
      {
        muc: 'Kim la bàn và bắc thật',
        doan: [
          'Kim từ trường chỉ bắc từ, không chỉ bắc thật. Hai hướng lệch nhau một góc gọi là độ từ thiên, thay đổi theo vị trí và theo năm. Ở Việt Nam hiện nay góc này khoảng −0,4° ở Cà Mau đến −1,8° ở Hải Phòng, tức kim la bàn chỉ lệch về phía tây bắc thật chừng một đến hai độ; với việc chia sơn 15° thì mức đó chưa đủ đổi sơn, nhưng nếu đo để làm mốc chính xác thì vẫn phải cộng vào.',
          'Cảm biến trong điện thoại cũng cho hướng từ trường và rất dễ nhiễu: gần khung thép, loa, tủ điện, ốp lưng có nam châm, thậm chí gần một chiếc điện thoại khác. Cách đo đáng tin nhất vẫn là la bàn cơ đặt trên mặt phẳng, tránh xa vật kim loại, đo ba lần ở ba vị trí trong nhà rồi lấy trung bình.',
          'Công cụ vẽ mặt la bàn theo bắc thật và tự tính độ từ thiên theo mô hình WMM2025 khi bạn cho toạ độ hoặc bấm lấy vị trí; vẫn sửa tay được nếu bạn có số đo riêng. Không có dữ liệu nào được gửi lên mạng — phép tính chạy ngay trên máy.',
        ],
      },
      {
        muc: 'Kiêm hướng: ba độ quyết định',
        doan: [
          'Mỗi sơn rộng 15°, nhưng phần giữa mới là "chính hướng"; ba độ sát mỗi bên ranh giới gọi là kiêm hướng. Cùng một căn nhà, đo ra 172° hay 176° có thể cho hai bàn phi tinh khác nhau hoàn toàn, vì 172,5° là ranh giới giữa sơn Bính và sơn Ngọ.',
          'Sai số một hai độ là chuyện bình thường với la bàn cầm tay. Vì vậy nếu kết quả rơi vào vùng kiêm hướng, đừng chốt ngay: đo lại, đổi vị trí đứng, hoặc nhờ người đo bằng máy toàn đạc nếu việc chọn hướng thật sự quan trọng. Công cụ hiện cảnh báo đỏ đúng chỗ đó.',
        ],
      },
    ],
    nguon:
      'La kinh Tam Nguyên và cách chia 24 sơn lưu hành trong các sách phong thuỷ Việt Nam; âm dương 24 sơn theo Tam Nguyên long. Độ từ thiên tính theo mô hình WMM2025 của NCEI/NOAA (hiệu lực 2025–2030); sai số mô hình khoảng 0,5° ở vĩ độ trung bình.',
    lienQuan: ['phi-tinh', 'phong-thuy', 'lich-can-chi'],
  },
  {
    slug: 'kinh-dich',
    ten: 'Kinh Dịch',
    icon: '☰',
    nhom: 'Quẻ',
    moTa:
      'Gieo quẻ bằng ba đồng xu, xem quẻ chủ, động hào và quẻ biến; tra cứu 64 quẻ và lưu lịch sử gieo.',
    tieuDe: 'Gieo quẻ Kinh Dịch — 64 quẻ, động hào và quẻ biến',
    moTaDai:
      'Gieo sáu lần ba đồng xu để lập quẻ, xem quẻ chủ, động hào và quẻ biến; kèm cách đọc quái từ, hào từ và ý nghĩa thể – dụng. Có sẵn bảng tra 64 quẻ và lịch sử gieo lưu trên máy.',
    meta:
      'Gieo quẻ Kinh Dịch online bằng ba đồng xu: lập quẻ 64 quái, xác định động hào, quẻ biến và tra cứu ý nghĩa 64 quẻ theo Chu Dịch.',
    View: KinhDichView,
    bai: [
      {
        muc: 'Kinh Dịch là sách gì',
        doan: [
          'Kinh Dịch là một trong Ngũ Kinh, gồm 64 quẻ, mỗi quẻ sáu hào. Mỗi quẻ có một quái từ, mỗi hào có một hào từ. Phần lời thoại cổ được cho là của Chu Văn Vương và Chu Công, phần bình giải là của Khổng Tử và các môn đệ trong "Thập Dực".',
          'Điều ít người nói: Kinh Dịch là sách triết học về sự biến đổi, không phải bảng tiên đoán số phận. Nó mô tả một tình huống và gợi cách ứng xử, giống như đọc một câu châm ngôn rồi tự soi vào việc của mình.',
        ],
      },
      {
        muc: 'Gieo quẻ thế nào',
        doan: [
          'Phép cổ trong Hệ Từ truyện là "đại diễn chi số ngũ thập" — dùng 50 cọng cỏ thi, bỏ một cọng, chia đôi, gắp từng nhóm bốn. Cách này mất khoảng 20 phút cho một quẻ và đòi hỏi tập trung, nên đời sau mới có biến thể gieo ba đồng xu cho nhanh.',
          'Ba đồng xu gieo sáu lần, mỗi lần ghi âm hay dương cho một hào, từ dưới lên. Ba mặt ngửa là hào dương động, ba mặt sấp là hào âm động; hai ngửa một sấp là dương tĩnh, ngược lại là âm tĩnh. Hào động là hào "sẽ biến", tạo ra quẻ biến — quẻ thứ hai nói về chiều hướng tiếp theo.',
        ],
      },
      {
        muc: 'Đọc quẻ',
        doan: [
          'Có quẻ chủ, có hào động, có quẻ biến. Cách đọc phổ biến: quẻ chủ là tình hình hiện tại, hào động là điểm đang thay đổi, quẻ biến là hướng tới. Nếu không có hào động thì chỉ đọc quẻ chủ.',
          'Trong công cụ này, mỗi quẻ có phần tóm tắt ý nghĩa và mức cát/hung/bình. Đừng coi đó là lời phán: cùng một quẻ, người hỏi việc làm ăn và người hỏi chuyện tình cảm sẽ đọc ra hai điều khác nhau. Quẻ không biết bạn đang hỏi gì — chính bạn mới là người đặt câu hỏi.',
        ],
      },
    ],
    nguon:
      'Chu Dịch, Hệ Từ truyện cho phép đại diễn; cách gieo tam tiền là biến thể đời sau, phổ biến từ thời Tống – Minh.',
    lienQuan: ['so-dien-thoai', 'tuong-so', 'can-luong'],
  },
  {
    slug: 'tuong-so',
    ten: 'Tướng số',
    icon: '◉',
    nhom: 'Tướng',
    moTa: 'Tam đình, ngũ quan, ngũ nhạc, tứ độc — cách người xưa đọc khuôn mặt.',
    tieuDe: 'Tướng số — tam đình, ngũ quan và cách đọc khuôn mặt',
    moTaDai:
      'Tra các bộ vị trên khuôn mặt theo nhân tướng học cổ: tam đình, ngũ quan, ngũ nhạc, tứ độc; kèm nguyên tắc "tướng do tâm sinh" và giới hạn của bộ môn.',
    meta:
      'Tướng số là gì: tam đình, ngũ quan, ngũ nhạc, tứ độc trong Thần Tướng Toàn Biên và Ma Y Tướng Pháp, cùng lưu ý về giới hạn của nhân tướng học.',
    View: TuongSoView,
    bai: [
      {
        muc: 'Nhân tướng học nhìn gì',
        doan: [
          'Sách tướng cổ chia khuôn mặt làm ba phần: thượng đình (trán, từ tóc đến lông mày), trung đình (từ lông mày đến đầu mũi), hạ đình (từ mũi đến cằm). Tam đình được xét cân đối trước khi xét từng nét, vì người xưa cho rằng cái tổng thể quan trọng hơn chi tiết.',
          'Ngũ quan gồm lông mày, mắt, mũi, miệng, tai. Ngũ nhạc là năm "ngọn núi" trên mặt: trán, mũi, cằm và hai gò má. Tứ độc là bốn chỗ "lõm" cần sâu rộng: hai mắt, miệng, hai tai. Cách đọc là so sánh các bộ vị với nhau, không lấy một nét ra phán cả con người.',
        ],
      },
      {
        muc: 'Nguồn sách',
        doan: [
          'Hai cuốn được dẫn nhiều nhất là Thần Tướng Toàn Biên — bản tổng hợp lớn thời Minh — và Ma Y Tướng Pháp, gắn với truyền thuyết Ma Y đạo nhân đời Tống. Ngoài ra còn Thủy Kính Tập và các bản toát yếu lưu hành trong dân gian Việt Nam.',
          'Các sách này viết bằng văn ngôn, nhiều chỗ mơ hồ và mâu thuẫn nhau. Bản dịch tiếng Việt trên mạng thường tam sao thất bản, thêm bớt câu "phán" cho nghe hấp dẫn. Vì vậy công cụ này chỉ đưa các bộ vị và nguyên tắc chung, không bịa ra những câu phán cụ thể.',
        ],
      },
      {
        muc: 'Giới hạn cần nói rõ',
        doan: [
          'Nhân tướng học không có bằng chứng khoa học. Khuôn mặt chịu ảnh hưởng của gen, dinh dưỡng, tuổi tác, nghề nghiệp và cảm xúc thường ngày — không phải bản đồ số phận. Đọc tướng để hiểu cách người xưa quan sát con người thì thú vị; dùng nó để tuyển người, chọn bạn đời hay đánh giá học sinh thì nguy hiểm.',
          'Người xưa cũng nói "tướng do tâm sinh" — nét mặt đổi theo nếp sống. Câu đó vừa là lời khuyên, vừa là lời thừa nhận rằng tướng không cố định. Nếu chỉ nhớ một câu từ bộ môn này, nên nhớ câu đó.',
        ],
      },
    ],
    nguon:
      'Thần Tướng Toàn Biên và Ma Y Tướng Pháp; các nguyên tắc tam đình – ngũ quan – ngũ nhạc – tứ độc.',
    lienQuan: ['kinh-dich', 'can-luong', 'van-han-tuoi'],
  },
  {
    slug: 'lich-can-chi',
    ten: 'Lịch Can Chi',
    icon: '▦',
    nhom: 'Lịch',
    moTa: 'Can Chi ngày – tháng – năm, 12 Trực, 24 tiết khí, giờ Hoàng Đạo và lịch cả tháng.',
    tieuDe: 'Lịch Can Chi — Can Chi ngày, 12 Trực, 24 tiết khí và giờ Hoàng Đạo',
    moTaDai:
      'Chọn một ngày để xem Can Chi của ngày, tháng, năm, 12 Trực, tiết khí đang bao trùm, giờ Hoàng Đạo, việc nên làm và nên tránh; kèm lịch cả tháng có đánh dấu ngày Hoàng Đạo và dải 24 tiết khí trong năm.',
    meta:
      'Lịch Can Chi hôm nay: tra Can Chi ngày tháng năm, 12 Trực, 24 tiết khí, giờ Hoàng Đạo, việc nên kiêng, lịch âm dương cả tháng theo múi giờ Việt Nam.',
    View: LichCanChiView,
    bai: [
      {
        muc: 'Can Chi và vòng hoa giáp',
        doan: [
          'Mười Can (Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý) ghép với mười hai Chi (Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi) thành vòng 60, gọi là lục thập hoa giáp. Can Chi dùng cho năm, tháng, ngày và giờ; ngày thì chạy liên tục theo chu kỳ 60, không phụ thuộc tháng nhuận.',
          'Can Chi tháng tính theo tiết khí chứ không theo ngày mồng một âm lịch, nên có năm tháng Chạp vẫn mang can chi của tháng trước. Can Chi giờ chia 12 khoảng hai tiếng, bắt đầu từ giờ Tý (23h–1h).',
        ],
      },
      {
        muc: 'Mười hai Trực và Hoàng Đạo',
        doan: [
          'Mười hai Trực là Kiến, Trừ, Mãn, Bình, Định, Chấp, Phá, Nguy, Thành, Thu, Khai, Bế. Mỗi ngày rơi vào một Trực, và mỗi Trực có danh sách việc nên làm, việc nên tránh. Đây là lớp được dùng nhiều nhất khi chọn ngày cưới, động thổ, xuất hành.',
          'Ngày Hoàng Đạo là ngày có Trực thuộc nhóm tốt (Thanh Long, Minh Đường, Kim Quỹ, Thiên Đức, Ngọc Đường, Tư Mệnh); Hắc Đạo là nhóm còn lại. Cách xác định dựa trên chi của tháng và chi của ngày, không phải ngày âm lịch đẹp xấu theo cảm tính.',
        ],
      },
      {
        muc: 'Giờ Hoàng Đạo',
        doan: [
          'Sáu giờ Hoàng Đạo trong ngày được khởi từ Thanh Long theo chi của ngày: ngày Tý – Ngọ khởi Thanh Long ở Tý, ngày Sửu – Mùi khởi ở Dần, ngày Dần – Thân khởi ở Thìn, ngày Mão – Dậu khởi ở Ngọ, ngày Thìn – Tuất khởi ở Thân, ngày Tỵ – Hợi khởi ở Tuất. Cứ thế đi tiếp sáu cung tốt.',
          'Lịch Việt Nam dùng múi giờ 7, nên giờ Tý là 23h–1h theo giờ Việt Nam. Các app nước ngoài tính theo giờ Bắc Kinh sẽ lệch một tiếng với người ở Việt Nam — đó là lý do nhiều nơi tra ra kết quả khác nhau.',
        ],
      },
    ],
    nguon:
      'Hiệp Kỷ Biện Phương Thư đời Thanh cho 12 Trực và Hoàng Đạo; Ngọc Hạp Thông Thư; Can Chi ngày tính theo lịch vạn niên Việt Nam, múi giờ 7.',
    lienQuan: ['van-han-tuoi', 'can-luong', 'phong-thuy'],
  },
  {
    slug: 'so-dien-thoai',
    ten: 'Số điện thoại & biển số',
    icon: '⌗',
    nhom: 'Dãy số',
    moTa: 'Khởi quẻ từ dãy số theo Mai Hoa Dịch Số, ngũ hành Hà Đồ và mẫu số đẹp.',
    tieuDe: 'Xem số điện thoại, biển số xe — khởi quẻ theo Mai Hoa Dịch Số',
    moTaDai:
      'Nhập số điện thoại hoặc biển số xe để khởi quẻ theo phép số khởi quái của Mai Hoa Dịch Số, xem ngũ hành dãy số theo Hà Đồ và đối chiếu với bản mệnh.',
    meta:
      'Xem số điện thoại hợp tuổi, biển số xe: khởi quẻ theo Mai Hoa Dịch Số, ngũ hành Hà Đồ, mẫu số tứ quý – tam hoa – lộc phát. Công cụ tham khảo, không chấm điểm.',
    View: SoSimView,
    bai: [
      {
        muc: 'Phép số khởi quái',
        doan: [
          'Mai Hoa Dịch Số của Thiệu Ung đời Tống dạy lấy số để lập quẻ. Với một dãy số, cách phổ biến là chia đôi dãy: tổng nửa đầu chia 8 lấy dư làm thượng quái, tổng nửa sau chia 8 lấy dư làm hạ quái, tổng cả dãy chia 6 lấy dư làm động hào. Dư 0 thì lấy 8 hoặc 6.',
          'Số của quái theo Tiên thiên bát quái: Càn 1, Đoài 2, Ly 3, Chấn 4, Tốn 5, Khảm 6, Cấn 7, Khôn 8. Đây cũng chính là phép mà các sách bói sim, bói biển số đang dùng — chỉ khác ở chỗ họ thêm bảng điểm và lời phán không có nguồn.',
        ],
      },
      {
        muc: 'Ngũ hành dãy số',
        doan: [
          'Ngũ hành của dãy số lấy theo Hà Đồ: 1–6 Thuỷ, 2–7 Hoả, 3–8 Mộc, 4–9 Kim, 5–0 Thổ. Công cụ lấy chữ số cuối cùng làm chủ, vì đó là quy ước phổ biến; một số sách lấy tổng rút gọn. Hai cách có thể cho kết quả khác nhau, nên nếu thấy khác với nơi khác thì thường là do cách lấy.',
          'Nếu nhập năm sinh, công cụ đối chiếu ngũ hành dãy số với bản mệnh: dãy sinh mệnh là tốt, mệnh sinh dãy là hao nhẹ, dãy khắc mệnh là xấu, mệnh khắc dãy là tạm ổn. Đây là quan hệ ngũ hành cơ bản, không phải "điểm phong thuỷ".',
        ],
      },
      {
        muc: 'Mẫu số đẹp và cái bẫy giá',
        doan: [
          'Tứ quý (bốn số giống nhau), tam hoa (ba số giống nhau), lộc phát (68/86), thần tài (39/79), ông địa (38/78), số tiến, số gánh — đây là quy ước thị trường, không có trong cổ thư. Chúng chỉ nói dãy số dễ nhớ, dễ đọc; không nói gì về vận mệnh.',
          'Vì vậy đừng trả thêm vài chục triệu cho một dãy số chỉ vì nó "đẹp". Nếu thích thì mua vì thích, đừng mua vì tin. Một sim 50 nghìn với số dễ nhớ vẫn gọi điện tốt như sim 50 triệu.',
        ],
      },
    ],
    nguon:
      'Mai Hoa Dịch Số — Thiệu Ung; Tiên thiên bát quái số; Hà Đồ phối ngũ hành. Các mẫu số đẹp là quy ước thị trường, không phải cổ thư.',
    lienQuan: ['kinh-dich', 'phong-thuy', 'van-han-tuoi'],
  },
  {
    slug: 'van-han-tuoi',
    ten: 'Vận hạn theo tuổi',
    icon: '☯',
    nhom: 'Vận hạn',
    moTa: 'Đối chiếu tuổi với năm: tam hợp, lục xung, Tam Tai, Cửu Diệu và lời khuyên.',
    tieuDe: 'Vận hạn theo tuổi — tam hợp, tương xung, Tam Tai trong năm',
    moTaDai:
      'Chọn năm sinh, giới tính và năm xem để đối chiếu địa chi của tuổi với địa chi của năm, cộng thêm sao Cửu Diệu và Tam Tai, ra mức thuận – trung tính – cần thận kèm lý do.',
    meta:
      'Xem vận hạn theo tuổi từng năm: tam hợp, lục hợp, lục xung, lục hại, Tam Tai, sao Cửu Diệu chiếu mệnh và lời khuyên theo tuổi.',
    View: TuoiHanView,
    bai: [
      {
        muc: 'Quan hệ mười hai địa chi',
        doan: [
          'Mười hai chi có bốn kiểu quan hệ được dùng nhiều nhất. Tam hợp gom bốn nhóm: Thân–Tý–Thìn, Tỵ–Dậu–Sửu, Dần–Ngọ–Tuất, Hợi–Mão–Mùi. Lục hợp là sáu cặp: Tý–Sửu, Dần–Hợi, Mão–Tuất, Thìn–Dậu, Tỵ–Thân, Ngọ–Mùi. Lục xung là sáu cặp đối nhau trong vòng tròn. Lục hại là sáu cặp khắc ngầm.',
          'Năm xem trùng chi với tuổi gọi là năm bản mệnh, hay Thái Tuế — dân gian kiêng động thổ, cưới hỏi lớn. Cách kiêng này xuất phát từ quan niệm "không phạm thái tuế", không phải từ một phép tính thiên văn.',
        ],
      },
      {
        muc: 'Tam Tai, Kim Lâu, Hoang Ốc',
        doan: [
          'Tam Tai là ba năm liền gặp hạn theo nhóm tam hợp của tuổi: tuổi Thân–Tý–Thìn gặp Dần–Mão–Thìn; Tỵ–Dậu–Sửu gặp Hợi–Tý–Sửu; Dần–Ngọ–Tuất gặp Thân–Dậu–Tuất; Hợi–Mão–Mùi gặp Tỵ–Ngọ–Mùi. Kim Lâu và Hoang Ốc là hai phép tính tuổi mụ dùng khi cưới hỏi và làm nhà.',
          'Ba phép này dùng chung một nguồn với mục "Xây nhà / Cưới hỏi" của site, để không có chuyện cùng một tuổi mà trang này nói phạm, trang kia nói không. Nếu thấy khác nơi khác, thường là do họ tính tuổi mụ hoặc mốc năm khác.',
        ],
      },
      {
        muc: 'Đọc mức thuận – cần thận',
        doan: [
          'Công cụ cộng ba yếu tố: quan hệ chi (tam hợp +2, lục hợp +1, xung −2, hại −1), tính chất sao Cửu Diệu (cát +1, hung −1) và Tam Tai (−1). Từ −1 trở xuống là "cần thận", từ +2 trở lên là "thuận", còn lại là trung tính.',
          'Đây là cách lượng hoá do tôi đặt ra để dễ đọc, không phải thang điểm cổ. Cổ thư không chấm điểm; họ nói bằng hình ảnh và lời khuyên. Nếu muốn trung thành với cổ hơn, hãy đọc phần "vì sao" và bỏ qua chữ "mức".',
          'Một năm "cần thận" không có nghĩa là năm xấu. Nó có nghĩa là nên chia nhỏ việc lớn, đọc kỹ giấy tờ, giữ sức khoẻ. Một năm "thuận" cũng không có nghĩa là ngồi yên sẽ có kết quả.',
        ],
      },
    ],
    nguon:
      'Tam hợp, lục hợp, lục xung, lục hại theo Tam Mệnh Thông Hội và Uyên Hải Tử Bình; Tam Tai – Kim Lâu – Hoang Ốc dùng chung nguồn với mục Xây nhà/Cưới hỏi.',
    lienQuan: ['can-luong', 'sao-han', 'lich-can-chi'],
  },
];

const theoSlug = new Map(CONG_CU.map((c) => [c.slug, c]));

function TheCongCu({ c, i = 0 }: { c: CongCu; i?: number }) {
  return (
    <LienKet
      to={`/phuong-dong/${c.slug}`}
      className="pd-card"
      style={{ '--i': i } as CSSProperties}
    >
      <span className="pd-card-top">
        <span className="pd-card-icon" aria-hidden="true">
          {c.icon}
        </span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {c.moi && <span className="pd-card-moi">mới</span>}
          <span className="pd-card-nhom">{c.nhom}</span>
        </span>
      </span>
      <span className="pd-card-ten">{c.ten}</span>
      <span className="pd-card-mo">{c.moTa}</span>
      <span className="pd-card-more">Mở công cụ →</span>
    </LienKet>
  );
}

function TrangHub() {
  useMeta(
    'Phương Đông — cân lượng, sao hạn, phong thuỷ, phi tinh, Kinh Dịch | Tử Vi Việt',
    'Một cửa vào các công cụ phương Đông: cân lượng, sao hạn và văn khấn, phong thuỷ Bát Trạch, phi tinh Huyền Không, la bàn 24 sơn, gieo quẻ Kinh Dịch, tướng số, lịch Can Chi, số điện thoại – biển số, vận hạn theo tuổi.',
  );

  return (
    <div className="pd-wrap">
      <header className="pd-hero">
        <p className="eyebrow">Phương Đông</p>
        <h1>Cân lượng, sao hạn, phong thuỷ, phi tinh, Kinh Dịch — gom về một chỗ</h1>
        <p className="pd-lead">
          Mười công cụ tra cứu theo cổ pháp, mỗi công cụ một trang riêng, kèm phần giải thích nguồn
          gốc và cách đọc. Tất cả chạy ngay trên trình duyệt: ngày sinh ông nhập không được gửi đi
          đâu.
        </p>
      </header>

      <div className="pd-grid">
        {CONG_CU.map((c, i) => (
          <TheCongCu key={c.slug} c={c} i={i} />
        ))}
      </div>

      <section className="pd-other">
        <h2>Công cụ khác trên Tử Vi Việt</h2>
        <p>
          Những mục dưới đây cần lá số đầy đủ nên vẫn nằm ở trang chủ, mở bằng một cú bấm:
        </p>
        <div className="pd-links">
          <LienKet to="/?mo=xay-nha">Xem tuổi xây nhà / cưới hỏi</LienKet>
          <LienKet to="/?mo=nghe-nghiep">Định hướng nghề nghiệp</LienKet>
          <LienKet to="/?mo=lich-su">Lịch sử lá số đã lưu</LienKet>
        </div>
      </section>

      <article className="pd-article">
        <h2>Vì sao gom về một chỗ</h2>
        <p>
          Người xưa không tách "bói toán" khỏi "lịch". Cùng một hệ Can Chi sinh ra cách tính ngày
          tốt xấu, cách chọn hướng nhà, cách đặt tên, cách xem tuổi. Tách rời ra thì mỗi mục chỉ
          còn là một mẩu rời rạc; đặt cạnh nhau mới thấy chúng dùng chung một bộ công cụ: Can Chi,
          ngũ hành, bát quái.
        </p>
        <p>
          Vì vậy các trang trong hub này dùng chung một nguồn tính: lịch Can Chi, Tam Tai, Kim Lâu,
          Hoang Ốc, Cửu Diệu đều lấy từ một chỗ, không chép lại công thức ở từng trang. Sửa một
          chỗ là cả hub đúng theo.
        </p>

        <h2>Nguyên tắc biên soạn</h2>
        <p>
          Mỗi công cụ đều ghi rõ căn cứ: sách nào, phép nào, chỗ nào là quy ước đời sau. Không bịa
          bảng "linh số", không chấm điểm 1–10, không thêm lời phán để làm hồi hộp. Chỗ nào có
          nhiều dị bản thì nói là có nhiều dị bản.
        </p>
        <p>
          Tất cả nội dung ở đây là tham khảo văn hoá và chiêm nghiệm cá nhân, không phải lời khuyên
          y tế, pháp lý hay tài chính. Không có lá số nào quyết định thay con người.
        </p>
      </article>

      <p className="pd-foot">
        <LienKet to="/">← Về trang Tử Vi</LienKet>
      </p>
    </div>
  );
}

function TrangCongCu({ c }: { c: CongCu }) {
  useMeta(`${c.tieuDe} | Tử Vi Việt`, c.meta);
  const nguCanh = docPhien()?.nguCanh ?? null;
  const View = c.View;
  const lienQuan = c.lienQuan.map((s) => theoSlug.get(s)).filter(Boolean) as CongCu[];

  return (
    <div className="pd-wrap">
      <nav className="pd-crumb" aria-label="Đường dẫn">
        <LienKet to="/">Tử Vi Việt</LienKet>
        <span aria-hidden="true">/</span>
        <LienKet to="/phuong-dong">Phương Đông</LienKet>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{c.ten}</span>
      </nav>

      <header className="pd-head">
        <p className="eyebrow">
          Phương Đông · {c.nhom}
        </p>
        <h1>{c.tieuDe}</h1>
        <p className="pd-lead">{c.moTaDai}</p>
      </header>

      <section className="pd-tool" aria-label={c.ten}>
        <Suspense
          fallback={
            <div style={{ padding: '14px 2px' }}>
              <KhungCho dong={2} />
            </div>
          }
        >
          <View nguCanh={nguCanh} />
        </Suspense>
      </section>

      <article className="pd-article">
        {c.bai.map((m) => (
          <section key={m.muc}>
            <h2>{m.muc}</h2>
            {m.doan.map((d, i) => (
              <p key={`${m.muc}-${i}`}>{d}</p>
            ))}
          </section>
        ))}
        <p className="pd-nguon">
          <strong>Nguồn tham chiếu:</strong> {c.nguon}
        </p>
      </article>

      {lienQuan.length > 0 && (
        <section className="pd-related">
          <h2>Công cụ liên quan</h2>
          <div className="pd-grid pd-grid-small">
            {lienQuan.map((x) => (
              <TheCongCu key={x.slug} c={x} />
            ))}
          </div>
        </section>
      )}

      <p className="pd-foot">
        <LienKet to="/phuong-dong">← Tất cả công cụ Phương Đông</LienKet>
      </p>
    </div>
  );
}

function KhongCoCongCu({ slug }: { slug: string }) {
  useMeta('Không tìm thấy công cụ | Tử Vi Việt', 'Địa chỉ không tồn tại trong mục Phương Đông.');
  return (
    <div className="pd-wrap">
      <header className="pd-head">
        <p className="eyebrow">Phương Đông</p>
        <h1>Không tìm thấy công cụ “{slug}”</h1>
        <p className="pd-lead">
          Có thể đường dẫn đã đổi hoặc gõ sai. Danh sách công cụ đầy đủ nằm ở trang chủ mục Phương
          Đông.
        </p>
      </header>
      <p className="pd-foot">
        <LienKet to="/phuong-dong">← Về danh sách công cụ</LienKet>
      </p>
    </div>
  );
}

export default function PhuongDongApp() {
  const duong = useDuong();
  const phan = duong.split('/').filter(Boolean); // ['phuong-dong', slug?]

  if (phan.length === 1) return <TrangHub />;

  const slug = phan[1] ?? '';
  const c = theoSlug.get(slug);
  if (!c) return <KhongCoCongCu slug={slug} />;
  return <TrangCongCu c={c} />;
}
