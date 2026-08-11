export const CHARACTER_OPTIONS = [
  {
    id: "reception_officer",
    label: "Cán bộ tiếp nhận",
    icon: "📄",
    spriteClass: "sprite-default",
    color: "#4fc3f7",
    description: "Tiếp xúc trực tiếp với người dân và xử lý hồ sơ."
  },
  {
    id: "digital_service_officer",
    label: "Cán bộ dịch vụ công số",
    icon: "💻",
    spriteClass: "sprite-student",
    color: "#26c6da",
    description: "Hỗ trợ người dân sử dụng dịch vụ công."
  },
  {
    id: "administrative_officer",
    label: "Cán bộ hành chính",
    icon: "🏢",
    spriteClass: "sprite-seller",
    color: "#ffca28",
    description: "Điều phối và giải quyết công việc."
  },
  {
    id: "inspection_officer",
    label: "Cán bộ kiểm tra",
    icon: "🛡️",
    spriteClass: "sprite-entrepreneur",
    color: "#66bb6a",
    description: "Chú trọng kỷ luật và trách nhiệm."
  },
  {
    id: "young_officer",
    label: "Cán bộ trẻ",
    icon: "🌱",
    spriteClass: "sprite-shipper",
    color: "#ab47bc",
    description: "Đại diện thế hệ mới trong bộ máy nhà nước."
  }
];

export const getCharacterOption = (id) => {
  return CHARACTER_OPTIONS.find((character) => character.id === id) || CHARACTER_OPTIONS[0];
};
