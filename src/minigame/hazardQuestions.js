// Kho câu hỏi tình huống xử lý rủi ro / cạm bẫy công vụ
// Thay thế cơ chế đóng băng 3s bằng việc trả lời câu hỏi: Đúng cộng điểm, Sai trừ điểm

export const HAZARD_METADATA = {
  buck_passing: {
    label: "Đùn đẩy trách nhiệm",
    icon: "↪️",
    badgeColor: "#f59e0b",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    borderColor: "#f59e0b",
    theme: "Trách nhiệm thực thi",
  },
  late_deadline: {
    label: "Trễ hẹn giải quyết",
    icon: "⏳",
    badgeColor: "#f97316",
    badgeBg: "rgba(249, 115, 22, 0.15)",
    borderColor: "#f97316",
    theme: "Tôn trọng thời gian của dân",
  },
  delay: {
    label: "Trễ hạn công vụ",
    icon: "⏱️",
    badgeColor: "#f97316",
    badgeBg: "rgba(249, 115, 22, 0.15)",
    borderColor: "#f97316",
    theme: "Tiến độ công vụ",
  },
  bureaucracy: {
    label: "Thói quan liêu, hách dịch",
    icon: "📋",
    badgeColor: "#ef4444",
    badgeBg: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    theme: "Thái độ phục vụ nhân dân",
  },
  envelope: {
    label: "Cám dỗ phong bì / Lót tay",
    icon: "✉️",
    badgeColor: "#dc2626",
    badgeBg: "rgba(220, 38, 38, 0.15)",
    borderColor: "#dc2626",
    theme: "Liêm khiết & Chống hối lộ",
  },
  waste: {
    label: "Lãng phí tài sản công",
    icon: "💸",
    badgeColor: "#eab308",
    badgeBg: "rgba(234, 179, 8, 0.15)",
    borderColor: "#eab308",
    theme: "Thực hành tiết kiệm",
  },
  group_interest: {
    label: "Lợi ích nhóm & Sân sau",
    icon: "👥",
    badgeColor: "#8b5cf6",
    badgeBg: "rgba(139, 92, 246, 0.15)",
    borderColor: "#8b5cf6",
    theme: "Công tâm & Minh bạch",
  },
  personal_gain: {
    label: "Trục lợi cá nhân",
    icon: "💰",
    badgeColor: "#ec4899",
    badgeBg: "rgba(236, 72, 153, 0.15)",
    borderColor: "#ec4899",
    theme: "Chí công vô tư",
  },
  achievement_disease: {
    label: "Bệnh thành tích",
    icon: "🎯",
    badgeColor: "#06b6d4",
    badgeBg: "rgba(6, 182, 212, 0.15)",
    borderColor: "#06b6d4",
    theme: "Trung thực & Tôn trọng sự thật",
  },
  privilege: {
    label: "Đặc quyền đặc lợi",
    icon: "👑",
    badgeColor: "#a855f7",
    badgeBg: "rgba(168, 85, 247, 0.15)",
    borderColor: "#a855f7",
    theme: "Bình đẳng trước pháp luật",
  },
};

