export const POLICY_STATIONS = {
  phase_1: {
    id: "station_p1_concept",
    phaseId: "phase_1",
    label: "Trung Tâm Khảo Sát Cơ Cấu Xã Hội",
    shortLabel: "Khảo Sát CCXH",
    icon: "🏛️",
    x: 480,
    y: 270,
    stationX: 1200,
    stationY: 675,
    radius: 50,
    prompt: "Nhấn Space / Chạm vào để khảo sát dữ liệu cơ cấu xã hội"
  },
  phase_2: {
    id: "station_p2_central",
    phaseId: "phase_2",
    label: "Viện Quan Hệ Giai Tầng & Khối Đại Đoàn Kết",
    shortLabel: "Quan Hệ Giai Tầng",
    icon: "⚖️",
    x: 480,
    y: 270,
    stationX: 1200,
    stationY: 675,
    radius: 50,
    prompt: "Nhấn Space / Chạm vào để khảo sát tác động tương hỗ xã hội"
  },
  phase_3: {
    id: "station_p3_alliance",
    phaseId: "phase_3",
    label: "Hội Nghị Chiến Lược Liên Minh Giai Cấp",
    shortLabel: "Hội Nghị Liên Minh",
    icon: "🤝",
    x: 480,
    y: 150,
    stationX: 1200,
    stationY: 390,
    radius: 55,
    prompt: "Nhấn Space / Chạm vào để tham gia hội nghị biểu quyết liên minh"
  },
  phase_4: {
    id: "station_p3_alliance",
    phaseId: "phase_3",
    label: "Hội Nghị Chiến Lược Liên Minh Giai Cấp",
    shortLabel: "Hội Nghị Liên Minh",
    icon: "🤝",
    x: 480,
    y: 150,
    stationX: 1200,
    stationY: 390,
    radius: 55,
    prompt: "Nhấn Space / Chạm vào để tham gia hội nghị biểu quyết liên minh"
  }
};

export const getStationForPhase = (phaseId) => {
  return POLICY_STATIONS[phaseId] || POLICY_STATIONS.phase_1;
};
