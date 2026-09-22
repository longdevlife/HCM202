// Dữ liệu 5 câu hỏi trọng tâm & Kết nội dung bài học - Chiếc Nón Kỳ Diệu (Chương 5 MLN131)

export const DEFAULT_QUESTIONS = [
  {
    id: "q1",
    num: 1,
    title: "Câu 1: Vị trí của Cơ cấu XH - Giai cấp",
    shortLabel: "Câu 1",
    points: 100,
    badge: "LÝ LUẬN CỐT LÕI",
    question:
      "Trong hệ thống các loại hình cơ cấu xã hội (dân cư, nghề nghiệp, dân tộc, tôn giáo...), vì sao cơ cấu xã hội – giai cấp lại giữ vị trí trung tâm và có ý nghĩa quyết định nhất?",
    options: [
      {
        id: "A",
        text: "Vì cơ cấu xã hội – giai cấp liên quan trực tiếp đến quan hệ sở hữu tư liệu sản xuất, quyền lực nhà nước và quyết định bản chất kinh tế – chính trị của chế độ xã hội.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Vì đây là cơ cấu xã hội duy nhất tồn tại và vận động trong mọi thời kỳ lịch sử.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Vì các loại hình cơ cấu xã hội khác không hề có bất kỳ vai trò hay tác động nào đến đời sống con người.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Vì cơ cấu xã hội – giai cấp chỉ đơn thuần đo lường tỷ lệ phân bố dân số theo khu vực địa lý.",
        isCorrect: false,
      },
    ],
    explanation:
      "Chủ nghĩa Mác - Lênin khẳng định: Cơ cấu xã hội - giai cấp giữ vị trí hàng đầu và chi phối các cơ cấu khác vì nó liên quan trực tiếp đến quan hệ sản xuất, địa vị thống trị/lãnh đạo, quyền lực nhà nước và sự phân phối của cải trong xã hội.",
  },
  {
    id: "q2",
    num: 2,
    title: "Câu 2: Quy luật biến đổi trong thời kỳ quá độ",
    shortLabel: "Câu 2",
    points: 100,
    badge: "QUY LUẬT KINH TẾ",
    question:
      "Yếu tố khách quan nào quy định tính biến đổi đa dạng, phức tạp và đan xen của cơ cấu xã hội – giai cấp trong thời kỳ quá độ lên CNXH ở Việt Nam?",
    options: [
      {
        id: "A",
        text: "Ý chí chủ quan và mệnh lệnh hành chính của các cơ quan quản lý nhà nước.",
        isCorrect: false,
      },
      {
        id: "B",
        text: "Sự biến đổi của cơ cấu kinh tế nhiều thành phần, nhiều hình thức sở hữu vận hành theo cơ chế thị trường định hướng XHCN.",
        isCorrect: true,
      },
      {
        id: "C",
        text: "Sự tác động ngẫu nhiên của các trào lưu tiêu dùng và lối sống cá nhân hóa trong giới trẻ.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Sự du nhập ồ ạt không kiểm soát của các tôn giáo và tín ngưỡng mới từ phương Tây.",
        isCorrect: false,
      },
    ],
    explanation:
      "Cơ cấu kinh tế quy định cơ cấu xã hội - giai cấp. Nền kinh tế nhiều thành phần (kinh tế nhà nước, tập thể, tư nhân, có vốn đầu tư nước ngoài) tất yếu dẫn đến một cơ cấu xã hội - giai cấp phong phú, đa dạng và đan xen lợi ích.",
  },
  {
    id: "q3",
    num: 3,
    title: "Câu 3: Sứ mệnh & Vị trí của Giai cấp Công nhân",
    shortLabel: "Câu 3",
    points: 100,
    badge: "LỰC LƯỢNG TIÊN PHONG",
    question:
      "Trong thời kỳ đẩy mạnh CNH - HĐH và hội nhập quốc tế, giai cấp công nhân Việt Nam giữ vị trí và vai trò gì trong cơ cấu xã hội?",
    options: [
      {
        id: "A",
        text: "Là giai cấp lãnh đạo cách mạng thông qua Đảng Cộng sản, lực lượng nòng cốt đi đầu trong sự nghiệp công nghiệp hóa, hiện đại hóa đất nước.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Là lực lượng chỉ tham gia gia công giản đơn, không cần phát triển năng lực tri thức hay công nghệ số.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Là tập hợp những người lao động chỉ phục vụ cho lợi ích riêng của các doanh nghiệp nhà nước.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Là lực lượng sẽ dần bị triệt tiêu hoàn toàn và nhường toàn bộ quyền lực cho các nhà tư bản tài chính.",
        isCorrect: false,
      },
    ],
    explanation:
      "Giai cấp công nhân Việt Nam là lực lượng lãnh đạo cách mạng thông qua đội tiên phong là Đảng Cộng sản Việt Nam; là giai cấp tiên phong trong phát triển kinh tế số, công nghiệp hiện đại và là hạt nhân liên minh giai cấp.",
  },
  {
    id: "q4",
    num: 4,
    title: "Câu 4: Nội dung cốt lõi của Liên minh Giai tầng",
    shortLabel: "Câu 4",
    points: 100,
    badge: "NỀN TẢNG LIÊN MINH",
    question:
      "Trong các nội dung của liên minh giai cấp, tầng lớp (kinh tế, chính trị, văn hóa – xã hội) ở nước ta, nội dung nào giữ vai trò quyết định nhất?",
    options: [
      {
        id: "A",
        text: "Nội dung chính trị về việc giữ vững vai trò lãnh đạo độc tôn của các tầng lớp tư sản.",
        isCorrect: false,
      },
      {
        id: "B",
        text: "Nội dung văn hóa - tinh thần về việc tổ chức các phong trào sinh hoạt tập thể.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Nội dung kinh tế (thỏa mãn lợi ích thiết thực, kết hợp hài hòa lợi ích, hợp tác sản xuất - kinh doanh và phân phối công bằng).",
        isCorrect: true,
      },
      {
        id: "D",
        text: "Nội dung áp đặt các chỉ tiêu pháp lệnh và phân phối cào bằng theo thời kỳ bao cấp.",
        isCorrect: false,
      },
    ],
    explanation:
      "Theo quan điểm Mác - Lênin, liên minh về kinh tế là cơ sở vật chất - kỹ thuật vững chắc nhất của khối liên minh. Lợi ích kinh tế chính là động lực trực tiếp gắn kết công nhân, nông dân, trí thức và doanh nhân cùng phát triển.",
  },
  {
    id: "q5",
    num: 5,
    title: "Câu 5: Mục tiêu chiến lược & Đại đoàn kết",
    shortLabel: "Câu 5",
    points: 100,
    badge: "ĐÍCH ĐẾN PHÁT TRIỂN",
    question:
      "Mục tiêu chung cao nhất quy tụ mọi giai cấp, tầng lớp xã hội trong khối đại đoàn kết toàn dân tộc ở Việt Nam hiện nay là gì?",
    options: [
      {
        id: "A",
        text: "Thực hiện thành công mục tiêu: Dân giàu, nước mạnh, dân chủ, công bằng, văn minh, vững bước đi lên chủ nghĩa xã hội.",
        isCorrect: true,
      },
      {
        id: "B",
        text: "Bảo tồn tuyệt đối phương thức sản xuất thủ công truyền thống, hạn chế tiếp nhận công nghệ cao.",
        isCorrect: false,
      },
      {
        id: "C",
        text: "Xóa bỏ tính chủ động và sở hữu hợp pháp của các thành phần kinh tế tư nhân trong nước.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Đóng cửa biên giới kinh tế để tự cung tự cấp hoàn toàn, không phụ thuộc vào chuỗi cung ứng thế giới.",
        isCorrect: false,
      },
    ],
    explanation:
      "Mục tiêu độc lập dân tộc gắn liền với CNXH — 'Dân giàu, nước mạnh, dân chủ, công bằng, văn minh' chính là điểm tương đồng lớn nhất để khơi dậy lòng yêu nước, ý chí tự lực tự cường và đoàn kết mọi người Việt Nam.",
  },
];

