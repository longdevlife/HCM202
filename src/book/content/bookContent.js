/**
 * Single source of truth for Chapter 5 content across Showcase, Detail Drawer, and 3D Book.
 * Reference: 2026-09-22-threeui-three-book-content-design.md
 */

export const SOURCES = [
  {
    id: "gso-2025",
    name: "Cục Thống kê (Tổng cục Thống kê Việt Nam - GSO)",
    details: "Báo cáo tình hình kinh tế – xã hội quý IV và năm 2025, cơ cấu lao động và số liệu doanh nghiệp gia nhập thị trường.",
    url: "https://www.gso.gov.vn",
  },
  {
    id: "nq-45-tw",
    name: "Nghị quyết số 45-NQ/TW (2023)",
    details: "Nghị quyết Hội nghị Trung ương 8 khóa XIII về tiếp tục xây dựng và phát huy vai trò của đội ngũ trí thức đáp ứng yêu cầu phát triển đất nước.",
    url: "https://tulieuvankien.dangcongsan.vn",
  },
  {
    id: "chinh-phu",
    name: "Cổng Thông tin Điện tử Chính phủ",
    details: "Dữ liệu phát triển kinh tế tư nhân, đội ngũ doanh nhân và các chính sách an sinh xã hội.",
    url: "https://baochinhphu.vn",
  },
  {
    id: "giam-ngheo",
    name: "Chương trình mục tiêu quốc gia giảm nghèo bền vững",
    details: "Báo cáo kết quả giảm tỷ lệ nghèo đa chiều đến năm 2025 (còn khoảng 1,3%).",
    url: "https://molisa.gov.vn",
  },
  {
    id: "giao-trinh-mln",
    name: "Giáo trình Triết học Mác - Lênin & CNXHKH (Bộ GD&ĐT)",
    details: "Giáo trình chuẩn quốc gia dành cho bậc đại học hệ không chuyên lý luận chính trị, Nxb. Chính trị Quốc gia Sự thật.",
    url: "https://nxbctqg.vn",
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
    skeletonNotice: "Nội dung Sách 3D của Quyển I đã được số hóa hoàn tất với đầy đủ các trang tư liệu chuyên khảo.",
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
        front: "/textures/chapter5/bia.png",
        back: "/textures/chapter5/muc_1.png",
        label: "Bìa",
      },
      {
        front: "/textures/chapter5/1.1.png",
        back: "/textures/chapter5/1.2.png",
        label: "Mục 1.1–1.2",
      },
      {
        front: "/textures/chapter5/muc_2.png",
        back: "/textures/chapter5/2.1.png",
        label: "Mục 2–2.1",
      },
      {
        front: "/textures/chapter5/2.2.png",
        back: "/textures/chapter5/2.3.png",
        label: "Mục 2.2–2.3",
      },
      {
        front: "/textures/chapter5/thanks.png",
        back: "/textures/chapter5/end.png",
        label: "Lời Cảm Ơn & Tổng Kết",
      },
    ],
    sources: SOURCES,
    bibliography: [
      {
        title: "Giáo trình Chủ nghĩa xã hội khoa học (Chương 5)",
        publisher: "Nxb. Chính trị Quốc gia Sự thật",
        year: "2021",
        url: "https://nxbctqg.vn",
      },
      {
        title: "Báo cáo tình hình kinh tế – xã hội quý IV và năm 2025",
        publisher: "Tổng cục Thống kê (GSO)",
        year: "2025",
        url: "https://www.gso.gov.vn",
      },
      {
        title: "Nghị quyết số 45-NQ/TW về phát huy vai trò đội ngũ trí thức",
        publisher: "Ban Chấp hành Trung ương khóa XIII",
        year: "2023",
        url: "https://tulieuvankien.dangcongsan.vn",
      },
    ],
  },
  {
    id: 1,
    roman: "II",
    ready: true,
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
    skeletonNotice: "Nội dung Sách 3D của Quyển II đã được số hóa hoàn tất với đầy đủ các trang tư liệu chuyên khảo.",
    chapters: [
      { id: "2.1", title: "Biến đổi gắn liền và bị quy định bởi cơ cấu kinh tế" },
      { id: "2.2", title: "Biến đổi phức tạp, đa dạng, xuất hiện tầng lớp xã hội mới" },
      { id: "2.3", title: "Quan hệ vừa đấu tranh, vừa liên minh; từng bước giảm bất bình đẳng" },
    ],
    pages: [
      {
        front: "/textures/books/book2/bia_2.png",
        back: "/textures/books/book2/2.1.png",
        label: "Bìa",
      },
      {
        front: "/textures/books/book2/2.2.png",
        back: "/textures/books/book2/2.3.png",
        label: "Trang 2.1–2.2",
      },
      {
        front: "/textures/books/book2/2_blank.png",
        back: "/textures/books/book2/end_2.png",
        label: "Trang 2.3 & Lót",
      },
    ],
    sources: [SOURCES[0], SOURCES[3]],
    bibliography: [
      {
        title: "Giáo trình Chủ nghĩa xã hội khoa học (Chương 5, Mục 2)",
        publisher: "Nxb. Chính trị Quốc gia Sự thật",
        year: "2021",
        url: "https://nxbctqg.vn",
      },
      {
        title: "Báo cáo chuyển dịch cơ cấu lao động và giảm nghèo đa chiều",
        publisher: "Bộ Lao động – Thương binh và Xã hội",
        year: "2025",
        url: "https://molisa.gov.vn",
      },
    ],
  },
  {
    id: 2,
    roman: "III",
    ready: true,
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
    skeletonNotice: "Nội dung Sách 3D của Quyển III đã được số hóa hoàn tất với đầy đủ các trang tư liệu chuyên khảo.",
    chapters: [
      { id: "3.1", title: "Giai cấp công nhân" },
      { id: "3.2", title: "Giai cấp nông dân" },
      { id: "3.3", title: "Đội ngũ trí thức" },
      { id: "3.4", title: "Đội ngũ doanh nhân" },
      { id: "3.5", title: "Tổng kết" },
    ],
    pages: [
      {
        front: "/textures/books/book3/bia_3.png",
        back: "/textures/books/book3/3.png",
        label: "Bìa",
      },
      {
        front: "/textures/books/book3/end.png",
        back: "/textures/books/book3/end_3.png",
        label: "Trang 3 & Kết",
      },
    ],
    sources: SOURCES,
    bibliography: [
      {
        title: "Giáo trình Chủ nghĩa xã hội khoa học (Chương 5, Mục 3)",
        publisher: "Nxb. Chính trị Quốc gia Sự thật",
        year: "2021",
        url: "https://nxbctqg.vn",
      },
      {
        title: "Văn kiện Đại hội đại biểu toàn quốc lần thứ XIII",
        publisher: "Nxb. Chính trị Quốc gia Sự thật",
        year: "2021",
        url: "https://tulieuvankien.dangcongsan.vn",
      },
      {
        title: "Nghị quyết số 45-NQ/TW của Ban Chấp hành Trung ương Đảng",
        publisher: "Ban Chấp hành Trung ương khóa XIII",
        year: "2023",
        url: "https://tulieuvankien.dangcongsan.vn",
      },
    ],
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
