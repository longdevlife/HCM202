export default function DiSanQuanTri() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const lessons = [
    {
      n: "01",
      title: "Lấy Dân Làm Gốc & Thiết Kế Đòn Bẩy Động Lực",
      desc: "Mọi chính sách kinh tế chỉ thành công khi gắn liền trách nhiệm với lợi ích vật chất thiết thực của người lao động. Động lực cá nhân chính là chìa khóa giải phóng sức sản xuất của toàn xã hội.",
      tag: "Trọng dân",
    },
    {
      n: "02",
      title: "Tôn Trọng Quy Luật Khách Quan",
      desc: "Quản trị quốc gia không thể duy ý chí bằng mệnh lệnh hành chính, mà phải kết hợp hài hòa giữa sự điều tiết vĩ mô của Nhà nước với các quy luật kinh tế khách quan (quy luật giá trị, quy luật cung - cầu).",
      tag: "Quy luật kinh tế",
    },
    {
      n: "03",
      title: "Không Gian Thử Nghiệm Chính Sách (Sandbox)",
      desc: "Tạo hành lang an toàn cho cơ sở, địa phương và doanh nghiệp chủ động tìm tòi, thử nghiệm các mô hình kinh tế mới ở quy mô hẹp trước khi tổng kết, nhân rộng và thể chế hóa toàn diện.",
      tag: "Thử nghiệm thể chế",
    },
  ];

  return (
    <section
      id="di-san"
      className="relative w-full bg-[#EDE8E1] px-6 md:px-16 lg:px-24 py-28 md:py-36 overflow-hidden border-t border-[#3D3529]/10"
    >
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <div className="gsap-reveal flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-[#8B261D] gsap-line-draw" />
            <span
              className="text-xs uppercase tracking-[0.25em] font-bold text-[#8B261D]"
              style={{ fontFamily: f2 }}
            >
              Phần 5 • Di Sản & Bài Học
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight"
            style={{ fontFamily: f1 }}
          >
            <span className="gsap-text-reveal block">Di Sản Đến Đại Hội VI (1986) &</span>
            <span className="gsap-text-reveal block italic font-light text-[#7A6040]">
              Ba Bài Học Quản Trị Chiến Lược
            </span>
          </h2>

          <p
            className="gsap-reveal text-base md:text-lg text-[#5A4632] max-w-3xl leading-relaxed font-light"
            style={{ fontFamily: f2 }}
          >
            Giai đoạn 1979–1981 tuy là bước đổi mới từng phần nhưng mang ý nghĩa lịch sử to lớn: phá vỡ tảng băng bao cấp, thừa nhận quy luật hàng hóa - tiền tệ và tích lũy cơ sở thực tiễn vững chắc để Đảng ta quyết định xóa bỏ hoàn toàn cơ chế quan liêu bao cấp tại Đại hội VI năm 1986.
          </p>
        </div>

        {/* 3 Bài Học Quản Trị */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-10 pb-3 border-b border-[#3D3529]/10">
            <h3 className="text-2xl md:text-3xl font-bold text-[#3D3529]" style={{ fontFamily: f1 }}>
              03 Bài Học Quản Trị Chiến Lược
            </h3>
            <span className="text-xs uppercase font-bold text-[#8B261D] tracking-widest hidden sm:inline">
              Vẹn nguyên giá trị thời đại
            </span>
          </div>

          <div className="gsap-stagger-parent grid grid-cols-1 md:grid-cols-3 gap-6">
            {lessons.map((l) => (
              <div
                key={l.n}
                className="gsap-stagger-child p-8 bg-white rounded-3xl border border-[#3D3529]/10 hover:border-[#8B261D] transition-all duration-300 hover:-translate-y-2 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="text-4xl font-light text-[#8B261D]"
                      style={{ fontFamily: f1 }}
                    >
                      {l.n}.
                    </span>
                    <span className="px-3 py-1 bg-[#8B261D]/10 text-[#8B261D] text-xs font-bold rounded-full uppercase tracking-wider">
                      {l.tag}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-[#3D3529] mb-4" style={{ fontFamily: f1 }}>
                    {l.title}
                  </h4>

                  <p className="text-sm text-[#6B5744] leading-relaxed font-light">
                    {l.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info strip */}
        <div className="p-6 bg-white/60 rounded-2xl border border-[#3D3529]/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A6040] gap-3">
          <span>CHUYÊN ĐỀ LỊCH SỬ ĐẢNG VNR-T17 • GROUP 1</span>
          <span className="font-semibold text-[#8B261D]">1979–1981: SẢN XUẤT BUNG RA</span>
        </div>
      </div>
    </section>
  );
}
