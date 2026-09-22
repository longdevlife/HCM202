/**
 * Single source of truth for Chapter 5 content across Showcase, Detail Drawer, and 3D Book.
 * Reference: 2026-09-22-threeui-three-book-content-design.md
 */

export const SOURCES = [
  {
    id: "gso-2025",
    name: "Cục Thống kê (Tổng cục Thống kê Việt Nam - GSO)",
    details: "Báo cáo tình hình kinh tế – xã hội quý IV và năm 2025, cơ cấu lao động và số liệu doanh nghiệp gia nhập thị trường.",
  },
  {
    id: "nq-45-tw",
    name: "Nghị quyết số 45-NQ/TW (2023)",
    details: "Nghị quyết Hội nghị Trung ương 8 khóa XIII về tiếp tục xây dựng và phát huy vai trò của đội ngũ trí thức đáp ứng yêu cầu phát triển đất nước.",
  },
  {
    id: "chinh-phu",
    name: "Cổng Thông tin Điện tử Chính phủ",
    details: "Dữ liệu phát triển kinh tế tư nhân, đội ngũ doanh nhân và các chính sách an sinh xã hội.",
  },
  {
    id: "giam-ngheo",
    name: "Chương trình mục tiêu quốc gia giảm nghèo bền vững",
    details: "Báo cáo kết quả giảm tỷ lệ nghèo đa chiều đến năm 2025 (còn khoảng 1,3%).",
  },
];

