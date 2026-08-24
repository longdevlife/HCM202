export default function CoCheHocHoi() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const loopSteps = [
    {
      step: "01",
      title: "Thực tiễn \"Xé rào\" (Bottom-up innovation)",
      desc: "Khủng hoảng cục bộ & Áp lực sinh tồn khiến cơ sở phải tự xé rào để cứu đói.",
    },
    {
      step: "02",
      title: "Dung túng có chọn lọc (Selective Tolerance)",
      desc: "Trung ương không dập tắt ngay mà để không gian mở, cử người xuống quan sát hiệu quả thực tế.",
    },
    {
      step: "03",
      title: "Thể chế hóa (Institutionalization)",
      desc: "Ban hành chính sách (TW6, CT100, QĐ25) đập vỡ cơ chế cũ, hợp pháp hóa mô hình mới.",
    },
    {
      step: "04",
      title: "Thực tiễn mới (New Baseline)",
      desc: "Lực lượng sản xuất bung ra, đồng thời nảy sinh mâu thuẫn mới (như khoán trắng) bắt đầu chu kỳ tiếp theo.",
    }
  ];

  return (
    <section
      id="coche-hochoi"
      className="relative w-full bg-[#E5E0D8] px-6 md:px-16 lg:px-24 py-28 md:py-36 overflow-hidden border-t border-[#3D3529]/10"
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="gsap-reveal flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-[#8B261D] gsap-line-draw" />
            <span
              className="text-xs uppercase tracking-[0.25em] font-bold text-[#8B261D]"
              style={{ fontFamily: f2 }}
            >
              KHỐI 4
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight uppercase"
            style={{ fontFamily: f1 }}
          >
            Quy Luật Chuyển Hóa Từ Lượng Thành Chất
          </h2>

          <p
            className="gsap-reveal text-lg md:text-xl text-[#8B261D] max-w-3xl leading-relaxed font-bold mb-12"
            style={{ fontFamily: f2 }}
          >
            Cơ chế Policy Learning Loop (Học hỏi & Thích ứng Chính sách)
          </p>
        </div>

        {/* Biện chứng Lượng - Chất */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="p-8 bg-white rounded-3xl border border-[#3D3529]/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B261D]/5 rounded-bl-full z-0" />
            <div className="relative z-10">
              <span className="text-4xl font-bold text-[#8B261D] mb-4 block" style={{ fontFamily: f1 }}>Lượng</span>
              <h4 className="text-xl font-bold text-[#3D3529] mb-4 uppercase" style={{ fontFamily: f2 }}>
                Tích lũy về Lượng
              </h4>
              <p className="text-sm md:text-base text-[#5A4632] leading-relaxed font-light">
                Từ những đốm lửa xé rào nhỏ lẻ (Vĩnh Phú khoán hộ 1968, Hải Phòng khoán chui 1978, Long An bù giá vào lương 1980) → Lặp đi lặp lại tạo thành một phong trào thực tiễn rộng lớn.
              </p>
            </div>
          </div>

          <div className="p-8 bg-[#3D3529] rounded-3xl border border-[#3D3529]/10 shadow-sm relative overflow-hidden text-[#EDE8E1]">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#C5A028]/10 rounded-tl-full z-0" />
            <div className="relative z-10">
              <span className="text-4xl font-bold text-[#C5A028] mb-4 block" style={{ fontFamily: f1 }}>Chất</span>
              <h4 className="text-xl font-bold text-white mb-4 uppercase" style={{ fontFamily: f2 }}>
                Bước nhảy về Chất
              </h4>
              <p className="text-sm md:text-base text-[#EDE8E1]/90 leading-relaxed font-light">
                Khi lượng tích lũy đủ lớn, Trung ương khảo sát thực địa, đúc kết thành chân lý, đập vỡ cơ chế cũ (Chất cũ) để ban hành các văn kiện đột phá (Chất mới).
              </p>
            </div>
          </div>
        </div>

        {/* Policy Learning Loop */}
        <div className="gsap-scale-in">
          <div className="mb-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-[#3D3529] mb-4 uppercase" style={{ fontFamily: f1 }}>
              Vòng lặp Học hỏi Chính sách (Policy Learning Loop)
            </h3>
            <p className="text-sm md:text-base text-[#5A4632] font-light max-w-2xl mx-auto" style={{ fontFamily: f2 }}>
              Chu kỳ khép kín từ thực tiễn xé rào đến chính sách mới, và sự nảy sinh của mâu thuẫn thực tiễn tiếp theo.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#3D3529]/10 -translate-y-1/2 hidden md:block" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {loopSteps.map((step, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-[#3D3529]/10 shadow-lg text-center relative group hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-12 h-12 mx-auto bg-[#8B261D] text-white rounded-full flex items-center justify-center font-bold text-lg mb-6 shadow-md border-4 border-white relative z-10" style={{ fontFamily: f1 }}>
                    {step.step}
                  </div>
                  <h4 className="font-bold text-[#3D3529] mb-3 leading-tight" style={{ fontFamily: f2 }}>
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#5A4632] font-light leading-relaxed">
                    {step.desc}
                  </p>

                  {idx < loopSteps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-[#8B261D] transform -translate-y-1/2 text-2xl">
                      ➔
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Loopback Arrow (perfect U-shape from Step 4 to Step 1) */}
            <div className="hidden md:block absolute -bottom-10 left-[12.5%] right-[12.5%] h-10 border-b-2 border-l-2 border-r-2 border-[#8B261D] border-dashed opacity-50 rounded-b-xl z-0">
                {/* Arrowhead pointing UP at the start (under Step 1) */}
                <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#8B261D] rotate-45 bg-[#E5E0D8]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
