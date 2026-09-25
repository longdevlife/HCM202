// DỮ LIỆU CÂU HỎI VÀ BỨC TRANH BÍ ẨN - TRUY TÌM MẢNH GHÉP (HCM202)
// Bản đồ 9 mảnh ghép 3x3 theo đúng số đánh dấu trên ảnh thực tế:
// [ 9 ] [ 1 ] [ 2 ]
// [ 4 ] [ 6 ] [ 8 ]
// [ 5 ] [ 7 ] [ 3 ]

export const FULL_IMAGE_SRC = "/images/truytimmanhghep/cocauxahoigiaicap.jpg";

export const MYSTERY_TITLE = "CÔNG NGHIỆP HÓA, HIỆN ĐẠI HÓA ĐẤT NƯỚC - XÂY DỰNG XÃ HỘI MỚI";

export const MYSTERY_SUBTITLE =
  "Cơ cấu xã hội – giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội ở Việt Nam";

export const MYSTERY_EXPLANATION = {
  title: MYSTERY_TITLE,
  subtitle: MYSTERY_SUBTITLE,
  imageSrc: FULL_IMAGE_SRC,
  summary:
    "Bức tranh là sơ đồ trực quan tổng kết bài học về Cơ cấu xã hội – giai cấp và Liên minh giai cấp trong thời kỳ quá độ lên chủ nghĩa xã hội ở Việt Nam: khắc họa rõ nét khối liên minh vững chắc giữa Giai cấp Công nhân, Giai cấp Nông dân và Đội ngũ Trí thức dưới ngọn cờ Tổ quốc; đồng thời phản ánh xu hướng công nghiệp hóa, hiện đại hóa, phát triển kinh tế tri thức và mục tiêu xóa bỏ bất bình đẳng để xây dựng một xã hội công bằng, bình đẳng, văn minh.",
  significance: [
    {
      num: "01",
      icon: "🏗️",
      badge: "Giai cấp Công nhân",
      title: "Lực lượng tiên phong trong CNH - HĐH",
      content:
        "Giai cấp công nhân Việt Nam là lực lượng lãnh đạo cách mạng thông qua đội tiên phong là Đảng Cộng sản; đi đầu trong sự nghiệp công nghiệp hóa, hiện đại hóa đất nước và tiếp cận cuộc Cách mạng công nghiệp lần thứ tư.",
    },
    {
      num: "02",
      icon: "🌾",
      badge: "Giai cấp Nông dân",
      title: "Nền tảng phát triển nông nghiệp sinh thái",
      content:
        "Giai cấp nông dân có vị trí chiến lược trong sự nghiệp phát triển nông nghiệp, kinh tế nông thôn và xây dựng nông thôn mới; đang chủ động chuyển đổi sang ứng dụng công nghệ cao và kinh tế số.",
    },
    {
      num: "03",
      icon: "🔬",
      badge: "Đội ngũ Trí thức",
      title: "Động lực then chốt của kinh tế tri thức",
      content:
        "Đội ngũ trí thức là lực lượng lao động sáng tạo đặc biệt quan trọng trong tiến trình đẩy mạnh công nghiệp hóa, hiện đại hóa và hội nhập quốc tế; đóng góp nguồn lực chất lượng cao cho phát triển đất nước.",
    },
    {
      num: "04",
      icon: "🤝",
      badge: "Liên minh & Bình đẳng",
      title: "Từng bước xóa bỏ bất bình đẳng xã hội",
      content:
        "Dưới sự lãnh đạo của Đảng, các chính sách an sinh xã hội và phát triển kinh tế nhiều thành phần giúp thu hẹp dần khoảng cách giữa các tầng lớp, hướng tới xã hội công bằng, bình đẳng và phồn vinh.",
    },
  ],
};