export const BOOKS = [
  {
    id: 0,
    roman: "I",
    ready: true,
    cover: {
      eyebrow: "QUYỂN I",
      title: ["CƠ CẤU XÃ HỘI", "– GIAI CẤP"],
      subtitle: "Khái niệm & vị trí",
      themeColor: "#1d3a5f",
      foilColor: "#c3a47b",
    },
    detail: {
      eyebrow: "QUYỂN I · CHƯƠNG 5",
      title: "Khái niệm và vị trí của cơ cấu xã hội – giai cấp",
      summary:
        "Tìm hiểu khái niệm cơ cấu xã hội, cơ cấu xã hội – giai cấp, đặc điểm của cơ cấu xã hội trong thời kỳ quá độ và vị trí quan trọng của cơ cấu xã hội – giai cấp trong đời sống xã hội.",
      keywords: ["KHÁI NIỆM", "GIAI CẤP", "TẦNG LỚP", "VỊ TRÍ XÃ HỘI"],
      description:
        "Cơ cấu xã hội – giai cấp là hệ thống các giai cấp, tầng lớp xã hội tồn tại khách quan và mối quan hệ giữa chúng về sở hữu, quản lý và phân phối trong một chế độ xã hội nhất định.",
    },
    chapters: [
      { id: "1.1", title: "Khái niệm cơ cấu xã hội" },
      { id: "1.2", title: "Khái niệm cơ cấu xã hội – giai cấp" },
      { id: "1.3", title: "Đặc điểm trong thời kỳ quá độ" },
      { id: "1.4", title: "Các giai cấp và tầng lớp chủ yếu" },
      { id: "1.5", title: "Vị trí hàng đầu của cơ cấu xã hội – giai cấp" },
      { id: "1.6", title: "Ví dụ: Doanh nhân và kinh tế tư nhân" },
      { id: "1.7", title: "Ví dụ: Vai trò của đội ngũ trí thức" },
    ],
    pages: [
      {
        pageNumber: 0,
        type: "cover",
        label: "Bìa",
        title: "CƠ CẤU XÃ HỘI – GIAI CẤP",
        subtitle: "Khái niệm & vị trí trong thời kỳ quá độ",
        front: "/textures/hinh/hinh1.png",
        back: "/textures/hinh/hinh2.png",
      },
      {
        pageNumber: 1,
        type: "content",
        label: "Trang 1–2",
        title: "Khái niệm cơ cấu xã hội và cơ cấu xã hội – giai cấp",
        summary: "Cơ cấu xã hội là tổng thể các cộng đồng người cùng toàn bộ các mối quan hệ xã hội. Cơ cấu xã hội – giai cấp giữ vị trí trung tâm chi phối các cơ cấu xã hội khác.",
        front: "/textures/hinh/hinh3.png",
        back: "/textures/hinh/hinh4.png",
      },
      {
        pageNumber: 2,
        type: "content",
        label: "Trang 3–4",
        title: "Đặc điểm thời kỳ quá độ & các tầng lớp chủ yếu",
        summary: "Tính đa dạng, phức tạp và đan xen giữa các yếu tố cũ và mới. Gồm giai cấp công nhân, nông dân, đội ngũ trí thức, doanh nhân và các nhóm xã hội khác.",
        front: "/textures/hinh/hinh5.png",
        back: "/textures/hinh/hinh6.png",
      },
      {
        pageNumber: 3,
        type: "content",
        label: "Trang 5–6",
        title: "Vị trí hàng đầu và thực tiễn phát triển",
        summary: "Cơ cấu xã hội – giai cấp liên quan trực tiếp đến quyền lực chính trị, địa vị kinh tế và là cơ sở để hoạch định chính sách đại đoàn kết toàn dân tộc.",
        front: "/textures/hinh/hinh7.png",
        back: "/textures/hinh/hinh8.png",
      },
      {
        pageNumber: 4,
        type: "content",
        label: "Trang 7–8",
        title: "Ví dụ thực tiễn: Doanh nhân & Trí thức",
        summary: "Năm 2025 có gần 195,1 nghìn doanh nghiệp thành lập mới, hơn 102,3 nghìn doanh nghiệp quay trở lại (tổng 297,5 nghìn gia nhập thị trường). Nghị quyết 45-NQ/TW khẳng định trí thức là lực lượng tiên phong trong kinh tế tri thức.",
        front: "/textures/hinh/hinh9.png",
        back: "/textures/hinh/hinh10.png",
      },
    ],
    sources: SOURCES,
  },
  {
    id: 1,
    roman: "II",
    ready: false,
    cover: {
      eyebrow: "QUYỂN II",
      title: ["BIẾN ĐỔI", "CÓ TÍNH QUY LUẬT"],
      subtitle: "Kinh tế · tầng lớp · liên minh",
      themeColor: "#3a2a1d",
      foilColor: "#d4af37",
    },
    detail: {
      eyebrow: "QUYỂN II · CHƯƠNG 5",
      title: "Sự biến đổi có tính quy luật của cơ cấu xã hội – giai cấp",
      summary:
        "Cơ cấu xã hội – giai cấp luôn vận động cùng cơ cấu kinh tế, trở nên đa dạng và phức tạp hơn, đồng thời hình thành những quan hệ vừa hợp tác, vừa đấu tranh và liên minh giữa các giai cấp, tầng lớp.",
      keywords: ["CƠ CẤU KINH TẾ", "CHUYỂN DỊCH LAO ĐỘNG", "TẦNG LỚP MỚI", "LIÊN MINH"],
      description:
        "Sự biến đổi của cơ cấu xã hội – giai cấp bị quy định bởi cơ cấu kinh tế nhiều thành phần, dẫn tới chuyển dịch cơ cấu lao động và từng bước giảm chênh lệch, bất bình đẳng xã hội.",
    },
    skeletonNotice: "Nội dung Sách 3D của Quyển II đang được hoàn thiện theo đúng giáo trình Chương 5.",
    chapters: [
      { id: "2.1", title: "Biến đổi gắn liền và bị quy định bởi cơ cấu kinh tế" },
      { id: "2.2", title: "Biến đổi phức tạp, đa dạng, xuất hiện tầng lớp xã hội mới" },
      { id: "2.3", title: "Quan hệ vừa đấu tranh, vừa liên minh; từng bước giảm bất bình đẳng" },
    ],
    pages: [],
    sources: [SOURCES[0], SOURCES[3]],
  },
  {
    id: 2,
    roman: "III",
    ready: false,
    cover: {
      eyebrow: "QUYỂN III",
      title: ["VIỆT NAM", "TRONG THỜI KỲ QUÁ ĐỘ"],
      subtitle: "Công nhân · nông dân · trí thức · doanh nhân",
      themeColor: "#1d382b",
      foilColor: "#bfa054",
    },
    detail: {
      eyebrow: "QUYỂN III · CHƯƠNG 5",
      title: "Cơ cấu xã hội – giai cấp ở Việt Nam trong thời kỳ quá độ lên CNXH",
      summary:
        "Cơ cấu xã hội – giai cấp ở Việt Nam không ngừng biến đổi cùng sự phát triển của nền kinh tế, với vai trò nổi bật của giai cấp công nhân, nông dân, đội ngũ trí thức và đội ngũ doanh nhân.",
      keywords: ["CÔNG NHÂN", "NÔNG DÂN", "TRÍ THỨC", "DOANH NHÂN"],
      description:
        "Các giai cấp, tầng lớp có vị trí và vai trò khác nhau nhưng tồn tại trong mối quan hệ hợp tác và liên minh chặt chẽ dưới sự lãnh đạo của Đảng, cùng hướng tới mục tiêu dân giàu, nước mạnh, dân chủ, công bằng, văn minh.",
    },
    skeletonNotice: "Nội dung Sách 3D của Quyển III đang được hoàn thiện theo đúng giáo trình Chương 5.",
    chapters: [
      { id: "3.1", title: "Giai cấp công nhân" },
      { id: "3.2", title: "Giai cấp nông dân" },
      { id: "3.3", title: "Đội ngũ trí thức" },
      { id: "3.4", title: "Đội ngũ doanh nhân" },
      { id: "3.5", title: "Tổng kết" },
    ],
    pages: [],
    sources: SOURCES,
  },
];

export function getBookByIndex(index) {
  const numericIndex = Number(index);
  if (isNaN(numericIndex)) return BOOKS[0];
  return BOOKS[Math.max(0, Math.min(BOOKS.length - 1, numericIndex))];
}

export function isBookReady(index) {
  return getBookByIndex(index).ready;
}
