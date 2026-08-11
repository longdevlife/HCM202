// 2 tình huống biểu quyết A/B cho chủ đề Sứ Mệnh Liêm Chính.
export const situations = [
  {
    id: 1,
    title: "Người quen xin ưu tiên",
    story:
      "Bạn đang trực tại bộ phận tiếp nhận. Một người quen gọi điện nhờ bạn “giúp một chút”, " +
      "đưa hồ sơ của họ lên xử lý trước vì họ đang rất bận. Hồ sơ hoàn toàn bình thường và " +
      "không thuộc diện ưu tiên. Người này nói: “Có gì đâu, chỉ đổi thứ tự một chút thôi mà.”",
    optionA: {
      label: "“Linh động” giúp người quen",
      shortLabel: "Ưu tiên người quen",
      consequence:
        "Bạn có thêm điểm thành tích trước mắt, nhưng làm suy giảm nguyên tắc công bằng. " +
        "Quyền lực công bị dùng để tạo đặc quyền cho quan hệ cá nhân.",
      effects: { score: 50, integrity: -20, publicTrust: -5 },
    },
    optionB: {
      label: "Giải quyết theo quy trình công khai",
      shortLabel: "Giữ nguyên tắc",
      consequence:
        "Bạn giải thích rằng mọi hồ sơ phải được xử lý công bằng theo thứ tự và tiêu chí đã công bố. " +
        "Người dân có thể chưa hài lòng ngay, nhưng niềm tin vào sự công bằng được giữ vững.",
      effects: { integrity: 15, decisionBonus: 20, publicTrust: 5 },
    },
    discussionQuestion: "Vì sao quyền lực công không thể được dùng để tạo ưu tiên cho quan hệ cá nhân?",
    marxLenin:
      "Quyền lực nhà nước phải hướng tới phục vụ nhân dân, được thực thi công bằng, minh bạch và có trách nhiệm. " +
      "Một bộ máy trong sạch không dựa vào sự tùy tiện của cá nhân, mà dựa vào nguyên tắc, kỷ luật và công khai.",
  },
  {
    id: 2,
    title: "Áp lực từ cấp trên",
    story:
      "Cơ quan của bạn đang chuẩn bị báo cáo kết quả cuối năm. Một chỉ tiêu quan trọng chưa đạt. " +
      "Người phụ trách đề nghị nhóm điều chỉnh cách ghi nhận số liệu để báo cáo “đẹp hơn”. " +
      "Họ giải thích: “Không phải tham ô gì cả. Nếu báo cáo không đẹp thì cả đơn vị bị đánh giá thấp, " +
      "mọi người đều bị ảnh hưởng.” Nếu bạn phản đối, quan hệ với người phụ trách có thể xấu đi " +
      "và nhóm của bạn có khả năng mất thành tích thi đua.",
    optionA: {
      label: "Điều chỉnh số liệu",
      shortLabel: "Báo cáo đẹp hơn",
      consequence:
        "Thành tích trước mắt tăng, nhưng uy tín giảm mạnh vì số liệu không còn phản ánh đúng thực tế. " +
        "Khi minh bạch bị hy sinh, niềm tin nhân dân cũng suy giảm.",
      effects: { score: 100, integrity: -25, publicTrust: -5 },
    },
    optionB: {
      label: "Báo cáo đúng thực tế",
      shortLabel: "Minh bạch số liệu",
      consequence:
        "Bạn giữ nguyên số liệu, đồng thời đề xuất kế hoạch khắc phục chỉ tiêu chưa đạt. " +
        "Không có điểm thành tích tức thời, nhưng trách nhiệm và minh bạch được củng cố.",
      effects: { integrity: 20, decisionBonus: 30, publicTrust: 8 },
    },
    discussionQuestion: "Tại sao một cán bộ có thể biết B đúng nhưng vẫn chọn A?",
    marxLenin:
      "Xây dựng Nhà nước trong sạch, vững mạnh không chỉ dựa vào đạo đức cá nhân. " +
      "Cần trách nhiệm, minh bạch và cơ chế kiểm soát quyền lực để cán bộ có thể đứng vững trước áp lực thành tích, quan hệ và lợi ích.",
  },
];