// 9 CÂU HỎI CHUẨN XÁC VỚI VỊ TRÍ 3X3 ĐƯỢC CHỈ ĐỊNH
export const ALL_PUZZLE_QUESTIONS = [
  {
    id: "q1",
    qNum: 1,
    level: "Nhận biết",
    tag: "Khái niệm",
    gridPosition: { row: 0, col: 1 }, // Hàng 0, Cột 1 (Đỉnh giữa)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_1.jpg",
    question: "Cơ cấu xã hội – giai cấp được hiểu là gì?",
    options: [
      { id: "A", text: "Tổng thể các ngành nghề tồn tại trong một nền kinh tế.", isCorrect: false },
      {
        id: "B",
        text: "Hệ thống các giai cấp, tầng lớp xã hội tồn tại khách quan và các mối quan hệ giữa chúng trong một chế độ xã hội nhất định.",
        isCorrect: true,
      },
      { id: "C", text: "Tổng thể các tổ chức chính trị và tổ chức xã hội.", isCorrect: false },
      { id: "D", text: "Hệ thống các thành phần kinh tế tồn tại trong xã hội.", isCorrect: false },
    ],
    correctId: "B",
    explanation:
      "Đáp án đúng là B: Cơ cấu xã hội – giai cấp là hệ thống các giai cấp, tầng lớp xã hội tồn tại khách quan trong một chế độ xã hội nhất định, thông qua những mối quan hệ về sở hữu tư liệu sản xuất, tổ chức quản lý và phân phối của cải.",
  },
  {
    id: "q2",
    qNum: 2,
    level: "Nhận biết",
    tag: "Vị trí hàng đầu",
    gridPosition: { row: 0, col: 2 }, // Hàng 0, Cột 2 (Đỉnh phải)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_2.jpg",
    question: "Theo nội dung bài học, cơ cấu xã hội – giai cấp có vị trí quan trọng hàng đầu vì:",
    options: [
      { id: "A", text: "Chỉ quyết định sự phát triển của cơ cấu nghề nghiệp.", isCorrect: false },
      { id: "B", text: "Chỉ phản ánh sự phân bố dân cư trong xã hội.", isCorrect: false },
      {
        id: "C",
        text: "Liên quan trực tiếp đến chính trị, sở hữu tư liệu sản xuất, tổ chức lao động và phân phối thu nhập.",
        isCorrect: true,
      },
      { id: "D", text: "Không chịu ảnh hưởng bởi sự biến đổi của nền kinh tế.", isCorrect: false },
    ],
    correctId: "C",
    explanation:
      "Đáp án đúng là C: Cơ cấu xã hội – giai cấp giữ vị trí trung tâm, quan trọng hàng đầu trong hệ thống cơ cấu xã hội vì liên quan trực tiếp đến quyền lực chính trị, quan hệ sở hữu tư liệu sản xuất, địa vị kinh tế - xã hội của các tập đoàn người.",
  },
  {
    id: "q3",
    qNum: 3,
    level: "Nhận biết",
    tag: "Số liệu & Quy luật",
    gridPosition: { row: 2, col: 2 }, // Hàng 2, Cột 2 (Góc dưới phải)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_3.jpg",
    question:
      "Tỷ trọng lao động trong nông nghiệp giảm từ 28,3% năm 2021 xuống khoảng 25,7% năm 2025, trong khi lao động công nghiệp và dịch vụ chiếm tỷ trọng ngày càng lớn. Hiện tượng này minh họa trực tiếp nhất cho nhận định nào?",
    options: [
      { id: "A", text: "Cơ cấu xã hội – giai cấp hoàn toàn độc lập với cơ cấu kinh tế.", isCorrect: false },
      {
        id: "B",
        text: "Cơ cấu xã hội – giai cấp biến đổi gắn liền và bị quy định bởi sự biến đổi của cơ cấu kinh tế.",
        isCorrect: true,
      },
      { id: "C", text: "Mọi giai cấp, tầng lớp đang xích lại gần nhau.", isCorrect: false },
      { id: "D", text: "Đội ngũ doanh nhân đang thay thế giai cấp công nhân.", isCorrect: false },
    ],
    correctId: "B",
    explanation:
      "Đáp án đúng là B: Chuyển dịch cơ cấu lao động từ nông nghiệp sang công nghiệp và dịch vụ là bằng chứng thực tiễn minh chứng cơ cấu xã hội – giai cấp biến đổi gắn liền và bị quy định bởi sự biến đổi của cơ cấu kinh tế.",
  },
  {
    id: "q4",
    qNum: 4,
    level: "Thông hiểu",
    tag: "Chuyển dịch cơ cấu",
    gridPosition: { row: 1, col: 0 }, // Hàng 1, Cột 0 (Giữa bên trái)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_4.jpg",
    question:
      "Tại sao sự chuyển dịch cơ cấu kinh tế có thể dẫn đến sự biến đổi của cơ cấu xã hội – giai cấp?",
    options: [
      {
        id: "A",
        text: "Vì cơ cấu kinh tế thay đổi kéo theo sự thay đổi về ngành nghề, cơ cấu lao động và các giai cấp, tầng lớp xã hội.",
        isCorrect: true,
      },
      { id: "B", text: "Vì mọi thành phần kinh tế sẽ dần biến mất.", isCorrect: false },
      { id: "C", text: "Vì tất cả người lao động sẽ chuyển sang khu vực công nghiệp.", isCorrect: false },
      { id: "D", text: "Vì sự phát triển kinh tế làm mất đi sự khác biệt giữa các nhóm xã hội.", isCorrect: false },
    ],
    correctId: "A",
    explanation:
      "Đáp án đúng là A: Kinh tế đóng vai trò cơ sở hạ tầng quyết định; khi cơ cấu ngành nghề và các thành phần kinh tế dịch chuyển thì phân công lao động xã hội và vị thế của các giai cấp, tầng lớp cũng biến đổi theo.",
  },
  {
    id: "q5",
    qNum: 5,
    level: "Thông hiểu",
    tag: "Ba biểu hiện xu hướng",
    gridPosition: { row: 2, col: 0 }, // Hàng 2, Cột 0 (Góc dưới trái)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_5.jpg",
    question:
      "Một quốc gia trong thời kỳ quá độ có các biểu hiện sau:\n(1) Tỷ trọng lao động nông nghiệp giảm, lao động công nghiệp và dịch vụ tăng.\n(2) Đội ngũ doanh nhân và các nhóm lao động gắn với kinh tế tư nhân ngày càng phát triển.\n(3) Các chính sách an sinh xã hội được thực hiện nhằm từng bước giảm chênh lệch giữa các nhóm xã hội.\nBa biểu hiện trên lần lượt phản ánh những xu hướng nào?",
    options: [
      { id: "A", text: "Đa dạng hóa cơ cấu → biến đổi theo kinh tế → liên minh giai cấp.", isCorrect: false },
      {
        id: "B",
        text: "Biến đổi theo cơ cấu kinh tế → đa dạng, phức tạp → từng bước giảm bất bình đẳng và xích lại gần nhau.",
        isCorrect: true,
      },
      { id: "C", text: "Xích lại gần nhau → biến đổi theo kinh tế → đa dạng hóa.", isCorrect: false },
      { id: "D", text: "Biến đổi theo kinh tế → xích lại gần nhau → đa dạng hóa.", isCorrect: false },
    ],
    correctId: "B",
    explanation:
      "Đáp án đúng là B: Biểu hiện (1) phản ánh xu hướng biến đổi theo cơ cấu kinh tế; biểu hiện (2) phản ánh tính chất đa dạng, phức tạp của cơ cấu; biểu hiện (3) phản ánh xu hướng giảm bất bình đẳng và các giai tầng xích lại gần nhau.",
  },
  {
    id: "q6",
    qNum: 6,
    level: "Thông hiểu",
    tag: "Thực tiễn Việt Nam",
    gridPosition: { row: 1, col: 1 }, // Hàng 1, Cột 1 (Trung tâm)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_6.jpg",
    question:
      "Theo số liệu được nêu trong bài, quý IV/2025, khu vực nào chiếm tỷ trọng lao động có việc làm cao nhất?",
    options: [
      { id: "A", text: "Nông, lâm nghiệp và thủy sản.", isCorrect: false },
      { id: "B", text: "Công nghiệp và xây dựng.", isCorrect: false },
      { id: "C", text: "Dịch vụ ", isCorrect: true },
      { id: "D", text: "Ba khu vực có tỷ trọng bằng nhau.", isCorrect: false },
    ],
    correctId: "C",
    explanation:
      "Đáp án đúng là C – 40,8%: Khu vực Dịch vụ chiếm tỷ trọng lao động có việc làm cao nhất (40,8%), cho thấy bước chuyển mình mạnh mẽ của cơ cấu kinh tế và lao động Việt Nam theo hướng hiện đại.",
  },
  {
    id: "q7",
    qNum: 7,
    level: "Thông hiểu / Vận dụng thấp",
    tag: "Quy luật biến đổi",
    gridPosition: { row: 2, col: 1 }, // Hàng 2, Cột 1 (Đáy giữa)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_7.jpg",
    question:
      "Đâu không phải là một trong ba xu hướng biến đổi có tính quy luật của cơ cấu xã hội – giai cấp được trình bày trong bài?",
    options: [
      { id: "A", text: "Biến đổi gắn liền và bị quy định bởi cơ cấu kinh tế.", isCorrect: false },
      { id: "B", text: "Biến đổi ngày càng đa dạng và phức tạp.", isCorrect: false },
      {
        id: "C",
        text: "Các giai cấp, tầng lớp vừa đấu tranh vừa liên minh và từng bước xích lại gần nhau.",
        isCorrect: false,
      },
      {
        id: "D",
        text: "Các giai cấp, tầng lớp dần mất đi hoàn toàn khi kinh tế phát triển.",
        isCorrect: true,
      },
    ],
    correctId: "D",
    explanation:
      "Đáp án đúng là D: Trong thời kỳ quá độ lên CNXH, sự khác biệt giai cấp vẫn tồn tại và các giai tầng không thể 'mất đi hoàn toàn' ngay lập tức mà cùng đồng hành, phát triển và từng bước xích lại gần nhau.",
  },
  {
    id: "q8",
    qNum: 8,
    level: "Vận dụng",
    tag: "Kinh tế tri thức & 4.0",
    gridPosition: { row: 1, col: 2 }, // Hàng 1, Cột 2 (Giữa bên phải)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_8.jpg",
    question:
      "Giả sử trong những năm tới, kinh tế tri thức, công nghệ cao và chuyển đổi số tiếp tục phát triển mạnh. Dựa trên nội dung bài học, nhận định nào phù hợp nhất?",
    options: [
      {
        id: "A",
        text: "Vai trò của đội ngũ trí thức có thể tiếp tục được nâng cao.",
        isCorrect: true,
      },
      { id: "B", text: "Đội ngũ trí thức sẽ không còn thuộc cơ cấu xã hội – giai cấp.", isCorrect: false },
      { id: "C", text: "Cơ cấu xã hội – giai cấp sẽ không có sự thay đổi.", isCorrect: false },
      { id: "D", text: "Tất cả người lao động sẽ trở thành trí thức.", isCorrect: false },
    ],
    correctId: "A",
    explanation:
      "Đáp án đúng là A: Trong thời đại công nghệ số và kinh tế tri thức, tri thức trở thành lực lượng sản xuất trực tiếp; do đó vị thế và vai trò của đội ngũ trí thức ngày càng được củng cố và nâng cao vượt bậc.",
  },
  {
    id: "q9",
    qNum: 9,
    level: "Vận dụng",
    tag: "Đội ngũ Doanh nhân",
    gridPosition: { row: 0, col: 0 }, // Hàng 0, Cột 0 (Góc trên trái)
    pieceImage: "/images/truytimmanhghep/pieces/piece_cau_9.jpg",
    question:
      "Sự phát triển của đội ngũ doanh nhân trong nền kinh tế nhiều thành phần minh họa rõ nhất cho quy luật nào?",
    options: [
      {
        id: "A",
        text: "Cơ cấu xã hội – giai cấp ngày càng đa dạng, phức tạp và xuất hiện, phát triển các tầng lớp xã hội mới.",
        isCorrect: true,
      },
      { id: "B", text: "Các giai cấp và tầng lớp xã hội ngày càng xích lại gần nhau.", isCorrect: false },
      { id: "C", text: "Cơ cấu xã hội – giai cấp không chịu ảnh hưởng của cơ cấu kinh tế.", isCorrect: false },
      { id: "D", text: "Các giai cấp, tầng lớp truyền thống hoàn toàn biến mất.", isCorrect: false },
    ],
    correctId: "A",
    explanation:
      "Đáp án đúng là A: Sự hình thành và lớn mạnh của tầng lớp doanh nhân trong nền kinh tế thị trường định hướng XHCN minh chứng sinh động cho xu hướng cơ cấu xã hội – giai cấp ngày càng đa dạng, phức tạp và xuất hiện tầng lớp mới.",
  },
];

