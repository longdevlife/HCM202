// 2 tình huống biểu quyết A/B cho chủ đề Sứ Mệnh Liêm Chính với giải thích và ý nghĩa giáo dục sâu sắc.
export const situations = [
  {
    id: 1,
    title: "Người quen xin ưu tiên xử lý trước",
    subtitle: "Thử thách về sự công tâm và nguyên tắc chí công vô tư",
    story:
      "Bạn đang trực tại Bộ phận Tiếp nhận và Trả kết quả (Một cửa). Một người quen gọi điện nhờ bạn “linh động giúp đỡ”, " +
      "chèn hồ sơ của họ lên xử lý trước vì họ đang rất bận và cần gấp. Hồ sơ này hoàn toàn bình thường, không thuộc bất kỳ diện ưu tiên nào theo quy định pháp luật. " +
      "Người này thuyết phục: “Chỉ đổi thứ tự một chút thôi mà, đâu có ai biết, tình nghĩa anh em giúp nhau lúc khó khăn!”",
    
    optionA: {
      key: "A",
      label: "“Linh động” xếp hồ sơ người quen lên trước",
      shortLabel: "Ưu tiên người quen (Lợi trước mắt)",
      meaning: "Đặt quan hệ cá nhân lên trên nguyên tắc công vụ, tạo ra đặc quyền bất công cho người quen.",
      consequence:
        "Bạn giúp được người quen giải quyết công việc nhanh chóng trước mắt, nhưng đã vi phạm nguyên tắc công bằng của Nhà nước pháp quyền. " +
        "Quyền lực công do nhân dân ủy thác bị biến thành đặc quyền riêng cho quan hệ thân hữu.",
      effects: { score: 50, integrity: -20, publicTrust: -5 },
      ethicalEvaluation: "❌ Vi phạm chuẩn mực liêm chính: Lạm dụng quyền hạn để tạo đặc quyền thân quen.",
    },

    optionB: {
      key: "B",
      label: "Giữ vững quy trình công khai, từ chối ưu tiên",
      shortLabel: "Chí công vô tư (Giữ nguyên tắc)",
      meaning: "Thực thi công vụ công tâm, bình đẳng với mọi công dân theo đúng trình tự pháp luật đã niêm yết.",
      consequence:
        "Bạn giải thích lịch sự, nhã nhặn rằng mọi hồ sơ đều được xử lý công khai, minh bạch theo thứ tự và tiêu chuẩn đã công bố. " +
        "Người quen có thể chưa hài lòng ngay, nhưng niềm tin của nhân dân vào sự công tâm của bộ máy được giữ vững tuyệt đối.",
      effects: { integrity: 15, decisionBonus: 20, publicTrust: 5 },
      ethicalEvaluation: "✅ Thực hành đúng tư tưởng Hồ Chí Minh: Chí công vô tư, việc công đặt lên trên hết.",
    },

    discussionQuestion: "Vì sao quyền lực công không được phép dùng để tạo đặc quyền cho các mối quan hệ cá nhân?",
    
    explanationSummary:
      "Trong bộ máy hành chính nhà nước, sự 'linh động' trái quy định vì quan hệ thân quen chính là mầm mống của chủ nghĩa cục bộ và tham nhũng vặt. " +
      "Một khi một người được chen ngang, quyền lợi chính đáng và thời gian của những công dân khác đang xếp hàng nghiêm túc bị tước đoạt.",

    hoChiMinhThought:
      "Chủ tịch Hồ Chí Minh căn dặn: 'Chí công vô tư là khi làm bất cứ việc gì cũng đừng nghĩ đến mình trước, khi hưởng thụ thì mình đi sau; " +
      "phải lo trước thiên hạ, vui sau thiên hạ... Việc công là việc chung của nhân dân, không thể lấy tình riêng mà làm sai phép nước.'",
    
    marxLenin:
      "Quyền lực nhà nước là quyền lực do nhân dân ủy thác để phục vụ lợi ích chung của toàn xã hội. " +
      "Bộ máy công vụ dân chủ chỉ thực sự vững mạnh khi mọi công dân đều bình đẳng trước pháp luật, không bị phân biệt đối xử bởi tiền tài hay quan hệ thân hữu.",
  },

  {
    id: 2,
    title: "Áp lực điều chỉnh số liệu báo cáo cuối năm",
    subtitle: "Thử thách về lòng trung thực và bệnh thành tích",
    story:
      "Cơ quan của bạn đang chuẩn bị báo cáo tổng kết thi đua cuối năm. Một chỉ tiêu then chốt về cải cách hành chính chưa đạt mục tiêu đề ra. " +
      "Lãnh đạo đơn vị gợi ý nhóm bạn nên 'điều chỉnh phương pháp tính' và làm đẹp số liệu để báo cáo đạt chuẩn. " +
      "Họ phân trần: “Không phải tham ô hay tư túi gì cả. Nếu báo cáo không đạt, cả tập thể mất danh hiệu thi đua, cắt tiền thưởng Tết và ảnh hưởng đến uy tín chung của đơn vị!” " +
      "Nếu bạn kiên quyết phản đối, bạn có thể phải chịu áp lực từ tập thể và bị đánh giá là 'cứng nhắc, thiếu tinh thần xây dựng'.",

    optionA: {
      key: "A",
      label: "Đồng ý 'làm đẹp' số liệu để giữ thành tích tập thể",
      shortLabel: "Báo cáo đẹp số (Thoái hiệp)",
      meaning: "Thỏa hiệp với sự dối trá, đặt thành tích ảo của tập thể lên trên sự thật và lợi ích thực chất của nhân dân.",
      consequence:
        "Đơn vị đạt danh hiệu thi đua trước mắt, nhưng uy tín thực chất bị hủy hoại. Báo cáo sai lệch che giấu những yếu kém chưa được khắc phục, " +
        "khiến chính sách tiếp theo bị sai đường và niềm tin của người dân bị xói mòn sâu sắc.",
      effects: { score: 100, integrity: -25, publicTrust: -5 },
      ethicalEvaluation: "❌ Rơi vào 'Bệnh thành tích': Dối trên lừa dưới, làm sai lệch thực tế phát triển.",
    },

    optionB: {
      key: "B",
      label: "Báo cáo trung thực số liệu & Đề xuất giải pháp khắc phục",
      shortLabel: "Minh bạch thực chất (Dũng cảm)",
      meaning: "Dũng cảm nhìn thẳng vào sự thật, chấp nhận không có thành tích ảo để tìm giải pháp cải tiến thực tế.",
      consequence:
        "Bạn kiên định bảo vệ số liệu thực tế, đồng thời chủ động xây dựng đề án nâng cao hiệu suất để khắc phục chỉ tiêu chưa đạt trong quý tới. " +
        "Tập thể có thể không đạt danh hiệu ảo ngay, nhưng uy tín, phẩm chất liêm chính và sự phát triển bền vững được bảo tồn vững chắc.",
      effects: { integrity: 20, decisionBonus: 30, publicTrust: 8 },
      ethicalEvaluation: "✅ Giữ vững đạo đức công vụ: Trung thực, thẳng thắn, dám nhận khuyết điểm để tiến bộ.",
    },

    discussionQuestion: "Tại sao một cán bộ biết rõ phương án B là đúng đắn nhưng trong thực tế vẫn rất dễ chọn phương án A?",

    explanationSummary:
      "Bệnh thành tích và tâm lý dĩ hòa vi quý tạo ra sức ép vô hình rất lớn trong môi trường công sở. " +
      "Người dám trung thực báo cáo đúng thực trạng thường phải đánh đổi lợi ích trước mắt, nhưng đó là điều kiện tiên quyết để sửa chữa khuyết điểm và phát triển thực chất.",

    hoChiMinhThought:
      "Bác Hồ đã chỉ rõ: 'Bệnh thành tích, thói ba hoa, dối trá là kẻ thù nguy hiểm của cách mạng. Phải thật thà, thật lòng, việc gì tốt thì nói tốt, việc gì xấu thì nói xấu; " +
      "không được giấu giếm khuyết điểm. Người cán bộ có gan thừa nhận khuyết điểm mới là người cán bộ dũng cảm và chân chính.'",

    marxLenin:
      "Nguyên tắc cơ bản của chủ nghĩa duy vật biện chứng là 'tôn trọng quy luật khách quan và tôn trọng hiện thực khách quan'. " +
      "Một chính quyền xã hội chủ nghĩa muốn lãnh đạo nhân dân thành công thì mọi chủ trương, chính sách phải dựa trên thông tin chính xác, minh bạch và khoa học.",
  },
];

