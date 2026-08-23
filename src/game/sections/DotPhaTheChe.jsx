export default function DotPhaTheChe() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const macroStats = [
    {
      metric: "Sản lượng lương thực bình quân",
      before: "13,4 triệu tấn / năm",
      after: "17,0 triệu tấn / năm",
      impact: "Tăng 26,8%; giải quyết dứt điểm nạn đói giáp hạt kéo dài.",
      highlight: "+26,8%",
    },
    {
      metric: "Tăng trưởng công nghiệp địa phương",
      before: "Suy thoái / Dưới chỉ tiêu",
      after: "Vượt kế hoạch 7,5%",
      impact: "Xí nghiệp chủ động vật tư qua Phần 2 & Phần 3 của QĐ 25-CP.",
      highlight: "+7,5%",
    },
    {
      metric: "Kim ngạch xuất khẩu trực tiếp TP.HCM",
      before: "0,5 triệu USD (1980)",
      after: "22,0 triệu USD (1981)",
      impact: "Tăng 44 lần nhờ cơ chế tự vay ngoại tệ & hàng đổi hàng.",
      highlight: "Gấp 44 lần",
    },
    {
      metric: "Năng suất lúa điển hình (HTX Đoàn Xá)",
      before: "1,5 – 2,0 tấn / ha",
      after: "5,0 tấn / ha (1981)",
      impact: "Nhận Huân chương Lao động hạng Ba nhờ khoán sản phẩm.",
      highlight: "5,0 tấn/ha",
    },
  ];

  return (
    <section
      id="dot-pha"
      className="relative w-full bg-[#EDE8E1] px-6 md:px-16 lg:px-24 py-28 md:py-36 overflow-hidden border-t border-[#3D3529]/10"
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
              Phần 3 • Thể Chế Hóa
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight"
            style={{ fontFamily: f1 }}
          >
            <span className="gsap-text-reveal block">Ba Cột Mốc Văn Kiện &</span>
            <span className="gsap-text-reveal block italic font-light text-[#7A6040]">
              Bước Đột Phá Thể Chế (1979–1981)
            </span>
          </h2>

          <p
            className="gsap-reveal text-base md:text-lg text-[#5A4632] max-w-3xl leading-relaxed font-light"
            style={{ fontFamily: f2 }}
          >
            Tổng kết từ các cuộc "xé rào" thực tiễn, Đảng và Chính phủ đã kịp thời ban hành ba quyết sách then chốt, chính thức mở van an toàn giải phóng sức sản xuất cho cả nông nghiệp và công nghiệp.
          </p>
        </div>

        {/* 3 Cột Mốc Lịch Sử */}
        <div className="space-y-12 mb-28">
          {/* Mốc 1: TW6 */}
          <div className="gsap-slide-left p-8 md:p-12 bg-white rounded-3xl border border-[#3D3529]/10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#3D3529]/10">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 bg-[#8B261D] text-white text-xs font-bold uppercase rounded-full">
                  Tháng 08 / 1979
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-[#7A6040]">
                  Đột Phá Tư Duy Đầu Tiên
                </span>
              </div>
              <span className="text-sm font-semibold text-[#8B261D]">Hội Nghị Trung Ương 6 (Khóa IV)</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-[#3D3529] mb-4" style={{ fontFamily: f1 }}>
              Chủ trương “Làm Cho Sản Xuất Bung Ra”
            </h3>

            <p className="text-[#5A4632] text-base leading-relaxed mb-6 font-light">
              Lần đầu tiên Đảng chính thức thừa nhận những khuyết điểm trong quản lý tập trung và cải tạo XHCN nóng vội; thừa nhận sự tồn tại khách quan của quan hệ hàng hóa - tiền tệ và động lực lợi ích cá nhân.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-[#EDE8E1]/60 rounded-2xl">
                <h5 className="font-bold text-sm text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>
                  1. Công nhận Kinh tế phụ
                </h5>
                <p className="text-xs text-[#6B5744] leading-relaxed font-light">
                  Thừa nhận kinh tế phụ gia đình và kinh tế cá thể là thành phần hợp pháp hỗ trợ lực lượng sản xuất xã hội.
                </p>
              </div>
              <div className="p-5 bg-[#EDE8E1]/60 rounded-2xl">
                <h5 className="font-bold text-sm text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>
                  2. Ổn định Nghĩa vụ 5 năm
                </h5>
                <p className="text-xs text-[#6B5744] leading-relaxed font-light">
                  Ấn định mức nộp lương thực ổn định; cho phép nông dân tự do bán phần sản phẩm dôi dư theo giá thỏa thuận.
                </p>
              </div>
              <div className="p-5 bg-[#EDE8E1]/60 rounded-2xl">
                <h5 className="font-bold text-sm text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>
                  3. Xóa Trạm Kiểm Soát
                </h5>
                <p className="text-xs text-[#6B5744] leading-relaxed font-light">
                  Dỡ bỏ các trạm gác liên ngành nội địa, giải tỏa ách tắc lưu thông "ngăn sông cấm chợ" trên toàn quốc.
                </p>
              </div>
            </div>
          </div>

          {/* Mốc 2: Chỉ thị 100 */}
          <div className="gsap-slide-right p-8 md:p-12 bg-white rounded-3xl border border-[#3D3529]/10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#3D3529]/10">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 bg-[#3D3529] text-white text-xs font-bold uppercase rounded-full">
                  13 / 01 / 1981
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-[#7A6040]">
                  Giải Phóng Nông Nghiệp
                </span>
              </div>
              <span className="text-sm font-semibold text-[#8B261D]">Chỉ thị 100-CT/TW của Ban Bí thư</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-[#3D3529] mb-4" style={{ fontFamily: f1 }}>
              Khoán Sản Phẩm Đến Nhóm & Người Lao Động (Khoán 100)
            </h3>

            <p className="text-[#5A4632] text-base leading-relaxed mb-6 font-light">
              Chuyển đổi triệt để từ "khoán việc" chấm công điểm cào bằng sang "khoán sản phẩm cuối cùng". Hợp thức hóa khoán chui và thiết lập cơ chế phân công khoa học:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="p-6 bg-[#3D3529] text-[#EDE8E1] rounded-2xl">
                <span className="text-xs uppercase font-bold text-[#C5A028] tracking-widest block mb-2">
                  Hợp Tác Xã Đảm Nhiệm
                </span>
                <h4 className="text-xl font-bold text-white mb-3" style={{ fontFamily: f1 }}>
                  5 Khâu Dịch Vụ Tập Trung
                </h4>
                <ul className="text-sm space-y-1.5 text-[#EDE8E1]/80 list-disc list-inside font-light">
                  <li>Làm đất (cày bừa)</li>
                  <li>Thủy nông (tưới tiêu nước)</li>
                  <li>Chọn và cung ứng giống lúa</li>
                  <li>Cung ứng phân bón</li>
                  <li>Bảo vệ thực vật (trừ sâu bệnh)</li>
                </ul>
              </div>

              <div className="p-6 bg-[#8B261D] text-white rounded-2xl">
                <span className="text-xs uppercase font-bold text-[#EDE8E1] tracking-widest block mb-2">
                  Hộ Xã Viên Tự Chủ
                </span>
                <h4 className="text-xl font-bold text-white mb-3" style={{ fontFamily: f1 }}>
                  3 Khâu Cá Nhân Trực Tiếp
                </h4>
                <ul className="text-sm space-y-1.5 text-white/90 list-disc list-inside mb-4 font-light">
                  <li>Gieo cấy lúa</li>
                  <li>Chăm sóc đồng ruộng</li>
                  <li>Thu hoạch và gặt đập</li>
                </ul>
                <div className="p-3 bg-black/20 rounded-xl text-xs font-semibold text-[#EDE8E1]">
                  Đòn bẩy lợi ích: Xã viên nộp đủ mức khoán, được <strong>hưởng trọn 100% phần sản lượng vượt khoán</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Mốc 3: Quyết định 25/26-CP */}
          <div className="gsap-slide-left p-8 md:p-12 bg-white rounded-3xl border border-[#3D3529]/10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#3D3529]/10">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 bg-[#3D3529] text-white text-xs font-bold uppercase rounded-full">
                  21 / 01 / 1981
                </span>
                <span className="text-xs uppercase font-bold tracking-wider text-[#7A6040]">
                  Cởi Trói Xí Nghiệp Quốc Doanh
                </span>
              </div>
              <span className="text-sm font-semibold text-[#8B261D]">Quyết định 25-CP & 26-CP của Hội đồng Chính phủ</span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-[#3D3529] mb-4" style={{ fontFamily: f1 }}>
              Mô hình “Kế Hoạch 3 Phần” & Trả Lương Khoán
            </h3>

            <p className="text-[#5A4632] text-base leading-relaxed mb-6 font-light">
              Ban hành quyền chủ động sản xuất kinh doanh và tự chủ tài chính cho doanh nghiệp nhà nước, hợp thức hóa việc xí nghiệp tự lo vật tư và bán sản phẩm ngoài kế hoạch:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-[#EDE8E1] rounded-2xl border border-[#3D3529]/10">
                <span className="text-xs font-bold uppercase text-[#8B261D] block mb-1">Phần 1</span>
                <h4 className="text-lg font-bold text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>
                  Kế Hoạch Pháp Lệnh
                </h4>
                <p className="text-xs text-[#6B5744] leading-relaxed font-light">
                  Nhà nước cấp 100% vật tư — Xí nghiệp giao nộp sản phẩm chính theo giá quy định sẵn.
                </p>
              </div>

              <div className="p-6 bg-[#EDE8E1] rounded-2xl border border-[#3D3529]/10">
                <span className="text-xs font-bold uppercase text-[#8B261D] block mb-1">Phần 2</span>
                <h4 className="text-lg font-bold text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>
                  Kế Hoạch Tự Cân Đối
                </h4>
                <p className="text-xs text-[#6B5744] leading-relaxed font-light">
                  Xí nghiệp tự tìm kiếm vật tư, phụ tùng — Bán cho Nhà nước hoặc trao đổi theo giá thỏa thuận.
                </p>
              </div>

              <div className="p-6 bg-[#EDE8E1] rounded-2xl border border-[#3D3529]/10">
                <span className="text-xs font-bold uppercase text-[#8B261D] block mb-1">Phần 3</span>
                <h4 className="text-lg font-bold text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>
                  Kế Hoạch Sản Xuất Phụ
                </h4>
                <p className="text-xs text-[#6B5744] leading-relaxed font-light">
                  Tận dụng phế liệu và công suất máy dư thừa — Tự do tiêu thụ trên thị trường theo giá cung - cầu.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#EDE8E1] rounded-2xl border border-[#3D3529]/10 text-xs text-[#3D3529] font-medium leading-relaxed">
              <strong>Quyết định 26-CP:</strong> Cho phép xí nghiệp áp dụng hình thức trả lương khoán, lương sản phẩm và trích lập quỹ tiền thưởng linh hoạt gắn liền với năng suất thực tế.
            </div>
          </div>
        </div>

        {/* Bảng Số Liệu Vĩ Mô */}
        <div className="gsap-scale-in">
          <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#3D3529]/10">
            <div>
              <span className="text-xs uppercase font-bold text-[#8B261D] tracking-widest block mb-1">
                Hiệu Quả Thực Tiễn
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-[#3D3529]" style={{ fontFamily: f1 }}>
                Bảng Thống Kê Định Lượng Sau Cải Cách Thể Chế
              </h3>
            </div>
            <span className="text-xs text-[#7A6040] italic hidden sm:inline">Giai đoạn 1976–1980 vs 1981–1985</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#3D3529]/10 shadow-sm bg-white">
            <table className="w-full text-left text-sm text-[#3D3529]">
              <thead className="bg-[#3D3529] text-[#EDE8E1] uppercase text-xs font-semibold">
                <tr>
                  <th className="py-4 px-6">Chỉ số kinh tế</th>
                  <th className="py-4 px-6">Trước cải cách (1976–1980)</th>
                  <th className="py-4 px-6">Sau cải cách (1981–1985)</th>
                  <th className="py-4 px-6">Mức độ tăng trưởng & Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE8E1]">
                {macroStats.map((st, i) => (
                  <tr key={i} className="hover:bg-[#EDE8E1]/30 transition-colors">
                    <td className="py-4 px-6 font-semibold text-[#3D3529]">{st.metric}</td>
                    <td className="py-4 px-6 text-[#7A6040]">{st.before}</td>
                    <td className="py-4 px-6 font-bold text-[#8B261D]">{st.after}</td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#8B261D]/10 text-[#8B261D] text-xs font-bold mr-2">
                        {st.highlight}
                      </span>
                      <span className="text-xs text-[#5A4632]">{st.impact}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-white/70 rounded-xl border border-[#3D3529]/10 text-xs text-[#7A6040]">
            <strong>Mặt trái nảy sinh cần tiếp tục điều chỉnh:</strong> Xuất hiện tình trạng "khoán trắng" (HTX buông lỏng quản lý 5 khâu) — trở thành tiền đề nghiên cứu để Đảng ban hành <strong>Khoán 10 (Nghị quyết 10 năm 1988)</strong>.
          </div>
        </div>
      </div>
    </section>
  );
}
