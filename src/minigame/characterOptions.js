export const CHARACTER_OPTIONS = [
  {
    id: "default",
    label: "Misa",
    icon: "🎮",
    spriteClass: "sprite-default",
    color: "#ffe082",
    description: "Nhân vật Misa gốc"
  },
  {
    id: "shipper",
    label: "Shipper",
    icon: "🛵",
    spriteClass: "sprite-shipper",
    color: "#00bcd4",
    description: "Nhanh nhẹn, giao đơn khắp bản đồ"
  },
  {
    id: "student",
    label: "Sinh viên",
    icon: "🎓",
    spriteClass: "sprite-student",
    color: "#8bc34a",
    description: "Ham học, săn sách tri thức"
  },
  {
    id: "entrepreneur",
    label: "Doanh nhân",
    icon: "💼",
    spriteClass: "sprite-entrepreneur",
    color: "#ffc107",
    description: "Tập trung vốn và chiến lược"
  },
  {
    id: "seller",
    label: "Nhân viên bán hàng",
    icon: "🛍️",
    spriteClass: "sprite-seller",
    color: "#e91e63",
    description: "Linh hoạt, bám sát khách hàng"
  }
];

export const getCharacterOption = (id) => {
  return CHARACTER_OPTIONS.find((character) => character.id === id) || CHARACTER_OPTIONS[0];
};
