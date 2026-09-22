// BỘ 5 CÂU ĐỐ GHÉP TỰA ĐỀ BÀI HỌC - CHIẾC NÓN KỲ DIỆU (CHƯƠNG 5 MLN131)

export const FULL_LESSON_TITLE =
  "Cơ cấu xã hội – giai cấp trong thời kì quá độ lên chủ nghĩa xã hội";

export const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    num: 1,
    typeTag: "Đuổi hình bắt chữ",
    title: "Câu 1: Đuổi Hình Bắt Chữ",
    shortLabel: "Câu 1",
    secretWord: "Cơ cấu",
    points: 100,
    badge: "MẢNH GHÉP 1",
    questionType: "image_riddle",
    wordPattern: ["_ _", "_ _ _"], // CƠ - CẤU
    acceptedAnswers: ["cơ cấu", "co cau", "cơ cấu ", "co cau "],
    visualImages: [
      {
        src: "/images/chiecnon/bodybuilder_muscle.jpg",
      },
      {
        src: "/images/chiecnon/fisherman_angling.jpg",
        hasAcuteAccent: true,
      },
    ],
    question: "Ghép hai hình lại ta được từ gì?",
    options: [
      { id: "A", text: "Cơ cấu", isCorrect: true },
      { id: "B", text: "Cơ bắp", isCorrect: false },
      { id: "C", text: "Câu cá", isCorrect: false },
      { id: "D", text: "Cấu trúc", isCorrect: false },
    ],
    explanation:
      "Chính xác! 'Bắp cơ' (CƠ) ghép với 'Câu cá thêm dấu sắc' (CẤU) = 'CƠ CẤU' — Mảnh ghép đầu tiên cấu thành tựa đề bài học!",
  },
  {
    id: "q2",
    num: 2,
    typeTag: "Câu hỏi trắc nghiệm",
    title: "Câu 2: Câu Hỏi Trắc Nghiệm",
    shortLabel: "Câu 2",
    secretWord: "Xã hội",
    points: 100,
    badge: "MẢNH GHÉP 2",
    questionType: "multiple_choice",
    wordPattern: ["_ _", "_ _ _"], // XÃ - HỘI
    acceptedAnswers: ["xã hội", "xa hoi", "xã hội ", "xa hoi "],
    question:
      "Từ nào gồm 2 chữ, dùng để chỉ một tập thể đông đảo con người cùng sinh sống, gắn kết và tương tác với nhau trong một quốc gia hay cộng đồng (thường ghép chung với từ 'loài người')?",
    options: [
      { id: "A", text: "Xã hội", isCorrect: true },
      { id: "B", text: "Xã đoàn", isCorrect: false },
      { id: "C", text: "Cộng đồng", isCorrect: false },
      { id: "D", text: "Tập thể", isCorrect: false },
    ],
    explanation:
      "Chính xác! 'XÃ HỘI' là khái niệm chỉ cộng đồng tập thể con người gắn kết qua các quan hệ sinh sống và sản xuất ('Xã hội loài người') — Mảnh ghép thứ hai!",
  },
  {
    id: "q3",
    num: 3,
    typeTag: "Câu hỏi trắc nghiệm",
    title: "Câu 3: Câu Hỏi Trắc Nghiệm",
    shortLabel: "Câu 3",
    secretWord: "Giai cấp",
    points: 100,
    badge: "MẢNH GHÉP 3",
    questionType: "multiple_choice",
    wordPattern: ["_ _ _ _", "_ _ _"], // GIAI - CẤP
    acceptedAnswers: ["giai cấp", "giai cap", "giai cấp ", "giai cap "],
    question:
      "Trong lịch sử và xã hội học, công nhân, nông dân hay tư sản được gọi chung bằng thuật ngữ 2 chữ nào?",
    options: [
      { id: "A", text: "Giai tầng", isCorrect: false },
      { id: "B", text: "Giai cấp", isCorrect: true },
      { id: "C", text: "Tầng lớp", isCorrect: false },
      { id: "D", text: "Giới tính", isCorrect: false },
    ],
    explanation:
      "Chính xác! 'GIAI CẤP' là các tập đoàn người to lớn khác nhau về địa vị trong hệ thống sản xuất xã hội (Công nhân, Nông dân, Tư sản...) — Mảnh ghép thứ ba!",
  },
  {
    id: "q4",
    num: 4,
    typeTag: "Sắp xếp ô chữ đảo lộn",
    title: "Câu 4: Sắp Xếp Ô Chữ Ngang Lộn Xộn",
    shortLabel: "Câu 4",
    secretWord: "Thời kì quá độ",
    points: 100,
    badge: "MẢNH GHÉP 4",
    questionType: "anagram", // purely letter tiles & underlines, no multiple choice!
    scrambledTiles: ["Ờ", "K", "Á", "Đ", "I", "Ộ", "T", "H", "Ì", "U", "Q"],
    wordPattern: ["_ _ _ _", "_ _", "_ _ _", "_ _"], // THỜI - KÌ - QUÁ - ĐỘ
    targetWords: ["THỜI", "KÌ", "QUÁ", "ĐỘ"],
    acceptedAnswers: [
      "thời kì quá độ",
      "thoi ki qua do",
      "thời kỳ quá độ",
      "thoi ky qua do",
    ],
    question:
      "Sắp xếp lại dãy chữ cái đang bị đảo lộn trong một hàng ngang sau đây để tìm tên giai đoạn chuyển tiếp lên CNXH (gồm 4 tiếng, 11 chữ cái):\n[ Ờ ] [ K ] [ Á ] [ Đ ] [ I ] [ Ộ ] [ T ] [ H ] [ Ì ] [ U ] [ Q ]",
    options: [
      { id: "A", text: "Thời kì quá độ", isCorrect: true },
    ],
    explanation:
      "Chính xác! 11 chữ cái [ Ờ, K, Á, Đ, I, Ộ, T, H, Ì, U, Q ] ghép lại thành 'THỜI KÌ QUÁ ĐỘ' — Giai đoạn cải biến cách mạng sâu sắc chuyển tiếp từ xã hội cũ lên CNXH!",
  },
  {
    id: "q5",
    num: 5,
    typeTag: "Đuổi hình bắt chữ",
    title: "Câu 5: Đuổi Hình Bắt Chữ (4 Ô Liên Hoàn)",
    shortLabel: "Câu 5",
    secretWord: "Chủ nghĩa xã hội",
    points: 100,
    badge: "MẢNH GHÉP 5",
    questionType: "image_riddle",
    wordPattern: ["_ _ _", "_ _ _ _ _", "_ _", "_ _ _"], // CHỦ - NGHĨA - XÃ - HỘI
    acceptedAnswers: [
      "chủ nghĩa xã hội",
      "chu nghia xa hoi",
      "chủ nghĩa xã hội ",
      "chu nghia xa hoi ",
    ],
    visualImages: [
      {
        src: "/images/chiecnon/red_ownership_book.jpg",
      },
      {
        src: "/images/chiecnon/chivalric_handshake.jpg",
      },
      {
        src: "/images/chiecnon/fresh_lemongrass.jpg",
      },
      {
        src: "/images/chiecnon/festive_crowd.jpg",
      },
    ],
    question: "Ghép bốn hình lại ta được cụm từ gì?",
    options: [
      { id: "A", text: "Chủ nghĩa xã hội", isCorrect: true },
      { id: "B", text: "Sở hữu toàn dân", isCorrect: false },
      { id: "C", text: "Xã hội chủ nghĩa", isCorrect: false },
      { id: "D", text: "Hiệp nghĩa xã hội", isCorrect: false },
    ],
    explanation:
      "Chính xác! 'Người làm CHỦ' + 'Trọn chữ NGHĨA' + 'Củ sả lái XÃ' + 'Trẩy HỘI' = 'CHỦ NGHĨA XÃ HỘI' — Mảnh ghép thứ năm hoàn tất tựa đề bài học!",
  },
];

