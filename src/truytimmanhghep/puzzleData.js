// DỮ LIỆU CÂU HỎI VÀ BỨC TRANH BÍ ẨN - TRUY TÌM MẢNH GHÉP (CHƯƠNG 5 MLN131)

export const MYSTERY_KEYWORD =
  "Hội nghị toàn quốc tổng kết Chương trình mục tiêu quốc gia xây dựng nông thôn mới, Chương trình mục tiêu quốc gia giảm nghèo bền vững giai đoạn 2021 - 2025";

export const MYSTERY_IMAGE_SRC = "/images/truytimmanhghep/hoi_nghi_tong_ket.jpg";

export const MYSTERY_EXPLANATION = {
  keyword: MYSTERY_KEYWORD,
  imageSrc: MYSTERY_IMAGE_SRC,
  summary:
    "Bức tranh bí ẩn ghi lại sự kiện trọng đại: 'Hội nghị toàn quốc tổng kết Chương trình mục tiêu quốc gia xây dựng nông thôn mới và giảm nghèo bền vững giai đoạn 2021 - 2025'. Sự kiện này là minh chứng thực tiễn sinh động cho các quy luật biến đổi cơ cấu xã hội – giai cấp trong thời kỳ quá độ lên chủ nghĩa xã hội ở Việt Nam.",
  significance: [
    {
      num: "01",
      icon: "🌾",
      badge: "Xu hướng quy luật",
      title: "Từng bước giảm chênh lệch & bất bình đẳng xã hội",
      content:
        "Nhà nước thực hiện các chương trình giảm nghèo bền vững và xây dựng nông thôn mới chính là phương thức hiện thực hóa quy luật: từng bước giảm chênh lệch phát triển giữa các vùng miền, tạo điều kiện để các giai cấp, tầng lớp xích lại gần nhau.",
    },
    {
      num: "02",
      icon: "🤝",
      badge: "Liên minh giai cấp",
      title: "Củng cố vững chắc liên minh Công – Nông – Trí thức",
      content:
        "Xây dựng nông thôn mới nâng cao toàn diện đời sống vật chất và tinh thần của giai cấp nông dân; gắn kết nông dân với giai cấp công nhân và đội ngũ trí thức dưới sự lãnh đạo của Đảng trong thời kỳ quá độ lên chủ nghĩa xã hội.",
    },
    {
      num: "03",
      icon: "📈",
      badge: "Chuyển dịch cơ cấu",
      title: "Thúc đẩy chuyển dịch cơ cấu lao động & kinh tế",
      content:
        "Giảm nghèo bền vững tạo cơ hội bình đẳng tiếp cận giáo dục, y tế và đào tạo nghề, từ đó thúc đẩy chuyển dịch lao động nông nghiệp sang công nghiệp – dịch vụ theo hướng hiện đại hóa, nâng cao chất lượng nguồn nhân lực quốc gia.",
    },
  ],
};

