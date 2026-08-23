export const CHARACTER_OPTIONS = [
  {
    id: "doan_xa_agriculture",
    label: "Cán bộ Nông nghiệp Đoàn Xá",
    shortLabel: "Đoàn Xá",
    gender: "male",
    genderLabel: "Nam",
    title: "Nông Nghiệp & Khoán Sản Phẩm",
    icon: "🌾",
    color: "#059669",
    accentColor: "#34d399",
    hairColor: "#331800",
    hairStyle: "side_part",
    outfit: "shirt_tie",
    description: "Đại diện nông nghiệp cơ sở tại Hải Phòng, tiên phong tìm kiếm mô hình khoán mới tháo gỡ nạn thiếu lương thực.",
    preferredMetrics: ["foodSecurity", "socialStability"]
  },
  {
    id: "ba_thi_distribution",
    label: "Cán bộ Phân phối Lương thực (Bà Thi)",
    shortLabel: "Bà Thi",
    gender: "female",
    genderLabel: "Nữ",
    title: "Lưu Thông & Phân Phối Lương Thực",
    icon: "🛒",
    color: "#db2777",
    accentColor: "#f472b6",
    hairColor: "#1c1917",
    hairStyle: "bob_clip",
    outfit: "blouse_ribbon",
    description: "Đại diện ngành thương nghiệp/phân phối TP.HCM, chủ động đi các tỉnh thu mua lúa gạo cứu đói cho đô thị.",
    preferredMetrics: ["foodSecurity", "foreignCurrency"]
  },
  {
    id: "det_thanh_cong_industry",
    label: "Giám đốc Xí nghiệp Dệt Thành Công",
    shortLabel: "Dệt Thành Công",
    gender: "male",
    genderLabel: "Nam",
    title: "Sản Xuất Công Nghiệp Tự Chủ",
    icon: "🏭",
    color: "#0284c7",
    accentColor: "#38bdf8",
    hairColor: "#1e293b",
    hairStyle: "short_taper",
    outfit: "tech_vest",
    description: "Đại diện cơ sở công nghiệp năng động, chủ động tìm nguồn ngoại tệ nhập sợi và thực hiện Kế hoạch 3 phần.",
    preferredMetrics: ["industrialOutput", "foreignCurrency"]
  },
  {
    id: "long_an_policy",
    label: "Cán bộ Chính sách Đổi mới Long An",
    shortLabel: "Long An",
    gender: "male",
    genderLabel: "Nam",
    title: "Cải Cách Thể Chế & Giá Thị Trường",
    icon: "⚖️",
    color: "#d97706",
    accentColor: "#fbbf24",
    hairColor: "#0f172a",
    hairStyle: "neat_pompadour",
    outfit: "formal_suit",
    description: "Đại diện địa phương tiên phong bãi bỏ ngăn sông cấm chợ, mua bán lúa gạo theo giá thỏa thuận thực tế.",
    preferredMetrics: ["policySupport", "socialStability"]
  }
];

export const getCharacterOption = (id) => {
  return CHARACTER_OPTIONS.find((character) => character.id === id) || CHARACTER_OPTIONS[0];
};