// 10 Slices on the spinning wheel (incorporating the 5 questions + lucky/bonus elements in classic Wheel of Fortune style)
export const WHEEL_SLICES = [
  {
    id: "slice_q1",
    type: "question",
    questionId: "q1",
    label: "CÂU 1",
    subLabel: "Vị trí CCXH",
    color: "#e11d48", // Crimson
    textColor: "#ffffff",
    points: 100,
  },
  {
    id: "slice_bonus_100",
    type: "bonus",
    label: "+100 ĐIỂM",
    subLabel: "May Mắn 🎁",
    color: "#f59e0b", // Amber
    textColor: "#1f2937",
    points: 100,
  },
  {
    id: "slice_q2",
    type: "question",
    questionId: "q2",
    label: "CÂU 2",
    subLabel: "Quy luật BĐ",
    color: "#059669", // Emerald
    textColor: "#ffffff",
    points: 100,
  },
  {
    id: "slice_x2",
    type: "multiplier",
    label: "X2 ĐIỂM",
    subLabel: "Nhân đôi ⚡",
    color: "#8b5cf6", // Purple
    textColor: "#ffffff",
    multiplier: 2,
  },
  {
    id: "slice_q3",
    type: "question",
    questionId: "q3",
    label: "CÂU 3",
    subLabel: "Công Nhân",
    color: "#2563eb", // Blue
    textColor: "#ffffff",
    points: 100,
  },
  {
    id: "slice_lucky",
    type: "lucky",
    label: "MAY MẮN",
    subLabel: "+1 Lượt 🍀",
    color: "#10b981", // Teal
    textColor: "#ffffff",
    points: 50,
  },
  {
    id: "slice_q4",
    type: "question",
    questionId: "q4",
    label: "CÂU 4",
    subLabel: "Liên Minh",
    color: "#d97706", // Dark Amber
    textColor: "#ffffff",
    points: 100,
  },
  {
    id: "slice_bonus_200",
    type: "bonus",
    label: "+200 ĐIỂM",
    subLabel: "Thưởng 🏆",
    color: "#ec4899", // Pink
    textColor: "#ffffff",
    points: 200,
  },
  {
    id: "slice_q5",
    type: "question",
    questionId: "q5",
    label: "CÂU 5",
    subLabel: "Đích Đến",
    color: "#7c3aed", // Violet
    textColor: "#ffffff",
    points: 100,
  },
  {
    id: "slice_star",
    type: "star",
    label: "TRI THỨC",
    subLabel: "+150 Đ ⭐",
    color: "#0891b2", // Cyan
    textColor: "#ffffff",
    points: 150,
  },
];

