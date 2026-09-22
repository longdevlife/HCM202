export const BOOK_CATALOG = [
  {
    id: "social-structure",
    index: 0,
    roman: "I",
    eyebrow: "QUYỂN I",
    shortTitle: "Cơ cấu xã hội – giai cấp",
    titleLines: ["CƠ CẤU XÃ HỘI", "– GIAI CẤP"],
    subtitle: "Khái niệm · vị trí · quy luật biến đổi",
    description:
      "Khái luận về cơ cấu xã hội – giai cấp trong thời kỳ quá độ lên chủ nghĩa xã hội và mối quan hệ với các cơ cấu xã hội khác.",
    color: "#182A43",
    colorDeep: "#0C1726",
    foil: "#C87046",
    paper: "#E8DDC8",
    motion: "network",
    magazineName: "TẠP CHÍ CHUYÊN ĐỀ · QUYỂN I",
    edgeLabel: "CƠ CẤU XÃ HỘI – GIAI CẤP",
  },
  {
    id: "class-alliance",
    index: 1,
    roman: "II",
    eyebrow: "QUYỂN II",
    shortTitle: "Liên minh giai cấp, tầng lớp",
    titleLines: ["LIÊN MINH", "GIAI CẤP, TẦNG LỚP"],
    subtitle: "Cơ sở kinh tế · chính trị · xã hội",
    description:
      "Tính tất yếu và nội dung của liên minh giữa công nhân, nông dân, trí thức cùng các tầng lớp xã hội trong thời kỳ quá độ.",
    color: "#A94722",
    colorDeep: "#51200F",
    foil: "#EFC16D",
    paper: "#F0DFC2",
    motion: "convergence",
    magazineName: "TẠP CHÍ CHUYÊN ĐỀ · QUYỂN II",
    edgeLabel: "LIÊN MINH GIAI CẤP, TẦNG LỚP",
  },
  {
    id: "vietnam-practice",
    index: 2,
    roman: "III",
    eyebrow: "QUYỂN III",
    shortTitle: "Việt Nam: cơ cấu & liên minh",
    titleLines: ["VIỆT NAM", "CƠ CẤU & LIÊN MINH"],
    subtitle: "Thực tiễn · đổi mới · phát triển",
    description:
      "Đặc điểm cơ cấu xã hội – giai cấp và liên minh giai cấp, tầng lớp ở Việt Nam trong bối cảnh đổi mới và phát triển.",
    color: "#1D3E35",
    colorDeep: "#0C211B",
    foil: "#D4AF37",
    paper: "#E7DFC9",
    motion: "orbit",
    magazineName: "TẠP CHÍ CHUYÊN ĐỀ · QUYỂN III",
    edgeLabel: "VIỆT NAM · CƠ CẤU & LIÊN MINH",
  },
];

export const getBookByIndex = (index) =>
  BOOK_CATALOG[Math.max(0, Math.min(BOOK_CATALOG.length - 1, index))];
