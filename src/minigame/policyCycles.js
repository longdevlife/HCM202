export const PHASE_3_PRESETS = {
  toan_dien_ben_vung: { P1: 0.45, P2: 0.35, P3: 0.20, Lc: 65, theta: 0.60 },
  uu_tien_nong_thon: { P1: 0.60, P2: 0.25, P3: 0.15, Lc: 80, theta: 0.80 },
  dot_pha_tri_thuc: { P1: 0.30, P2: 0.40, P3: 0.30, Lc: 45, theta: 0.35 }
};

// Backward-compatibility aliases
export const PHASE_4_PRESETS = {
  ...PHASE_3_PRESETS,
  plan_focus: PHASE_3_PRESETS.uu_tien_nong_thon,
  balanced_khoan: PHASE_3_PRESETS.toan_dien_ben_vung,
  incentive_risk: PHASE_3_PRESETS.dot_pha_tri_thuc
};

export const POLICY_CYCLES = [
  {
    id: 'phase_1',
    year: 1,
    yearLabel: 'Chặng 1',
    title: 'Khái Luận Cơ Cấu Xã Hội & Cơ Cấu Xã Hội - Giai Cấp',
    subtitle: 'Nhận diện các loại hình cơ cấu & 4 quan hệ cốt lõi của giai tầng',
    description: 'Cơ cấu xã hội gồm nhiều loại hình (dân cư, nghề nghiệp, giai cấp, dân tộc, tôn giáo). Trong đó, cơ cấu xã hội - giai cấp giữ vị trí trung tâm vì phản ánh trực tiếp quan hệ sở hữu TLSX, tổ chức quản lý, địa vị chính trị và phân phối lợi ích.',
    durationMs: 240000,
    decisionWindowMs: 210000,
    defaultOptionId: 'opt_p1_toandien',
    task: {
      stationId: 'station_p1_concept',
      objectiveLabel: 'Khảo sát thực địa tại Trung Tâm Nghiên Cứu Cơ Cấu Xã Hội',
      successText: 'Đã hoàn tất thu thập dữ liệu về các loại hình cơ cấu và 4 quan hệ nền tảng của giai tầng.',
      taskBonus: 5
    },
    options: [
      {
        id: 'opt_p1_phiendien',
        title: 'Chỉ Chú Trọng Cơ Cấu Kỹ Thuật Nghề Nghiệp Thuần Túy',
        shortTitle: 'Kỹ Thuật Nghề Nghiệp',
        description: 'Xem nhẹ quan hệ giai cấp và phân phối lợi ích, chỉ tập trung các chỉ số cơ học về nghề nghiệp và dân cư đơn thuần.',
        effectsSummary: 'Tăng nhẹ chỉ tiêu kinh tế trước mắt, nhưng tiềm ẩn nguy cơ bất bình đẳng và suy giảm gắn kết xã hội.'
      },
      {
        id: 'opt_p1_toandien',
        title: 'Tiếp Cận Toàn Diện & Trọng Tâm CCXH-GC',
        shortTitle: 'Tiếp Cận Toàn Diện',
        description: 'Lấy cơ cấu xã hội - giai cấp làm trọng tâm gắn với sở hữu TLSX và phân phối lợi ích, đồng thời phát triển hài hòa cơ cấu nghề nghiệp, dân tộc và tôn giáo.',
        effectsSummary: 'Củng cố nền tảng chính trị - xã hội, tăng đồng thuận thể chế và bảo đảm định hướng xã hội chủ nghĩa.'
      }
    ]
  },
  {
    id: 'phase_2',
    year: 2,
    yearLabel: 'Chặng 2',
    title: 'Vị Trí Của CCXH-GC & Tác Động Tương Hỗ Xã Hội',
    subtitle: 'Gắn trực tiếp với kinh tế - chính trị & không tuyệt đối hóa phiến diện',
    description: 'Cơ cấu xã hội - giai cấp giữ vị trí quan trọng hàng đầu, tác động trực tiếp đến nghề nghiệp, dân cư, dân tộc, tôn giáo. Tuy nhiên, không được tuyệt đối hóa vai trò của nó mà phải tôn trọng mối quan hệ tác động qua lại giữa các loại hình cơ cấu.',
    durationMs: 240000,
    decisionWindowMs: 210000,
    defaultOptionId: 'opt_p2_haihoa',
    task: {
      stationId: 'station_p2_central',
      objectiveLabel: 'Khảo sát thực địa tại Viện Quan Hệ Giai Tầng & Khối Đại Đoàn Kết',
      successText: 'Đã đánh giá thực nghiệm tác động lan tỏa của biến đổi giai cấp lên cơ cấu dân cư, dân tộc và tôn giáo.',
      taskBonus: 5
    },
    options: [
      {
        id: 'opt_p2_tuyetdoi',
        title: 'Tuyệt Đối Hóa Vai Trò Giai Cấp Một Chiều',
        shortTitle: 'Tuyệt Đối Hóa Giai Cấp',
        description: 'Nhấn mạnh thái quá yếu tố giai cấp, xem nhẹ đặc thù bản sắc văn hóa dân tộc, tôn giáo và sự đa dạng của các nhóm cộng đồng dân cư.',
        effectsSummary: 'Gây xáo trộn và căng thẳng trong quan hệ xã hội, suy giảm khối đại đoàn kết toàn dân tộc.'
      },
      {
        id: 'opt_p2_haihoa',
        title: 'Hài Hòa Giai Cấp & Đại Đoàn Kết Toàn Dân',
        shortTitle: 'Hài Hòa & Đoàn Kết',
        description: 'Tôn trọng vị trí hàng đầu của CCXH-GC gắn với phát triển kinh tế, đồng thời bảo đảm bình đẳng dân tộc, tự do tín ngưỡng tôn giáo và đoàn kết toàn dân.',
        effectsSummary: 'Gia tăng mạnh mẽ sự ổn định xã hội, tạo sức mạnh tổng hợp và nâng cao niềm tin vào thể chế.'
      }
    ]
  },
  {
    id: 'phase_3',
    year: 3,
    yearLabel: 'Chặng 3',
    title: 'Quy Luật Biến Đổi & Chiến Lược Liên Minh Giai Cấp',
    subtitle: 'Cơ cấu kinh tế quy định cơ cấu giai cấp ➔ Nhu cầu liên minh Công - Nông - Trí thức',
    description: 'Kinh tế thay đổi kéo theo biến đổi nghề nghiệp và xuất hiện tầng lớp mới (doanh nhân, trí thức số). Các giai cấp vừa đấu tranh vừa liên minh, từng bước xích lại gần nhau. Cần quyết định gói chiến lược phân bổ nguồn lực quốc gia cho khối liên minh.',
    durationMs: 240000,
    decisionWindowMs: 210000,
    defaultOptionId: 'toan_dien_ben_vung',
    task: {
      stationId: 'station_p3_alliance',
      objectiveLabel: 'Biểu quyết tại Hội Nghị Chiến Lược Liên Minh Giai Cấp Toàn Quốc',
      successText: 'Đã hoàn tất tham vấn phân bổ nguồn lực liên minh công nghiệp, nông nghiệp và kinh tế tri thức!',
      taskBonus: 5
    },
    options: [
      {
        id: 'uu_tien_nong_thon',
        title: 'Gói Ưu Tiên Nông Nghiệp & Nông Thôn Chiến Lược',
        shortTitle: 'Ưu Tiên Nông Thôn',
        description: 'P1=60% (Chỉ tiêu nhà nước & công nghiệp nặng), P2=25% (Hợp tác nông nghiệp), P3=15% (Kinh tế hộ) | Lc=80%, θ=0.80. Tập trung nguồn lực bảo vệ vững chắc địa bàn nông thôn.',
        presetKey: 'uu_tien_nong_thon',
        preset: PHASE_3_PRESETS.uu_tien_nong_thon,
        effectsSummary: 'An toàn lương thực tuyệt đối và ổn định nông thôn, nhưng tốc độ chuyển dịch sang kinh tế tri thức chậm hơn.'
      },
      {
        id: 'toan_dien_ben_vung',
        title: 'Gói Liên Minh Toàn Diện & Phát Triển Bền Vững',
        shortTitle: 'Liên Minh Toàn Diện',
        description: 'P1=45% (Công nghiệp hiện đại), P2=35% (Nông nghiệp công nghệ), P3=20% (Kinh tế tri thức & Doanh nhân) | Lc=65%, θ=0.60. Cân đối hài hòa lợi ích giữa các giai tầng.',
        presetKey: 'toan_dien_ben_vung',
        preset: PHASE_3_PRESETS.toan_dien_ben_vung,
        effectsSummary: 'Tăng trưởng kinh tế vững chắc, củng cố toàn diện an ninh lương thực, ổn định xã hội và khối liên minh công - nông - trí thức.'
      },
      {
        id: 'dot_pha_tri_thuc',
        title: 'Gói Đột Phá Kinh Tế Tri Thức & Doanh Nhân Năng Động',
        shortTitle: 'Đột Phá Tri Thức',
        description: 'P1=30% (Nhà nước), P2=40% (Thị trường & Doanh nhân), P3=30% (Kinh tế số & Đổi mới sáng tạo) | Lc=45%, θ=0.35. Đẩy mạnh kinh tế tri thức và phát triển doanh nhân.',
        presetKey: 'dot_pha_tri_thuc',
        preset: PHASE_3_PRESETS.dot_pha_tri_thuc,
        effectsSummary: 'Tăng trưởng năng động và đổi mới sáng tạo bứt phá, nhưng đòi hỏi chính sách hỗ trợ kịp thời để không giãn cách tầng lớp.'
      }
    ]
  }
];

export const getPolicyCycle = (phaseId) => {
  return POLICY_CYCLES.find(cycle => cycle.id === phaseId) || POLICY_CYCLES[0];
};