// Bản đồ layout 3x3 chính xác theo số đánh dấu trong ảnh ghi chú:
// Hàng 0: [9, 1, 2]
// Hàng 1: [4, 6, 8]
// Hàng 2: [5, 7, 3]
export const PUZZLE_GRID_LAYOUT = [
  { row: 0, col: 0, qNum: 9, cellIndex: 0 },
  { row: 0, col: 1, qNum: 1, cellIndex: 1 },
  { row: 0, col: 2, qNum: 2, cellIndex: 2 },
  { row: 1, col: 0, qNum: 4, cellIndex: 3 },
  { row: 1, col: 1, qNum: 6, cellIndex: 4 },
  { row: 1, col: 2, qNum: 8, cellIndex: 5 },
  { row: 2, col: 0, qNum: 5, cellIndex: 6 },
  { row: 2, col: 1, qNum: 7, cellIndex: 7 },
  { row: 2, col: 2, qNum: 3, cellIndex: 8 },
];

/**
 * Trả về 9 ô trên bàn cờ với đầy đủ dữ liệu câu hỏi được gán theo đúng vị trí
 */
export function getInitialPuzzleGrid() {
  return PUZZLE_GRID_LAYOUT.map((cell) => {
    const q = ALL_PUZZLE_QUESTIONS.find((item) => item.qNum === cell.qNum);
    return {
      cellIndex: cell.cellIndex,
      row: cell.row,
      col: cell.col,
      qNum: cell.qNum,
      pieceNumber: cell.qNum,
      pieceImage: q ? q.pieceImage : `/images/truytimmanhghep/pieces/piece_cau_${cell.qNum}.jpg`,
      question: q,
    };
  });
}