export const PHASE_CONFIGS = {
  phase_1: {
    name: "Vì Dân Phục Vụ",
    emoji: "📄",
    description: "Quyền lực nhà nước phải hướng đến phục vụ nhân dân.",
    mcNarration:
      "Các bạn vừa trở thành những cán bộ trẻ tại Trung tâm phục vụ hành chính. Trước mắt các bạn là hàng loạt hồ sơ và yêu cầu của người dân. Nhiệm vụ đầu tiên rất đơn giản: làm đúng trách nhiệm, giải quyết công việc kịp thời và đừng để người dân phải chạy lòng vòng vì sự quan liêu của chúng ta.",
    mission: "Xử lý 2 hồ sơ đúng hạn và nhận 1 phản hồi tích cực.",
    learningMeaning:
      "Thực thi công vụ bắt đầu từ trách nhiệm phục vụ nhân dân: đúng quy trình, đúng hẹn và giảm phiền hà.",
    recap:
      "Bạn vừa trải nghiệm nguyên tắc vì dân phục vụ: hiệu quả công vụ phải đi cùng thái độ trách nhiệm và tôn trọng người dân.",
    collectiveGoal: { ratio: 0.7, trustReward: 8, label: "70% cán bộ hoàn thành nhiệm vụ" },
    progressGoals: [
      { type: "case_file", target: 2, label: "Hồ sơ" },
      { type: "positive_feedback", target: 1, label: "Phản hồi tốt" },
    ],
    maxBooks: 18,
    trapCount: 4,
    trapSpeed: 3.5,
    bookReward: { score: 30, integrity: 0, type: "case_file", message: "+30 Hồ sơ đúng hạn", color: "#4fc3f7" },
    supportReward: { score: 50, integrity: 5, type: "public_support", message: "+50 Hỗ trợ người dân", color: "#66bb6a" },
    feedbackReward: { score: 50, integrity: 0, type: "positive_feedback", message: "+50 Phản hồi tốt", color: "#ffca28" },
    trapPenalty: { score: -25, integrity: -10, type: "delay", message: "Trễ hẹn: -25 Điểm, -10 Liêm chính", color: "#c5272d" },
    hazards: [
      { type: "buck_passing", label: "Đùn đẩy trách nhiệm", score: -25, integrity: -10, message: "Không phải việc của tôi! (-25đ, -10 liêm chính)", durationMs: 3000 },
      { type: "late_deadline", label: "Trễ hẹn", score: -25, integrity: -10, message: "Trễ hẹn: người dân phải chờ lâu! (-25đ, -10 liêm chính)", durationMs: 3000 },
      { type: "bureaucracy", label: "Quan liêu", score: -30, integrity: -15, message: "Người dân bị yêu cầu đi lại nhiều lần! (-30đ, -15 liêm chính)", durationMs: 3000 },
    ],
    hostEvents: [
      { type: "case_peak", label: "Cao điểm hồ sơ", hint: "Tăng hồ sơ trong 15s" },
      { type: "citizen_support", label: "Người dân cần hỗ trợ", hint: "Spawn NPC hỗ trợ" },
      { type: "feedback_wave", label: "Đợt phản ánh", hint: "Cụm phản hồi tốt" },
    ],
    pressureInterval: 0,
    pressureLabel: "",
  },
  phase_2: {
    name: "Thử Thách Quyền Lực",
    emoji: "🛡️",
    description: "Khi có quyền lực, cán bộ phải đối mặt với nhiều cám dỗ hơn.",
    mcNarration:
      "Công việc đã đi vào guồng, nhưng quyền lực luôn đi kèm thử thách. Các bạn sẽ gặp áp lực thành tích, quan hệ nội bộ và những lời mời tưởng như vô hại. Hãy giữ liêm chính, công khai và trách nhiệm trong từng lựa chọn.",
    mission: "Trong 5 phút, thu thập 2 Liêm chính và 1 Minh bạch.",
    learningMeaning:
      "Liêm chính không phải khẩu hiệu. Nó được kiểm chứng khi cán bộ có quyền xử lý công việc và gặp cám dỗ.",
    recap:
      "Bạn vừa thấy quyền lực cần được kiểm soát bằng minh bạch, kỷ luật và trách nhiệm giải trình.",
    collectiveGoal: { ratio: 0.65, trustReward: 8, label: "65% cán bộ vượt qua thử thách quyền lực" },
    progressGoals: [
      { type: "integrity_item", target: 2, label: "Liêm chính" },
      { type: "transparency", target: 1, label: "Minh bạch" },
    ],
    maxBooks: 16,
    trapCount: 6,
    trapSpeed: 5.5,
    bookReward: { score: 40, integrity: 5, type: "integrity_item", message: "+ Liêm chính", color: "#66bb6a" },
    supportReward: { score: 100, integrity: 10, type: "citizen_feedback", message: "+100 Phản ánh được xử lý", color: "#26c6da" },
    feedbackReward: { score: 40, integrity: 10, type: "transparency", message: "+ Minh bạch", color: "#ffca28" },
    trapPenalty: { score: -30, integrity: -15, type: "waste", message: "Lãng phí: -30 Điểm, -15 Liêm chính", color: "#c5272d" },
    hazards: [
      { type: "envelope", label: "Phong bì", score: -25, integrity: -15, message: "Nhận phong bì lót tay: -25 Điểm, -15 Liêm chính!", durationMs: 3000 },
      { type: "waste", label: "Lãng phí", score: -30, integrity: -10, message: "Lãng phí nguồn lực công: -30 Điểm, -10 Liêm chính!", durationMs: 3000 },
      { type: "group_interest", label: "Lợi ích nhóm", score: -35, integrity: -20, message: "Lợi ích nhóm kéo lệch trách nhiệm: -35 Điểm, -20 Liêm chính!", durationMs: 3000 },
      { type: "bureaucracy", label: "Quan liêu", score: -25, integrity: -10, message: "Quan liêu làm người dân mất niềm tin: -25 Điểm, -10 Liêm chính!", durationMs: 3000 },
    ],
    hostEvents: [
      { type: "surprise_inspection", label: "Kiểm tra đột xuất", hint: "Spawn Minh bạch" },
      { type: "citizen_feedback", label: "Phản ánh người dân", hint: "NPC phản ánh" },
    ],
    pressureInterval: 20000,
    pressureLabel: "Áp lực thành tích",
    durationMs: 300000,
  },
  phase_3: {
    name: "Giữ Vững Liêm Chính",
    emoji: "🏛️",
    description: "Một bộ máy mạnh phải vừa hiệu quả, vừa trong sạch.",
    mcNarration:
      "Chặng cuối là lúc các bạn phải giữ vững liêm chính trong một môi trường phức tạp hơn. Hãy thu thập Minh bạch, Trách nhiệm và Phục vụ nhân dân, sau đó tiến tới Trung tâm Công khai & Giải trình.",
    mission: "Thu thập 1 Minh bạch, 1 Trách nhiệm, 1 Phục vụ nhân dân rồi tới Trung tâm Công khai & Giải trình.",
    learningMeaning:
      "Nhà nước trong sạch, vững mạnh cần cả đạo đức cán bộ lẫn cơ chế công khai, trách nhiệm và kiểm soát quyền lực.",
    recap:
      "Bạn vừa thấy một bộ máy mạnh không chỉ làm nhanh, mà còn phải minh bạch, trách nhiệm và đặt nhân dân ở trung tâm.",
    collectiveGoal: { ratio: 0.65, trustReward: 10, label: "65% cán bộ hoàn thành nhiệm vụ cuối" },
    progressGoals: [
      { type: "transparency", target: 1, label: "Minh bạch" },
      { type: "accountability", target: 1, label: "Trách nhiệm" },
      { type: "serve_people", target: 1, label: "Phục vụ ND" },
      { type: "public_center", target: 1, label: "TT công khai" },
    ],
    maxBooks: 15,
    trapCount: 8,
    trapSpeed: 7.5,
    bookReward: { score: 35, integrity: 5, type: "transparency", message: "+ Minh bạch", color: "#26c6da" },
    supportReward: { score: 35, integrity: 5, type: "serve_people", message: "+ Phục vụ nhân dân", color: "#66bb6a" },
    feedbackReward: { score: 35, integrity: 5, type: "accountability", message: "+ Trách nhiệm", color: "#ffca28" },
    trapPenalty: { score: -30, integrity: -15, type: "achievement_disease", message: "Bệnh thành tích: -30 Điểm, -15 Liêm chính", color: "#c5272d" },
    hazards: [
      { type: "personal_gain", label: "Lợi ích cá nhân", score: -30, integrity: -20, message: "Lợi ích cá nhân làm lệch công vụ: -30đ, -20 Liêm chính!", durationMs: 3000 },
      { type: "group_interest", label: "Lợi ích nhóm", score: -35, integrity: -20, message: "Lợi ích nhóm làm suy giảm niềm tin: -35đ, -20 Liêm chính!", durationMs: 3000 },
      { type: "bureaucracy", label: "Quan liêu", score: -25, integrity: -10, message: "Quan liêu tạo khoảng cách với nhân dân: -25đ, -10 Liêm chính!", durationMs: 3000 },
      { type: "waste", label: "Lãng phí", score: -25, integrity: -10, message: "Lãng phí nguồn lực công: -25đ, -10 Liêm chính!", durationMs: 3000 },
      { type: "achievement_disease", label: "Bệnh thành tích", score: -30, integrity: -15, message: "Thành tích không thể thay sự thật: -30đ, -15 Liêm chính!", durationMs: 3000 },
      { type: "privilege", label: "Đặc quyền", score: -40, integrity: -25, message: "Đặc quyền phá vỡ nguyên tắc công bằng: -40đ, -25 Liêm chính!", durationMs: 3000 },
    ],
    hostEvents: [
      { type: "final_pressure", label: "Tăng áp lực", hint: "Hazard nhanh hơn" },
      { type: "recovery_chance", label: "Cơ hội khắc phục", hint: "Spawn item tốt" },
    ],
    pressureInterval: 0,
    pressureLabel: "Thử thách cuối cùng",
    durationMs: 120000,
  },
};