// 5 Slices on the spinning wheel (chỉ giữ lại các ô câu hỏi)
export const WHEEL_SLICES = [
  {
    id: "slice_q1",
    type: "question",
    questionId: "q1",
    label: "CÂU 1",
    subLabel: "Đuổi Hình",
    color: "#e11d48", // Crimson
    textColor: "#ffffff",
  },
  {
    id: "slice_q2",
    type: "question",
    questionId: "q2",
    label: "CÂU 2",
    subLabel: "Trắc Nghiệm",
    color: "#059669", // Emerald
    textColor: "#ffffff",
  },
  {
    id: "slice_q3",
    type: "question",
    questionId: "q3",
    label: "CÂU 3",
    subLabel: "Trắc Nghiệm",
    color: "#2563eb", // Blue
    textColor: "#ffffff",
  },
  {
    id: "slice_q4",
    type: "question",
    questionId: "q4",
    label: "CÂU 4",
    subLabel: "Xếp Chữ",
    color: "#d97706", // Dark Amber
    textColor: "#ffffff",
  },
  {
    id: "slice_q5",
    type: "question",
    questionId: "q5",
    label: "CÂU 5",
    subLabel: "4 Ô Hình",
    color: "#7c3aed", // Violet
    textColor: "#ffffff",
  },
];