export const PHASE_CONFIGS = {
  phase_1: {
    name: "Vì Dân Phục Vụ",
    emoji: "📄",
    description: "Quyền lực nhà nước phải hướng đến phục vụ nhân dân.",
    mcNarration:
      "Các bạn vừa trở thành những cán bộ trẻ tại Trung tâm phục vụ hành chính. Trước mắt các bạn là hàng loạt hồ sơ và yêu cầu của người dân. Nhiệm vụ đầu tiên rất đơn giản: làm đúng trách nhiệm, giải quyết công việc kịp thời và đừng để người dân phải chạy lòng vòng vì sự quan liêu của chúng ta.",
    mission: "Xử lý 5 hồ sơ đúng hạn và nhận 2 phản hồi tích cực.",
    learningMeaning:
      "Thực thi công vụ bắt đầu từ trách nhiệm phục vụ nhân dân: đúng quy trình, đúng hẹn và giảm phiền hà.",
    recap:
      "Bạn vừa trải nghiệm nguyên tắc vì dân phục vụ: hiệu quả công vụ phải đi cùng thái độ trách nhiệm và tôn trọng người dân.",
    collectiveGoal: { ratio: 0.7, trustReward: 8, label: "70% cán bộ hoàn thành nhiệm vụ" },
    progressGoals: [
      { type: "case_file", target: 5, label: "Hồ sơ" },
      { type: "positive_feedback", target: 2, label: "Phản hồi tốt" },
    ],
    maxBooks: 10,
    trapCount: 2,
    trapSpeed: 3.5,
    bookReward: { score: 30, integrity: 0, type: "case_file", message: "+30 Hồ sơ đúng hạn", color: "#4fc3f7" },
    supportReward: { score: 50, integrity: 5, type: "public_support", message: "+50 Hỗ trợ người dân", color: "#66bb6a" },
    feedbackReward: { score: 50, integrity: 0, type: "positive_feedback", message: "+50 Phản hồi tốt", color: "#ffca28" },
    trapPenalty: { score: -20, integrity: -5, type: "delay", message: "Trễ hẹn: -5 Uy tín", color: "#c5272d" },
    hazards: [
      { type: "buck_passing", label: "Đùn đẩy trách nhiệm", score: -20, integrity: -5, message: "Không phải việc của tôi!", durationMs: 2000 },
      { type: "late_deadline", label: "Trễ hẹn", score: -20, integrity: -5, message: "Trễ hẹn: người dân phải chờ lâu." },
      { type: "bureaucracy", label: "Quan liêu", score: -30, integrity: -10, message: "Người dân bị yêu cầu đi lại nhiều lần!" },
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
    mission: "Trong 90 giây, thu thập 3 Liêm chính và 2 Minh bạch.",
    learningMeaning:
      "Liêm chính không phải khẩu hiệu. Nó được kiểm chứng khi cán bộ có quyền xử lý công việc và gặp cám dỗ.",
    recap:
      "Bạn vừa thấy quyền lực cần được kiểm soát bằng minh bạch, kỷ luật và trách nhiệm giải trình.",
    collectiveGoal: { ratio: 0.65, trustReward: 8, label: "65% cán bộ vượt qua thử thách quyền lực" },
    progressGoals: [
      { type: "integrity_item", target: 3, label: "Liêm chính" },
      { type: "transparency", target: 2, label: "Minh bạch" },
    ],
    maxBooks: 6,
    trapCount: 4,
    trapSpeed: 5.5,
    bookReward: { score: 40, integrity: 5, type: "integrity_item", message: "+ Liêm chính", color: "#66bb6a" },
    supportReward: { score: 100, integrity: 10, type: "citizen_feedback", message: "+100 Phản ánh được xử lý", color: "#26c6da" },
    feedbackReward: { score: 40, integrity: 10, type: "transparency", message: "+ Minh bạch", color: "#ffca28" },
    trapPenalty: { score: -30, integrity: -10, type: "waste", message: "Lãng phí: -10 Uy tín", color: "#c5272d" },
    hazards: [
      { type: "envelope", label: "Phong bì", score: 0, integrity: -15, message: "Một chút cảm ơn thôi mà…" },
      { type: "waste", label: "Lãng phí", score: -30, integrity: -10, message: "Lãng phí nguồn lực công." },
      { type: "group_interest", label: "Lợi ích nhóm", score: 0, integrity: -20, message: "Lợi ích nhóm kéo lệch trách nhiệm.", durationMs: 3000 },
      { type: "bureaucracy", label: "Quan liêu", score: 0, integrity: -10, message: "Quan liêu làm người dân mất niềm tin." },
    ],
    hostEvents: [
      { type: "surprise_inspection", label: "Kiểm tra đột xuất", hint: "Spawn Minh bạch" },
      { type: "citizen_feedback", label: "Phản ánh người dân", hint: "NPC phản ánh" },
    ],
    pressureInterval: 20000,
    pressureLabel: "Áp lực thành tích",
    durationMs: 90000,
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
    maxBooks: 5,
    trapCount: 6,
    trapSpeed: 7.5,
    bookReward: { score: 35, integrity: 5, type: "transparency", message: "+ Minh bạch", color: "#26c6da" },
    supportReward: { score: 35, integrity: 5, type: "serve_people", message: "+ Phục vụ nhân dân", color: "#66bb6a" },
    feedbackReward: { score: 35, integrity: 5, type: "accountability", message: "+ Trách nhiệm", color: "#ffca28" },
    trapPenalty: { score: -20, integrity: -15, type: "achievement_disease", message: "Bệnh thành tích: -15 Uy tín", color: "#c5272d" },
    hazards: [
      { type: "personal_gain", label: "Lợi ích cá nhân", score: 0, integrity: -20, message: "Lợi ích cá nhân làm lệch công vụ." },
      { type: "group_interest", label: "Lợi ích nhóm", score: 0, integrity: -20, message: "Lợi ích nhóm làm suy giảm niềm tin." },
      { type: "bureaucracy", label: "Quan liêu", score: 0, integrity: -10, message: "Quan liêu tạo khoảng cách với nhân dân." },
      { type: "waste", label: "Lãng phí", score: -20, integrity: -10, message: "Lãng phí nguồn lực công." },
      { type: "achievement_disease", label: "Bệnh thành tích", score: 0, integrity: -15, message: "Thành tích không thể thay sự thật." },
      { type: "privilege", label: "Đặc quyền", score: 0, integrity: -25, message: "Đặc quyền phá vỡ nguyên tắc công bằng." },
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
