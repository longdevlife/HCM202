import { useState } from "react";

export default function XeRaoThucTien() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const [activeCase, setActiveCase] = useState(0);

  const cases = [
    {
      id: "haiphong",
      badge: "Nông nghiệp • 1980",
      region: "Hải Phòng",
      title: "“Khoán chui” Đoàn Xá & Nghị quyết 24",
      people: "Chủ nhiệm Phạm Hồng Thưởng, Bí thư Đoàn Duy Thành, Bộ trưởng Nguyễn Ngọc Trìu",
      action: "Năm 1980, HTX Đoàn Xá bí mật giao ruộng, khoán khâu cấy và gặt trực tiếp cho từng hộ gia đình. Nông dân nộp đủ nghĩa vụ lương thực, phần dôi dư được giữ lại hưởng trọn. Lãnh đạo TP Hải Phòng lội ruộng thị sát và ban hành Nghị quyết 24 cho phép khoán hộ toàn thành phố.",
      result: "Năng suất lúa Đoàn Xá năm 1981 đạt 5,0 tấn/ha (đón nhận Huân chương Lao động hạng Ba), giải quyết dứt điểm cảnh đào củ chuối ăn cứu đói. Trở thành căn cứ thực tiễn trực tiếp để Trung ương ban hành Chỉ thị 100-CT/TW.",
      quote: "“Suy đến cùng, mục đích của Đảng ta là làm cho dân được ấm no. Khoán không phải là phá vỡ hợp tác xã, mà là cứu hợp tác xã!”",
      author: "Đồng chí Đoàn Duy Thành – Bí thư Thành ủy Hải Phòng",
      subquote: "“Nông dân mình đói và khổ quá, Thành ơi!” — Cố Bí thư Tỉnh ủy Kim Ngọc (nói với ông Đoàn Duy Thành, 1979)",
      statNumber: "5.0",
      statUnit: "tấn/ha",
      statDesc: "Năng suất lúa Đoàn Xá 1981 (tăng gấp 3 lần)",
    },
    {
      id: "tphcm-gao",
      badge: "Cứu đói & Phân phối • 1978–1982",
      region: "TP. Hồ Chí Minh",
      title: "Võ Văn Kiệt & “Tổ thu mua gạo đặc biệt”",
      people: "Bí thư Võ Văn Kiệt, Bà Ba Thi (Nguyễn Thị Ráo), Giám đốc Ngân hàng Lữ Minh Châu",
      action: "Thành lập 'Tổ thu mua gạo đặc biệt', mang tiền mặt ngân hàng xuống miền Tây mua lúa theo giá thị trường 2,5 đồng/kg (trong khi giá thu mua chỉ định của Nhà nước là 0,5 đ/kg), tự bảo lãnh xe gạo vượt qua các trạm gác 'ngăn sông cấm chợ' đưa về Sài Gòn.",
      result: "Thu mua đều đặn từ 10.000 đến 20.000 tấn gạo mỗi tháng, giải cứu thành công nạn đói giáp hạt cho hơn 4 triệu dân TP.HCM, chứng minh quy luật giá cả thị trường khách quan.",
      quote: "“Nếu để dân đói thì làm lãnh đạo làm gì? Nếu việc này bị coi là buôn lậu và phải vào tù, tôi xin đi tù thay cho các đồng chí!”",
      author: "Đồng chí Võ Văn Kiệt – Bí thư Thành ủy TP.HCM",
      subquote: "Bà Ba Thi chỉ huy đội quân gạo cộ miền Tây phá vỡ hàng trăm trạm gác ngăn sông cấm chợ.",
      statNumber: "20.000",
      statUnit: "tấn gạo/tháng",
      statDesc: "Cứu đói khẩn cấp cho hơn 4 triệu dân Sài Gòn",
    },
    {
      id: "det-thanhcong",
      badge: "Công nghiệp • 1980–1981",
      region: "TP. Hồ Chí Minh",
      title: "Phương án 304/80 TC – Dệt Thành Công",
      people: "Giám đốc Nguyễn Xuân Hà, Bí thư Võ Văn Kiệt",
      action: "Nhà máy thiếu tơ sợi, công nhân đối mặt nguy cơ nghỉ việc. Giám đốc Nguyễn Xuân Hà mạnh dạn lập Phương án 304/80 TC xin vay 180.000 USD từ Vietcombank TP.HCM để tự nhập sợi và phụ tùng thay thế từ nước ngoài, áp dụng cơ chế 'hàng đổi hàng' với Hong Kong, Singapore.",
      result: "Nhà máy vận hành 100% công suất, tạo việc làm và thu nhập cho hàng nghìn công nhân. Kim ngạch xuất khẩu trực tiếp của TP.HCM tăng vọt từ 0,5 triệu USD (1980) lên 22,0 triệu USD (1981), mở đường cho Quyết định 25-CP.",
      quote: "“Xí nghiệp không thể ngồi chờ phân phối vật tư để rồi chết dần. Phải chủ động vay vốn ngoại tệ, nhập nguyên liệu và tự tìm đầu ra!”",
      author: "Phương án 304/80 TC – Xí nghiệp Dệt Thành Công",
      subquote: "Mô hình tiền đề mở ra Kế hoạch 3 phần cho toàn bộ hệ thống xí nghiệp quốc doanh.",
      statNumber: "22,0",
      statUnit: "triệu USD",
      statDesc: "Kim ngạch XK TP.HCM năm 1981 (tăng 44 lần)",
    },
    {
      id: "longan",
      badge: "Giá – Lương – Tiền • 1980",
      region: "Long An",
      title: "Bí thư Chín Cần & Bù giá vào lương",
      people: "Bí thư Tỉnh ủy Nguyễn Văn Chính (Chín Cần)",
      action: "Tiên phong xóa bỏ hoàn toàn sổ gạo, tem phiếu phân phối hiện vật; thực hiện mua bán nông sản theo giá sát thị trường và bù chênh lệch giá trực tiếp vào tiền lương cho cán bộ, công nhân viên chức.",
      result: "Khơi thông dòng luân chuyển hàng hóa toàn tỉnh, giải phóng sức mua của người lao động, tạo tiền đề thực nghiệm quý giá cho các bước đột phá Giá - Lương - Tiền của Trung ương sau này.",
      quote: "“Phải nhìn thẳng vào quy luật thị trường. Bù giá vào lương là con đường duy nhất để người lao động sống được bằng thu nhập chân chính.”",
      author: "Đồng chí Nguyễn Văn Chính (Chín Cần) – Bí thư Tỉnh ủy Long An",
      subquote: "Thí nghiệm đột phá mở đường cho việc xóa bỏ chế độ bao cấp phân phối hiện vật.",
      statNumber: "100%",
      statUnit: "bỏ tem phiếu",
      statDesc: "Tiên phong xóa bỏ mậu dịch bao cấp tại Long An",
    },
  ];

  return (
    <section
      id="xe-rao"
      className="relative w-full bg-[#E5E0D8] px-6 md:px-16 lg:px-24 py-28 md:py-36 overflow-hidden border-t border-[#3D3529]/10"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-20">
          <div className="gsap-reveal flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-[#8B261D] gsap-line-draw" />
            <span
              className="text-xs uppercase tracking-[0.25em] font-bold text-[#8B261D]"
              style={{ fontFamily: f2 }}
            >
              Phần 2 • Thực Tiễn Cơ Sở
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight"
            style={{ fontFamily: f1 }}
          >
            <span className="gsap-text-reveal block">Hồ Sơ Các Cuộc “Xé Rào”</span>
            <span className="gsap-text-reveal block italic font-light text-[#7A6040]">
              Tiếng Sấm Sinh Tồn Từ Ruộng Đồng & Xí Nghiệp
            </span>
          </h2>

          <p
            className="gsap-reveal text-base md:text-lg text-[#5A4632] max-w-3xl leading-relaxed font-light"
            style={{ fontFamily: f2 }}
          >
            Trước nguy cơ sụp đổ sinh tồn, những cán bộ và tập thể kiên trung đã dũng cảm "vượt rào" cơ chế, chấp nhận rủi ro chính trị để cứu dân, cứu sản xuất – tạo nên những đốm lửa bùng cháy khắp cả nước.
          </p>
        </div>

        {/* Interactive Case Navigation */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {cases.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(idx)}
              className={`p-4 rounded-2xl text-left transition-all duration-300 border ${
                activeCase === idx
                  ? "bg-[#3D3529] text-[#EDE8E1] border-[#3D3529] shadow-md scale-[1.02]"
                  : "bg-white/70 text-[#3D3529] border-[#3D3529]/10 hover:bg-white"
              }`}
            >
              <span
                className={`text-[10px] uppercase font-bold tracking-wider block mb-1 ${
                  activeCase === idx ? "text-[#C5A028]" : "text-[#8B261D]"
                }`}
                style={{ fontFamily: f2 }}
              >
                {c.badge}
              </span>
              <h4 className="font-bold text-sm md:text-base line-clamp-1" style={{ fontFamily: f1 }}>
                {c.region}
              </h4>
            </button>
          ))}
        </div>

        {/* Selected Case Detail Card */}
        {(() => {
          const current = cases[activeCase];
          return (
            <div className="p-8 md:p-12 bg-white rounded-3xl border border-[#3D3529]/10 shadow-xl transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left col: Title, Action, Result */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-[#8B261D] text-white text-xs uppercase font-bold rounded-full">
                      {current.region}
                    </span>
                    <span className="text-xs font-semibold text-[#7A6040] uppercase tracking-wider">
                      {current.badge}
                    </span>
                  </div>

                  <h3
                    className="text-3xl md:text-4xl font-bold text-[#3D3529] leading-tight"
                    style={{ fontFamily: f1 }}
                  >
                    {current.title}
                  </h3>

                  <div className="p-4 bg-[#EDE8E1]/60 rounded-xl border-l-4 border-[#8B261D]">
                    <span className="text-xs font-bold text-[#8B261D] uppercase tracking-wider block mb-1">
                      Nhân vật & Đơn vị tiên phong:
                    </span>
                    <p className="text-sm font-medium text-[#3D3529]">{current.people}</p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#7A6040] mb-2">
                      Hành Động “Xé Rào” Cụ Thể:
                    </h5>
                    <p className="text-[#3D3529] text-base leading-relaxed font-light">
                      {current.action}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#7A6040] mb-2">
                      Kết Quả Thực Tiễn & Tác Động:
                    </h5>
                    <p className="text-[#3D3529] text-base leading-relaxed font-light">
                      {current.result}
                    </p>
                  </div>
                </div>

                {/* Right col: Quote, Metric Box */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="p-6 bg-[#3D3529] text-[#EDE8E1] rounded-2xl shadow-md border border-[#3D3529]">
                    <span className="text-2xl text-[#C5A028] block mb-2 font-serif">“</span>
                    <p
                      className="text-base text-[#EDE8E1] leading-relaxed italic mb-4"
                      style={{ fontFamily: "'EB Garamond', serif" }}
                    >
                      {current.quote}
                    </p>
                    <span className="text-xs font-bold text-[#C5A028] uppercase tracking-wider block">
                      {current.author}
                    </span>
                    {current.subquote && (
                      <p className="text-xs text-[#EDE8E1]/60 mt-3 pt-3 border-t border-white/10 italic">
                        {current.subquote}
                      </p>
                    )}
                  </div>

                  <div className="p-6 bg-[#EDE8E1] rounded-2xl border border-[#3D3529]/10 text-center">
                    <span className="text-xs uppercase font-bold text-[#7A6040] tracking-wider block mb-1">
                      Chỉ Số Đột Phá
                    </span>
                    <div
                      className="text-4xl md:text-5xl font-extrabold text-[#8B261D]"
                      style={{ fontFamily: f1 }}
                    >
                      {current.statNumber}
                    </div>
                    <span className="text-sm font-bold text-[#3D3529] block mt-1">
                      {current.statUnit}
                    </span>
                    <p className="text-xs text-[#7A6040] mt-2 font-light">{current.statDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </section>
  );
}