export const HAZARD_QUESTIONS = {
  buck_passing: [
    {
      id: "bp_1",
      question: "Khi công dân nộp hồ sơ thuộc diện giải quyết liên thông giữa nhiều bộ phận, cán bộ tiếp nhận cần làm gì?",
      options: [
        { key: "A", text: "Yêu cầu công dân tự mang hồ sơ sang từng phòng ban khác để tự hỏi thủ tục." },
        { key: "B", text: "Chủ động làm đầu mối tiếp nhận, hướng dẫn và phối hợp các bộ phận liên quan giải quyết đúng hạn." },
        { key: "C", text: "Từ chối tiếp nhận vì hồ sơ không hoàn toàn thuộc thẩm quyền riêng của mình." },
      ],
      correctIndex: 1,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Cán bộ công vụ phải tận tụy phục vụ, là đầu mối hỗ trợ công dân, tuyệt đối không được đùn đẩy trách nhiệm gây phiền hà cho nhân dân.",
    },
    {
      id: "bp_2",
      question: "Gặp một vụ việc phức tạp chưa có quy định phân công cụ thể giữa các phòng ban, thái độ đúng đắn là gì?",
      options: [
        { key: "A", text: "Chủ động báo cáo lãnh đạo xin ý kiến phối hợp liên phòng ban để tháo gỡ khó khăn cho người dân." },
        { key: "B", text: "Đùn việc cho phòng ban bên cạnh để tránh bị quy trách nhiệm khi có sai sót." },
        { key: "C", text: "Tạm gác hồ sơ lại một thời gian chờ đơn vị khác lên tiếng giải quyết trước." },
      ],
      correctIndex: 0,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Tinh thần trách nhiệm đòi hỏi cán bộ chủ động tham mưu, phối hợp giải quyết chứ không né tránh, thoái thác việc khó.",
    },
  ],

  late_deadline: [
    {
      id: "ld_1",
      question: "Khi hồ sơ của người dân có nguy cơ bị chậm trả kết quả so với giấy hẹn, bạn cần xử lý như thế nào?",
      options: [
        { key: "A", text: "Cứ để khi nào làm xong thì trả, không cần thông báo vì công việc quá tải ai cũng hiểu." },
        { key: "B", text: "Đổ lỗi cho hệ thống mạng bị lỗi để trốn tránh trách nhiệm cá nhân." },
        { key: "C", text: "Chủ động liên hệ xin lỗi, nêu rõ lý do và gửi văn bản hẹn lại thời gian cụ thể sớm nhất." },
      ],
      correctIndex: 2,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Tôn trọng thời gian của nhân dân là chuẩn mực bắt buộc; trễ hẹn phải công khai xin lỗi và cam kết thời gian hoàn thành cụ thể.",
    },
    {
      id: "ld_2",
      question: "Để hạn chế tối đa việc chậm trễ hồ sơ công vụ, biện pháp căn cơ và chuẩn mực nhất là gì?",
      options: [
        { key: "A", text: "Lập kế hoạch làm việc khoa học, số hóa quy trình và chủ động cảnh báo sớm các khâu nghẽn." },
        { key: "B", text: "Hẹn người dân thời gian trả kết quả thật dài để không bao giờ bị tính là trễ hạn." },
        { key: "C", text: "Chỉ tập trung xử lý hồ sơ của người quen trước, hồ sơ khác để lại sau." },
      ],
      correctIndex: 0,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Nâng cao năng lực tổ chức công việc và ứng dụng công nghệ giúp tối ưu hóa thời gian và đảm bảo tính kỷ cương trong thực thi công vụ.",
    },
  ],

  delay: [
    {
      id: "dl_1",
      question: "Việc xử lý công việc đúng thời hạn cam kết với nhân dân thể hiện nguyên tắc đạo đức công vụ nào?",
      options: [
        { key: "A", text: "Sự cứng nhắc không cần thiết trong môi trường hành chính linh hoạt." },
        { key: "B", text: "Trách nhiệm giải trình, tôn trọng nhân dân và giữ vững kỷ cương công vụ." },
        { key: "C", text: "Chỉ là tiêu chí thi đua phụ, không quan trọng bằng mối quan hệ nội bộ." },
      ],
      correctIndex: 1,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Đúng hạn là thước đo cơ bản của sự chuyên nghiệp, uy tín và sự tôn trọng người dân của bộ máy hành chính công.",
    },
  ],

  bureaucracy: [
    {
      id: "bur_1",
      question: "Khi công dân đến làm thủ tục nhưng nộp thiếu giấy tờ, thái độ và cách xử lý đúng chuẩn mực là gì?",
      options: [
        { key: "A", text: "Hướng dẫn một lần bằng Phiếu hướng dẫn bổ sung hồ sơ đầy đủ, chi tiết và rõ ràng." },
        { key: "B", text: "Trả hồ sơ về ngay và bảo người dân tự tra cứu trên mạng mà không giải thích gì thêm." },
        { key: "C", text: "Mỗi lần chỉ ra một thiếu sót nhỏ để công dân đi lại nhiều lần cho nhớ quy định." },
      ],
      correctIndex: 0,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Quy chế Một cửa nghiêm cấm bắt người dân đi lại nhiều lần; cán bộ phải hướng dẫn đầy đủ, chuẩn xác trong một lần.",
    },
    {
      id: "bur_2",
      question: "Chủ tịch Hồ Chí Minh đã chỉ rõ nguyên nhân gốc rễ sinh ra bệnh quan liêu là gì?",
      options: [
        { key: "A", text: "Do ngân sách chi cho văn phòng và tiền lương của cán bộ chưa cao." },
        { key: "B", text: "Do người dân chưa nắm bắt được các văn bản pháp luật phức tạp." },
        { key: "C", text: "Xa rời thực tế, xa rời quần chúng, không đi sâu đi sát đời sống và nguyện vọng của nhân dân." },
      ],
      correctIndex: 2,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Bác Hồ dạy: Quan liêu là nguồn gốc sinh ra tham ô, lãng phí; cán bộ phải luôn gần dân, trọng dân, lắng nghe và phục vụ dân.",
    },
  ],

  envelope: [
    {
      id: "env_1",
      question: "Một đối tác gửi kèm phong bì tiền mặt trong tập tài liệu xin phê duyệt để 'nhờ giải quyết nhanh', bạn xử lý thế nào?",
      options: [
        { key: "A", text: "Nhận tiền để làm quỹ liên hoan cơ quan vì nghĩ không dùng cho mục đích cá nhân." },
        { key: "B", text: "Kiên quyết từ chối, giải thích quy trình công khai minh bạch và báo cáo lãnh đạo nếu có dấu hiệu mua chuộc." },
        { key: "C", text: "Nhận phong bì và âm thầm giải quyết ưu tiên bỏ qua một số lỗi kỹ thuật nhỏ." },
      ],
      correctIndex: 1,
      rewardScore: 50,
      rewardIntegrity: 15,
      penaltyScore: -35,
      penaltyIntegrity: -20,
      explanation: "Nhận phong bì lót tay dưới mọi hình thức đều là hành vi tham nhũng, vi phạm nghiêm trọng pháp luật và đạo đức công vụ.",
    },
    {
      id: "env_2",
      question: "Đâu là giải pháp căn bản để ngăn ngừa hiện tượng 'phong bì lót tay' trong giải quyết thủ tục hành chính?",
      options: [
        { key: "A", text: "Công khai minh bạch toàn bộ quy trình, đẩy mạnh dịch vụ công trực tuyến và kiểm soát quyền lực." },
        { key: "B", text: "Khuyến khích các cuộc gặp gỡ riêng ngoài giờ giữa cán bộ thụ lý và doanh nghiệp." },
        { key: "C", text: "Bỏ qua các khâu thẩm định hồ sơ để rút ngắn thời gian giải quyết." },
      ],
      correctIndex: 0,
      rewardScore: 50,
      rewardIntegrity: 15,
      penaltyScore: -35,
      penaltyIntegrity: -20,
      explanation: "Minh bạch hóa và số hóa quy trình công vụ giúp triệt tiêu môi trường nảy sinh tham nhũng vặt và hành vi đưa - nhận hối lộ.",
    },
  ],

  waste: [
    {
      id: "wst_1",
      question: "Theo tư tưởng Hồ Chí Minh, tại sao hành vi lãng phí cũng nguy hại như tham ô?",
      options: [
        { key: "A", text: "Vì lãng phí là hành vi vi phạm có mức án phạt hình sự cao hơn tham ô." },
        { key: "B", text: "Vì cơ quan nhà nước không thể bù đắp được chi phí văn phòng phẩm." },
        { key: "C", text: "Lãng phí tuy không bỏ túi riêng nhưng làm hao tổn tài sản công và mồ hôi nước mắt của nhân dân." },
      ],
      correctIndex: 2,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Bác Hồ khẳng định: 'Tham ô là trộm cắp, lãng phí tuy không trộm cắp nhưng kết quả cũng tai hại cho của công và lòng tin nhân dân'.",
    },
    {
      id: "wst_2",
      question: "Hành động nào sau đây thể hiện tinh thần thực hành tiết kiệm, chống lãng phí trong công sở?",
      options: [
        { key: "A", text: "Sử dụng xe công, trang thiết bị đúng định mức, số hóa tài liệu giảm in ấn và tắt điện khi không dùng." },
        { key: "B", text: "Mua sắm trang thiết bị đắt tiền vượt tiêu chuẩn định mức quy định." },
        { key: "C", text: "Tổ chức các chuyến đi công tác kết hợp tham quan du lịch bằng ngân sách công." },
      ],
      correctIndex: 0,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Tiết kiệm là quốc sách; việc sử dụng tài sản công đúng định mức và hiệu quả là nghĩa vụ bắt buộc của mọi cán bộ.",
    },
  ],

  group_interest: [
    {
      id: "gi_1",
      question: "Khi xây dựng hồ sơ mời thầu dự án công, hành vi nào thể hiện sự vô tư, liêm chính?",
      options: [
        { key: "A", text: "Cài cắm các thông số kỹ thuật độc quyền để ưu ái riêng cho công ty 'sân sau' thân quen trúng thầu." },
        { key: "B", text: "Công khai các tiêu chuẩn kỹ thuật khách quan trên hệ thống đấu thầu quốc gia, tạo cạnh tranh bình đẳng." },
        { key: "C", text: "Tiết lộ trước thông tin giá gói thầu cho một nhà thầu quen biết." },
      ],
      correctIndex: 1,
      rewardScore: 50,
      rewardIntegrity: 15,
      penaltyScore: -35,
      penaltyIntegrity: -20,
      explanation: "Lợi ích nhóm làm méo mó chính sách và lãng phí nguồn lực công. Đấu thầu công khai, bình đẳng là yêu cầu pháp lý bắt buộc.",
    },
    {
      id: "gi_2",
      question: "Tác hại nguy hiểm nhất của 'lợi ích nhóm' trong quản lý kinh tế - xã hội là gì?",
      options: [
        { key: "A", text: "Làm lũng đoạn chính sách, thao túng phân bổ nguồn lực công và xói mòn niềm tin vào pháp luật." },
        { key: "B", text: "Giúp một vài doanh nghiệp lớn phát triển thần tốc tạo thành tích cho địa phương." },
        { key: "C", text: "Rút ngắn thời gian ra quyết định đối với các dự án đầu tư công." },
      ],
      correctIndex: 0,
      rewardScore: 50,
      rewardIntegrity: 15,
      penaltyScore: -35,
      penaltyIntegrity: -20,
      explanation: "Lợi ích nhóm tạo ra đặc quyền bất công và làm tổn hại nghiêm trọng đến lợi ích quốc gia và niềm tin của quần chúng nhân dân.",
    },
  ],

  personal_gain: [
    {
      id: "pg_1",
      question: "Chủ tịch Hồ Chí Minh ví 'Chủ nghĩa cá nhân' như thế nào trong sự nghiệp cách mạng?",
      options: [
        { key: "A", text: "Là động lực tự nhiên không thể loại bỏ trong nền kinh tế thị trường." },
        { key: "B", text: "Là kỹ năng linh hoạt cần có để vừa làm việc công vừa làm giàu bản thân." },
        { key: "C", text: "Là thứ 'giặc nội xâm', là căn bệnh mẹ sinh ra trăm thứ bệnh con nguy hiểm làm mất uy tín cán bộ." },
      ],
      correctIndex: 2,
      rewardScore: 45,
      rewardIntegrity: 15,
      penaltyScore: -35,
      penaltyIntegrity: -20,
      explanation: "Bác Hồ dạy: Quét sạch chủ nghĩa cá nhân, nâng cao đạo đức cách mạng là nhiệm vụ sống còn của mỗi người cán bộ.",
    },
    {
      id: "pg_2",
      question: "Khi đứng trước sự lựa chọn giữa lợi ích cá nhân và lợi ích tập thể, chuẩn mực công vụ đòi hỏi điều gì?",
      options: [
        { key: "A", text: "Việc công đặt lên trên hết, 'lo trước thiên hạ, vui sau thiên hạ', tuyệt đối không mưu cầu tư lợi." },
        { key: "B", text: "Ưu tiên bảo vệ lợi ích cá nhân trước, việc tập thể giải quyết sau." },
        { key: "C", text: "Chỉ cống hiến hết mình khi được hứa hẹn quyền lợi kinh tế vượt trội." },
      ],
      correctIndex: 0,
      rewardScore: 45,
      rewardIntegrity: 15,
      penaltyScore: -35,
      penaltyIntegrity: -20,
      explanation: "Cán bộ công quyền nắm giữ quyền lực do nhân dân ủy thác, phải chí công vô tư, phụng sự vì lợi ích chung của Tổ quốc và nhân dân.",
    },
  ],

  achievement_disease: [
    {
      id: "ad_1",
      question: "Đâu là tác hại sâu xa và nguy hiểm nhất của 'Bệnh thành tích' trong cơ quan nhà nước?",
      options: [
        { key: "A", text: "Giúp cơ quan dễ dàng đạt danh hiệu thi đua xuất sắc để tăng tiền thưởng." },
        { key: "B", text: "Che giấu thực trạng yếu kém, làm sai lệch dữ liệu dẫn đến hoạch định chính sách sai lầm và mất lòng tin." },
        { key: "C", text: "Tạo động lực tinh thần ảo giúp nhân viên có thêm niềm vui trong công việc." },
      ],
      correctIndex: 1,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Chủ nghĩa duy vật biện chứng và đạo đức cách mạng đòi hỏi 'tôn trọng sự thật khách quan', dũng cảm nhận khuyết điểm để sửa chữa thực chất.",
    },
    {
      id: "ad_2",
      question: "Khi một chỉ tiêu công tác chưa đạt chuẩn, hành động thể hiện dũng khí và liêm chính của cán bộ là gì?",
      options: [
        { key: "A", text: "Báo cáo trung thực số liệu, chỉ rõ nguyên nhân và đề xuất giải pháp cải tiến thực chất." },
        { key: "B", text: "'Điều chỉnh số liệu' cho đẹp mắt để giữ vững thành tích thi đua của tập thể." },
        { key: "C", text: "Đổ lỗi cho hoàn cảnh khách quan để không ai phải nhận khuyết điểm." },
      ],
      correctIndex: 0,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Người cán bộ dũng cảm và chân chính không sợ nhận khuyết điểm, mà lấy đó làm bài học để tiến bộ vững chắc.",
    },
  ],

  privilege: [
    {
      id: "prv_1",
      question: "Một người thân nhờ bạn can thiệp để ưu tiên giải quyết hồ sơ trước những người khác đang xếp hàng, bạn nên làm gì?",
      options: [
        { key: "A", text: "Lấy hồ sơ người thân chèn lên đầu hàng vì tình nghĩa gia đình phải đặt lên hàng đầu." },
        { key: "B", text: "Nhận lời giúp đỡ và yêu cầu cấp dưới giải quyết ngay không cần thẩm định." },
        { key: "C", text: "Lịch sự giải thích quy định công khai, bình đẳng; mọi hồ sơ đều giải quyết theo thứ tự niêm yết." },
      ],
      correctIndex: 2,
      rewardScore: 50,
      rewardIntegrity: 15,
      penaltyScore: -40,
      penaltyIntegrity: -25,
      explanation: "Nhà nước pháp quyền XHCN đảm bảo mọi công dân đều bình đẳng trước pháp luật, không ai được hưởng đặc quyền đặc lợi trái quy định.",
    },
    {
      id: "prv_2",
      question: "Chủ tịch Hồ Chí Minh căn dặn thế nào về việc thực hiện nguyên tắc 'Chí công vô tư'?",
      options: [
        { key: "A", text: "'Phải công bình, chính trực, không có tư ân, tư oán; việc công là việc chung của nhân dân, không thể lấy tình riêng làm sai phép nước'." },
        { key: "B", text: "Cán bộ giữ chức vụ càng cao thì càng có quyền dành ưu đãi cho người nhà." },
        { key: "C", text: "Cứ hoàn thành chỉ tiêu là được, còn việc ưu tiên người thân quen là điều có thể chấp nhận." },
      ],
      correctIndex: 0,
      rewardScore: 50,
      rewardIntegrity: 15,
      penaltyScore: -40,
      penaltyIntegrity: -25,
      explanation: "Chí công vô tư đòi hỏi cán bộ tuyệt đối không đem tình riêng xen vào công vụ, giữ vững kỷ cương phép nước.",
    },
  ],

  fallback: [
    {
      id: "fb_1",
      question: "Khi thực thi công vụ, nguyên tắc cốt lõi nào bảo đảm bộ máy hành chính nhà nước phục vụ nhân dân trong sạch, vững mạnh?",
      options: [
        { key: "A", text: "Linh hoạt ưu tiên giải quyết công việc cho những người có mối quan hệ thân quen." },
        { key: "B", text: "Tuân thủ pháp luật, công khai, minh bạch, liêm chính và đặt lợi ích của nhân dân lên trên hết." },
        { key: "C", text: "Hạn chế cung cấp thông tin cho người dân để tránh bị thắc mắc, khiếu nại." },
      ],
      correctIndex: 1,
      rewardScore: 40,
      rewardIntegrity: 10,
      penaltyScore: -30,
      penaltyIntegrity: -15,
      explanation: "Liêm chính, minh bạch và tận tụy phục vụ nhân dân là phẩm chất cốt lõi của người cán bộ nhà nước pháp quyền XHCN.",
    },
  ],
};