// Nội dung Tổng kết Bài học chi tiết và hàn lâm (KẾT NỘI DUNG BÀI HỌC)
export const LESSON_SUMMARY = {
  header: {
    tag: "TỔNG KẾT BÀI HỌC CHƯƠNG 5 · MLN131",
    title: "Cơ Cấu Xã Hội – Giai Cấp & Liên Minh Giai Cấp Trong Thời Kỳ Quá Độ",
    subtitle: "Hệ thống hóa toàn bộ tri thức nền tảng, quy luật vận động khách quan và bài học thực tiễn đối với sự nghiệp xây dựng CNXH tại Việt Nam.",
    academicRef: "Giáo trình Chủ nghĩa xã hội khoa học (Bộ GD&ĐT) – Chương 5",
  },
  takeaways: [
    {
      num: "01",
      title: "Tính quy định khách quan của Cơ cấu kinh tế đối với Cơ cấu giai cấp",
      content:
        "Cơ cấu xã hội – giai cấp không bao giờ là bất biến hay tách rời thực tại vật chất, mà bị quy định trực tiếp bởi cơ cấu kinh tế. Trong thời kỳ quá độ, sự tồn tại của nền kinh tế nhiều thành phần theo định hướng XHCN tất yếu sản sinh ra một cơ cấu giai tầng vừa đa dạng, phong phú, vừa thống nhất trong mục tiêu dân giàu, nước mạnh.",
      badge: "QUY LUẬT CỐT LÕI",
      accent: "#b91c1c",
    },
    {
      num: "02",
      title: "Vị trí trung tâm & Bản chất dẫn dắt của Giai cấp Công nhân",
      content:
        "Trong mọi loại hình cơ cấu xã hội, cơ cấu xã hội – giai cấp giữ vị trí trung tâm vì nó liên quan trực tiếp đến quan hệ sản xuất và quyền lực chính trị nhà nước. Giai cấp công nhân Việt Nam là giai cấp lãnh đạo cách mạng thông qua Đảng Cộng sản, tiên phong trong công cuộc CNH, HĐH và chuyển đổi số quốc gia.",
      badge: "VỊ TRÍ LÃNH ĐẠO",
      accent: "#1d4ed8",
    },
    {
      num: "03",
      title: "Liên minh Công – Nông – Trí thức: Nền tảng chính trị – xã hội vững bền",
      content:
        "Liên minh giai cấp không phải là khẩu hiệu cảm tính, mà dựa trên sự kết hợp hài hòa lợi ích kinh tế thiết thực, ổn định chính trị và bảo đảm an sinh văn hóa – xã hội. Khối liên minh công – nông – trí thức dưới sự lãnh đạo của Đảng là 'hạt nhân sống còn' quy tụ sức mạnh đại đoàn kết toàn dân tộc.",
      badge: "HẠT NHÂN ĐOÀN KẾT",
      accent: "#047857",
    },
    {
      num: "04",
      title: "Phát huy vai trò của mọi giai tầng: Trí thức & Đội ngũ Doanh nhân",
      content:
        "Xây dựng CNXH hiện đại đòi hỏi sự bứt phá của đội ngũ trí thức (nền kinh tế tri thức, sáng tạo công nghệ) song hành cùng sự lớn mạnh của đội ngũ doanh nhân yêu nước, thượng tôn pháp luật, tạo việc làm và làm giàu chính đáng cho đất nước.",
      badge: "NGUỒN LỰC MỚI",
      accent: "#b45309",
    },
    {
      num: "05",
      title: "Bài học thực tiễn đối với thế hệ trẻ và sinh viên",
      content:
        "Nắm vững lý luận Mác - Lênin không phải để giáo điều trên sách vở, mà để soi đường cho hành động: Chủ động trau dồi chuyên môn, rèn luyện bản lĩnh chính trị, tôn trọng người lao động, sáng tạo khởi nghiệp và đóng góp thiết thực cho cộng đồng và quê hương.",
      badge: "HÀNH ĐỘNG THỰC TIỄN",
      accent: "#6d28d9",
    },
  ],
  quote: {
    text: "“Sự biến đổi của cơ cấu xã hội – giai cấp luôn gắn liền và bị quy định bởi sự biến đổi của cơ cấu kinh tế. Liên minh giữa giai cấp công nhân với giai cấp nông dân và đội ngũ trí thức là nền tảng của Nhà nước ta, là động lực chủ yếu của sự phát triển đất nước.”",
    source: "Văn kiện Đại hội Đại biểu Toàn quốc Đảng Cộng sản Việt Nam",
  },
};
