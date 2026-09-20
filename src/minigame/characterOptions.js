export const CHARACTER_OPTIONS = [
  {
    id: "worker_leader",
    label: "Giai Cấp Công Nhân",
    shortLabel: "Công Nhân",
    gender: "male",
    genderLabel: "Nam",
    title: "Lực Lượng Tiên Phong CNH - HĐH",
    icon: "⚙️",
    color: "#0284c7",
    accentColor: "#38bdf8",
    hairColor: "#1e293b",
    hairStyle: "short_taper",
    outfit: "tech_vest",
    description: "Lực lượng lãnh đạo cách mạng thông qua Đảng, đi đầu trong sự nghiệp công nghiệp hóa, hiện đại hóa đất nước.",
    perkBadge: "🛡️ Khiên Bẫy",
    perkDesc: "Miễn nhiễm 1 lần va chạm bẫy / định kiến mỗi chặng",
    preferredMetrics: ["industrialOutput", "policySupport"]
  },
  {
    id: "farmer_strategic",
    label: "Giai Cấp Nông Dân",
    shortLabel: "Nông Dân",
    gender: "male",
    genderLabel: "Nam",
    title: "Vị Trí Chiến Lược Nông Nghiệp & Nông Thôn",
    icon: "🌾",
    color: "#059669",
    accentColor: "#34d399",
    hairColor: "#331800",
    hairStyle: "side_part",
    outfit: "shirt_tie",
    description: "Lực lượng đông đảo giữ vị trí chiến lược trong nông nghiệp, nông thôn và bảo đảm an ninh lương thực quốc gia.",
    perkBadge: "🌾 +1đ Thu Hoạch",
    perkDesc: "Nhận thêm +1 điểm thưởng khi nhặt dữ liệu thực địa",
    preferredMetrics: ["foodSecurity", "socialStability"]
  },
  {
    id: "intellectual_core",
    label: "Đội Ngũ Trí Thức",
    shortLabel: "Trí Thức",
    gender: "female",
    genderLabel: "Nữ",
    title: "Nòng Cốt Kinh Tế Tri Thức & Sáng Tạo",
    icon: "💡",
    color: "#7c3aed",
    accentColor: "#a78bfa",
    hairColor: "#1c1917",
    hairStyle: "bob_clip",
    outfit: "blouse_ribbon",
    description: "Lực lượng lao động sáng tạo đặc biệt, nòng cốt phát triển kinh tế tri thức, khoa học công nghệ và nâng cao dân trí.",
    perkBadge: "💡 Loại Trừ Sai",
    perkDesc: "Tự động gạch bỏ 1 đáp án sai trong câu hỏi đối thoại NPC",
    preferredMetrics: ["foreignCurrency", "socialStability"]
  },
  {
    id: "entrepreneur_dynamic",
    label: "Đội Ngũ Doanh Nhân",
    shortLabel: "Doanh Nhân",
    gender: "male",
    genderLabel: "Nam",
    title: "Tầng Lớp Xã Hội Mới Năng Động",
    icon: "💼",
    color: "#d97706",
    accentColor: "#fbbf24",
    hairColor: "#0f172a",
    hairStyle: "neat_pompadour",
    outfit: "formal_suit",
    description: "Tầng lớp xã hội mới phát triển nhanh, đóng góp to lớn vào đầu tư kinh doanh, giải quyết việc làm và của cải xã hội.",
    perkBadge: "⚡ Bứt Phá Tốc Độ",
    perkDesc: "Kích hoạt lướt nhanh +40% tốc độ trong 3.5s",
    preferredMetrics: ["industrialOutput", "foreignCurrency"]
  }
];

const ALIAS_MAP = {
  doan_xa_agriculture: "farmer_strategic",
  ba_thi_distribution: "intellectual_core",
  det_thanh_cong_industry: "worker_leader",
  long_an_policy: "entrepreneur_dynamic"
};

export const getCharacterOption = (id) => {
  const resolvedId = ALIAS_MAP[id] || id;
  return CHARACTER_OPTIONS.find((character) => character.id === resolvedId) || CHARACTER_OPTIONS[0];
};