/**
 * Trộn ngẫu nhiên các lựa chọn câu hỏi theo seed để vị trí đáp án đúng luôn biến hóa (A, B, C)
 */
function shuffleOptions(question, seed = Date.now()) {
  const letters = ["A", "B", "C", "D", "E"];
  const optionsWithIndex = question.options.map((opt, idx) => ({ ...opt, origIndex: idx }));
  
  // Trộn thứ tự các options theo thuật toán xáo trộn deterministic hoặc random
  const numericSeed = Math.abs(Number(seed) || 0);
  const shuffled = [...optionsWithIndex];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (numericSeed * (i + 3) + 7) % (i + 1);
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }

  // Tìm vị trí mới của đáp án đúng
  const newCorrectIndex = shuffled.findIndex((item) => item.origIndex === question.correctIndex);

  const mappedOptions = shuffled.map((item, idx) => ({
    key: letters[idx] || `${idx + 1}`,
    text: item.text,
  }));

  return {
    options: mappedOptions,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

/**
 * Lấy câu hỏi phù hợp cho loại rủi ro/bẫy, tự động xáo trộn vị trí đáp án đúng (A/B/C)
 * @param {string} hazardType - Loại bẫy (ví dụ: 'envelope', 'bureaucracy', 'buck_passing', ...)
 * @param {number} seed - Số ngẫu nhiên hoặc timestamp để chọn câu hỏi & xáo trộn đáp án
 * @returns {object} Câu hỏi đã chuẩn hóa và xáo trộn đáp án
 */
export function getHazardQuestion(hazardType, seed = Date.now()) {
  const normalizedType = typeof hazardType === "string" ? hazardType.toLowerCase() : "fallback";
  const questionPool = HAZARD_QUESTIONS[normalizedType] || HAZARD_QUESTIONS.fallback;
  const questionIndex = Math.abs(Number(seed) || 0) % questionPool.length;
  const rawQuestion = questionPool[questionIndex] || questionPool[0];
  const metadata = HAZARD_METADATA[normalizedType] || {
    label: "Rủi ro công vụ",
    icon: "⚠️",
    badgeColor: "#ef4444",
    badgeBg: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
    theme: "Chuẩn mực liêm chính",
  };

  const { options, correctIndex } = shuffleOptions(rawQuestion, seed);

  return {
    ...rawQuestion,
    options,
    correctIndex,
    hazardType: normalizedType,
    metadata,
  };
}