// Nội dung Tổng kết Bài học chi tiết và hàn lâm (KẾT NỘI DUNG BÀI HỌC)
export const LESSON_SUMMARY = {
  header: {
    tag: "TỔNG KẾT TOÀN DIỆN BÀI HỌC · CHƯƠNG 5 MLN131",
    title: "Cơ Cấu Xã Hội – Giai Cấp Trong Thời Kì Quá Độ Lên Chủ Nghĩa Xã Hội",
    subtitle:
      "Tựa đề bài học được giải mã trọn vẹn từ 5 câu đố: [Cơ cấu] + [Xã hội] + [Giai cấp] + [Thời kì quá độ] + [Chủ nghĩa xã hội]. Dưới đây là toàn bộ hệ thống tri thức và kết luận cốt lõi.",
    academicRef: "Giáo trình Chủ nghĩa xã hội khoa học (Bộ GD&ĐT) – Chương 5",
  },
  takeaways: [
    {
      num: "01",
      keyword: "CƠ CẤU",
      title: "Tính hệ thống & Các mối quan hệ xã hội nền tảng",
      content:
        "Cơ cấu xã hội không đơn thuần là phép cộng cơ học giữa các nhóm người, mà là hệ thống các giai cấp, tầng lớp tồn tại khách quan cùng các mối quan hệ xã hội về sở hữu tư liệu sản xuất, tổ chức quản lý lao động và phân phối của cải vật chất.",
      badge: "MẢNH GHÉP 1",
      accent: "#e11d48",
    },
    {
      num: "02",
      keyword: "XÃ HỘI",
      title: "Vị trí trung tâm chi phối các loại hình cơ cấu khác",
      content:
        "Trong toàn bộ xã hội (gồm cơ cấu dân số, nghề nghiệp, dân tộc, tôn giáo), cơ cấu xã hội – giai cấp giữ vị trí trung tâm, quyết định bản chất kinh tế – chính trị của chế độ và là căn cứ hoạch định chính sách đại đoàn kết.",
      badge: "MẢNH GHÉP 2",
      accent: "#059669",
    },
    {
      num: "03",
      keyword: "GIAI CẤP",
      title: "Sứ mệnh giai cấp công nhân & Hạt nhân liên minh",
      content:
        "Giai cấp công nhân Việt Nam là giai cấp lãnh đạo cách mạng thông qua Đảng Cộng sản; cùng với giai cấp nông dân và đội ngũ trí thức tạo thành khối liên minh nòng cốt, đồng thời phát huy mạnh mẽ vai trò của đội ngũ doanh nhân trong thời đại mới.",
      badge: "MẢNH GHÉP 3",
      accent: "#2563eb",
    },
    {
      num: "04",
      keyword: "THỜI KÌ QUÁ ĐỘ",
      title: "Quy luật biến đổi kinh tế quy định giai cấp",
      content:
        "Trong thời kì quá độ lên CNXH, sự tồn tại khách quan của nền kinh tế nhiều thành phần vận hành theo cơ chế thị trường định hướng XHCN quy định tính chất phong phú, đa dạng, vừa hợp tác vừa đấu tranh của các giai cấp, tầng lớp xã hội.",
      badge: "MẢNH GHÉP 4",
      accent: "#d97706",
    },
    {
      num: "05",
      keyword: "CHỦ NGHĨA XÃ HỘI",
      title: "Đích đến tối thượng: Dân giàu, nước mạnh, dân chủ, công bằng, văn minh",
      content:
        "Mục tiêu cao nhất của liên minh giai cấp và đại đoàn kết toàn dân tộc là đưa đất nước vững bước đi lên chủ nghĩa xã hội — giải phóng con người, phát triển lực lượng sản xuất hiện đại và bảo đảm cuộc sống ấm no, tự do, hạnh phúc cho toàn thể nhân dân.",
      badge: "MẢNH GHÉP 5",
      accent: "#7c3aed",
    },
  ],
  quote: {
    text: "“Sự biến đổi của cơ cấu xã hội – giai cấp luôn gắn liền và bị quy định bởi sự biến đổi của cơ cấu kinh tế. Liên minh giữa giai cấp công nhân với giai cấp nông dân và đội ngũ trí thức là nền tảng của Nhà nước ta, là động lực chủ yếu của sự phát triển đất nước.”",
    source: "Văn kiện Đại hội Đại biểu Toàn quốc Đảng Cộng sản Việt Nam",
  },
};