// 10 CÂU HỎI NỀN TẢNG THEO ĐÚNG NỘI DUNG NGƯỜI DÙNG CUNG CẤP
export const ALL_PUZZLE_QUESTIONS = [
  {
    id: "pq1",
    level: "Nhận biết",
    tag: "Khái niệm",
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
      "Chính xác! Đáp án B: Cơ cấu xã hội – giai cấp là hệ thống các giai cấp, tầng lớp xã hội tồn tại khách quan và các mối quan hệ giữa chúng trong một chế độ xã hội nhất định.",
  },
  {
    id: "pq2",
    level: "Nhận biết",
    tag: "Vị trí nền tảng",
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
      "Chính xác! Đáp án C: Cơ cấu xã hội – giai cấp giữ vị trí trung tâm hàng đầu vì liên quan trực tiếp đến chính trị, quyền lực nhà nước, chế độ sở hữu tư liệu sản xuất và phân phối của cải.",
  },
  {
    id: "pq3",
    level: "Nhận biết",
    tag: "Số liệu & Quy luật",
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
      "Chính xác! Đáp án B: Sự chuyển dịch cơ cấu lao động theo hướng công nghiệp hóa, hiện đại hóa minh họa quy luật cơ cấu xã hội – giai cấp biến đổi gắn liền và bị quy định bởi sự biến đổi của cơ cấu kinh tế.",
  },
  {
    id: "pq4",
    level: "Thông hiểu",
    tag: "Chuyển dịch cơ cấu",
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
      "Chính xác! Đáp án A: Cơ sở kinh tế quyết định kiến trúc xã hội; khi cơ cấu kinh tế thay đổi kéo theo sự thay đổi về ngành nghề, tổ chức phân công lao động và vị thế các giai tầng.",
  },
  {
    id: "pq5",
    level: "Thông hiểu",
    tag: "Nhận diện xu hướng",
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
      "Chính xác! Đáp án B: Biểu hiện (1) là biến đổi theo kinh tế; biểu hiện (2) là tính đa dạng phức tạp; biểu hiện (3) là từng bước giảm bất bình đẳng và xích lại gần nhau.",
  },
  {
    id: "pq6",
    level: "Thông hiểu",
    tag: "Thực tiễn Việt Nam",
    question:
      "Theo số liệu được nêu trong bài, quý IV/2025, khu vực nào chiếm tỷ trọng lao động có việc làm cao nhất?",
    options: [
      { id: "A", text: "Nông, lâm nghiệp và thủy sản.", isCorrect: false },
      { id: "B", text: "Công nghiệp và xây dựng.", isCorrect: false },
      { id: "C", text: "Dịch vụ (40,8%).", isCorrect: true },
      { id: "D", text: "Ba khu vực có tỷ trọng bằng nhau.", isCorrect: false },
    ],
    correctId: "C",
    explanation:
      "Chính xác! Đáp án C: Khu vực Dịch vụ chiếm tỷ trọng lao động có việc làm cao nhất (40,8%), phản ánh xu thế hiện đại hóa nền kinh tế.",
  },
  {
    id: "pq7",
    level: "Thông hiểu / Vận dụng thấp",
    tag: "Quy luật biến đổi",
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
      "Chính xác! Đáp án D: Trong thời kỳ quá độ lên CNXH, các giai cấp tầng lớp KHÔNG biến mất hoàn toàn ngay mà cùng tồn tại, vừa hợp tác vừa đấu tranh và từng bước xích lại gần nhau.",
  },
  {
    id: "pq8",
    level: "Vận dụng",
    tag: "Kinh tế tri thức",
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
      "Chính xác! Đáp án A: Trong bối cảnh cách mạng 4.0 và kinh tế số, đội ngũ trí thức đóng vai trò đặc biệt quan trọng và vị thế xã hội ngày càng được nâng cao trong liên minh giai cấp.",
  },
  {
    id: "pq9",
    level: "Vận dụng",
    tag: "Chính sách xã hội",
    question:
      "Nhà nước thực hiện các chương trình giảm nghèo, hỗ trợ các nhóm khó khăn tiếp cận dịch vụ xã hội và nâng cao chất lượng cuộc sống. Theo nội dung bài học, điều này phù hợp nhất với xu hướng nào của cơ cấu xã hội – giai cấp?",
    options: [
      { id: "A", text: "Làm xuất hiện các thành phần kinh tế mới.", isCorrect: false },
      {
        id: "B",
        text: "Từng bước giảm chênh lệch, bất bình đẳng và tạo điều kiện để các nhóm xã hội xích lại gần nhau.",
        isCorrect: true,
      },
      { id: "C", text: "Làm gia tăng tỷ trọng lao động nông nghiệp.", isCorrect: false },
      { id: "D", text: "Xóa bỏ ngay lập tức mọi khác biệt giữa các giai cấp và tầng lớp.", isCorrect: false },
    ],
    correctId: "B",
    explanation:
      "Chính xác! Đáp án B: Các chương trình mục tiêu quốc gia về giảm nghèo bền vững và nông thôn mới chính là chính sách hiện thực hóa xu hướng từng bước giảm chênh lệch, xích lại gần nhau của các giai tầng.",
  },
  {
    id: "pq10",
    level: "Vận dụng tổng hợp",
    tag: "Đội ngũ Doanh nhân",
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
      "Chính xác! Đáp án A: Sự ra đời và lớn mạnh của đội ngũ doanh nhân trong nền kinh tế thị trường định hướng XHCN minh chứng cho tính đa dạng, phức tạp và xuất hiện các tầng lớp xã hội mới.",
  },
];

/**
 * Xáo trộn ngẫu nhiên mảng
 */
function shuffleArray(arr) {
  const cloned = [...arr];
  for (let i = cloned.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

/**
 * Lấy ngẫu nhiên 9 câu hỏi từ ngân hàng 10 câu và xáo trộn vị trí gắn với 9 mảnh ghép (grid 3x3)
 */
export function getRandomizedPuzzleSet() {
  const shuffledBank = shuffleArray(ALL_PUZZLE_QUESTIONS);
  const selected9 = shuffledBank.slice(0, 9);
  const shuffledPositions = shuffleArray(selected9);

  return shuffledPositions.map((q, index) => ({
    pieceIndex: index, // 0 to 8
    pieceNumber: index + 1, // 1 to 9
    row: Math.floor(index / 3), // 0, 1, 2
    col: index % 3, // 0, 1, 2
    question: q,
  }));
}
