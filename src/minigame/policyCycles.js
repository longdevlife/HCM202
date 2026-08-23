export const PHASE_4_PRESETS = {
  plan_focus: { P1: 0.60, P2: 0.25, P3: 0.15, Lc: 80, theta: 0.80 },
  balanced_khoan: { P1: 0.45, P2: 0.35, P3: 0.20, Lc: 65, theta: 0.60 },
  incentive_risk: { P1: 0.30, P2: 0.40, P3: 0.30, Lc: 45, theta: 0.35 }
};

export const POLICY_CYCLES = [
  {
    id: 'phase_1',
    year: 1978,
    yearLabel: '1978',
    title: 'Khủng hoảng lương thực & Thử nghiệm khoán',
    subtitle: 'Hợp tác xã Đoàn Xá (Hải Phòng)',
    description: 'Sản xuất nông nghiệp theo công điểm đình đốn, thiếu đói gay gắt. Cần lựa chọn phương thức khoán để khôi phục nông nghiệp.',
    durationMs: 240000,
    decisionWindowMs: 210000,
    defaultOptionId: 'keep_piecework',
    task: {
      stationId: 'doan_xa_crisis',
      objectiveLabel: 'Xác nhận tín hiệu thiếu lương thực tại điểm Đoàn Xá',
      successText: 'Đã khảo sát thực địa tình hình sản xuất lúa và năng suất sụt giảm tại Đoàn Xá.',
      taskBonus: 5
    },
    options: [
      {
        id: 'keep_piecework',
        title: 'Duy trì công điểm tập trung',
        shortTitle: 'Duy trì công điểm',
        description: 'Tuân thủ chặt chẽ mô hình quản lý tập trung, chia công điểm truyền thống.',
        effectsSummary: 'An toàn về mặt chính sách, nhưng khủng hoảng lương thực tiếp diễn kéo dài.'
      },
      {
        id: 'try_harvest_contract',
        title: 'Thử nghiệm khoán chui khâu gặt',
        shortTitle: 'Khoán khâu gặt',
        description: 'Giao khoán trực tiếp khâu thu hoạch đến hộ gia đình nhằm tạo động lực mạnh mẽ cho xã viên.',
        effectsSummary: 'Tăng mạnh an ninh lương thực và ổn định xã hội, nhưng chịu rủi ro về mặt chính sách.'
      }
    ]
  },
  {
    id: 'phase_2',
    year: 1979,
    yearLabel: '1979',
    title: 'Hội nghị TW 6 & Tự cứu sản xuất công nghiệp',
    subtitle: 'Xí nghiệp Dệt Thành Công (TP.HCM)',
    description: 'Nhà nước thiếu ngoại tệ cấp phát nguyên liệu sợi, nhà máy đối mặt nguy cơ đóng cửa toàn bộ dây chuyền.',
    durationMs: 240000,
    decisionWindowMs: 210000,
    defaultOptionId: 'wait_state_supply',
    task: {
      stationId: 'det_thanh_cong_yarn',
      objectiveLabel: 'Xác nhận bảng thiếu sợi tại điểm Dệt Thành Công',
      successText: 'Đã thu thập dữ liệu tồn kho sợi và nhu cầu nguyên liệu khẩn cấp của xí nghiệp.',
      taskBonus: 5
    },
    options: [
      {
        id: 'wait_state_supply',
        title: 'Chờ cấp phát chỉ tiêu từ Nhà nước',
        shortTitle: 'Chờ cấp phát',
        description: 'Không tự ý tìm nguồn sợi, kiên nhẫn chờ chỉ tiêu phân bổ nguyên liệu trung ương.',
        effectsSummary: 'Bảo toàn dự trữ ngoại tệ nhà nước, nhưng máy móc đình đốn, sản lượng công nghiệp sụt giảm.'
      },
      {
        id: 'borrow_fx_import',
        title: 'Vay ngoại tệ nhập sợi (Mô hình Kế hoạch 3 phần)',
        shortTitle: 'Vay ngoại tệ nhập sợi',
        description: 'Chủ động vay vốn ngân hàng ngoại thương để nhập sợi, sản xuất và xuất khẩu trả nợ.',
        effectsSummary: 'Khôi phục mạnh sản lượng công nghiệp, giải quyết việc làm, gia tăng áp lực ngoại tệ.'
      }
    ]
  },
  {
    id: 'phase_3',
    year: 1980,
    yearLabel: '1980',
    title: 'Khảo sát thực địa & Đối thoại đổi mới tư duy',
    subtitle: 'Đoàn công tác Trung ương đi thực tế',
    description: 'Đoàn lãnh đạo cấp cao khảo sát các mô hình "xé rào" thực tiễn tại Hải Phòng, TP.HCM và Long An.',
    durationMs: 240000,
    decisionWindowMs: 210000,
    defaultOptionId: 'report_truth',
    task: {
      stationId: 'field_survey_report',
      objectiveLabel: 'Gặp điểm khảo sát và mở báo cáo thực tế',
      successText: 'Đã hoàn thành buổi làm việc và trình bày báo cáo với đoàn công tác khảo sát thực địa.',
      taskBonus: 5
    },
    options: [
      {
        id: 'hide_data',
        title: 'Che giấu số liệu "xé rào", báo cáo theo khuôn mẫu',
        shortTitle: 'Báo cáo theo khuôn mẫu',
        description: 'Tránh né rủi ro trách nhiệm tức thời, báo cáo thành tích theo đúng giáo điều cũ.',
        effectsSummary: 'Giảm nguy cơ bị thanh tra trước mắt, nhưng bỏ lỡ cơ hội tháo gỡ điểm nghẽn thể chế.'
      },
      {
        id: 'report_truth',
        title: 'Báo cáo trung thực số liệu khoán & tự cân đối',
        shortTitle: 'Báo cáo trung thực',
        description: 'Trình bày thẳng thắn hiệu quả thực tế và các nút thắt của cơ chế quản lý cũ với lãnh đạo cấp cao.',
        effectsSummary: 'Tạo đột phá để thay đổi thể chế vĩ mô, tăng cao sự ủng hộ chính sách đổi mới.'
      }
    ]
  },
  {
    id: 'phase_4',
    year: 1981,
    yearLabel: '1981',
    title: 'Thể chế hóa chính sách (Chỉ thị 100 & Quyết định 25-CP)',
    subtitle: 'Hội nghị ban hành gói phân bổ cơ chế mới',
    description: 'Chính thức ban hành cơ chế mới. Lựa chọn gói phân bổ tỷ trọng kế hoạch và khoán cho nền kinh tế.',
    durationMs: 240000,
    decisionWindowMs: 210000,
    defaultOptionId: 'balanced_khoan',
    task: {
      stationId: 'policy_allocation_1981',
      objectiveLabel: 'Chọn một gói phân bổ kế hoạch tại hội nghị tổng kết',
      successText: 'Đã hoàn tất tham mưu phân bổ gói chính sách thể chế hóa năm 1981.',
      taskBonus: 5
    },
    options: [
      {
        id: 'plan_focus',
        title: 'Gói 1: Ưu tiên Pháp lệnh (Plan Focus)',
        shortTitle: 'Ưu tiên Pháp lệnh',
        description: 'P1=60%, P2=25%, P3=15% | Lc=80%, θ=0.80. Tập trung bảo đảm chỉ tiêu nhà nước giao.',
        presetKey: 'plan_focus',
        preset: PHASE_4_PRESETS.plan_focus,
        effectsSummary: 'Hoàn thành nghiêm túc kế hoạch pháp lệnh, nhưng hạn chế động lực tự chủ của đơn vị.'
      },
      {
        id: 'balanced_khoan',
        title: 'Gói 2: Khoán Cân Đối (Balanced Khoán)',
        shortTitle: 'Khoán Cân Đối',
        description: 'P1=45%, P2=35%, P3=20% | Lc=65%, θ=0.60. Cân đối hài hòa giữa pháp lệnh và quyền tự chủ.',
        presetKey: 'balanced_khoan',
        preset: PHASE_4_PRESETS.balanced_khoan,
        effectsSummary: 'Đáp ứng kế hoạch pháp lệnh vừa đủ, đồng thời khích lệ sản xuất tự do và nâng cao đời sống.'
      },
      {
        id: 'incentive_risk',
        title: 'Gói 3: Khuyến Khích Thị Trường (Incentive Risk)',
        shortTitle: 'Khuyến Khích Thị Trường',
        description: 'P1=30%, P2=40%, P3=30% | Lc=45%, θ=0.35. Đẩy mạnh tự chủ nhưng P1 < P1Req (Phạt hành chính).',
        presetKey: 'incentive_risk',
        preset: PHASE_4_PRESETS.incentive_risk,
        effectsSummary: 'Hiệu quả tự chủ và sản lượng tối đa, nhưng vi phạm ngưỡng pháp lệnh P1Req tối thiểu 40%.'
      }
    ]
  }
];

export const getPolicyCycle = (phaseId) => {
  return POLICY_CYCLES.find(cycle => cycle.id === phaseId) || POLICY_CYCLES[0];
};
