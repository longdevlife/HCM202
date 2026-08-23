export const POLICY_STATIONS = {
  phase_1: {
    id: "doan_xa_crisis",
    phaseId: "phase_1",
    label: "HTX Nông Nghiệp Đoàn Xá (1978)",
    shortLabel: "HTX Đoàn Xá",
    icon: "🌾",
    x: 480,
    y: 270,
    stationX: 1200,
    stationY: 675,
    radius: 50,
    prompt: "Nhấn Space / Chạm vào để khảo sát thực địa Đoàn Xá"
  },
  phase_2: {
    id: "det_thanh_cong_yarn",
    phaseId: "phase_2",
    label: "XN Dệt Thành Công (1979)",
    shortLabel: "Dệt Thành Công",
    icon: "🏭",
    x: 480,
    y: 270,
    stationX: 1200,
    stationY: 675,
    radius: 50,
    prompt: "Nhấn Space / Chạm vào để kiểm tra kho sợi Dệt Thành Công"
  },
  phase_3: {
    id: "field_survey_report",
    phaseId: "phase_3",
    label: "Đoàn Khảo Sát Trung Ương (1980)",
    shortLabel: "Khảo Sát TW",
    icon: "📋",
    x: 480,
    y: 270,
    stationX: 1200,
    stationY: 675,
    radius: 50,
    prompt: "Nhấn Space / Chạm vào để trình bày báo cáo với đoàn công tác"
  },
  phase_4: {
    id: "policy_allocation_1981",
    phaseId: "phase_4",
    label: "Hội Nghị Thể Chế Hóa 1981",
    shortLabel: "Hội Nghị 1981",
    icon: "🏛️",
    x: 480,
    y: 270,
    stationX: 1200,
    stationY: 675,
    radius: 50,
    prompt: "Nhấn Space / Chạm vào để tham gia hội nghị phân bổ 1981"
  }
};

export const getStationForPhase = (phaseId) => {
  return POLICY_STATIONS[phaseId] || POLICY_STATIONS.phase_1;
};
