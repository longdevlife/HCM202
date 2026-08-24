export default function DiSanQuanTri() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const lessons = [
    {
      n: "01",
      title: "Phát hiện và nuôi dưỡng \"Đốm lửa khởi nghiệp\"",
      desc: "Nhà quản trị giỏi không dập tắt ngay sự chệch hướng, mà phải biết phân biệt đâu là sự vi phạm kỷ luật (phá hoại), đâu là sự sáng tạo vượt rào để giải quyết bế tắc thực tiễn (bottom-up innovation).",
      tag: "Bottom-up Innovation",
    },
    {
      n: "02",
      title: "Nghệ thuật Thử nghiệm Sandbox",
      desc: "Đừng áp dụng đại trà một chính sách chưa được kiểm chứng. Hãy mở những \"vùng đệm\" (sandbox) như Vĩnh Phú, Hải Phòng, Long An để quan sát phản ứng của hệ sinh thái trước khi thể chế hóa vĩ mô.",
      tag: "Sandbox",
    },
    {
      n: "03",
      title: "Quản trị sự kháng cự (Change Management)",
      desc: "Đổi mới luôn vấp phải sự chống đối từ nhóm lợi ích cũ (những người quen với đặc quyền phân phối bao cấp). Nhà lãnh đạo cần kiên định bảo vệ cái mới (như cách Bí thư Kim Ngọc được minh oan, hay Võ Văn Kiệt bảo vệ Đội gạo Ba Thi), dùng kết quả thực tế để thuyết phục giới bảo thủ.",
      tag: "Change Management",
    },
  ];

  return (
    <section
      id="di-san"
      className="relative w-full bg-[#EDE8E1] px-6 md:px-16 lg:px-24 py-28 md:py-36 overflow-hidden border-t border-[#3D3529]/10"
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="gsap-reveal flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-[#8B261D] gsap-line-draw" />
            <span
              className="text-xs uppercase tracking-[0.25em] font-bold text-[#8B261D]"
              style={{ fontFamily: f2 }}
            >
              KHỐI 5
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight uppercase"
            style={{ fontFamily: f1 }}
          >
            Di Sản Lịch Sử & Bài Học Quản Trị Chiến Lược
          </h2>

          <p
            className="gsap-reveal text-lg md:text-xl text-[#8B261D] max-w-3xl leading-relaxed font-bold mb-12"
            style={{ fontFamily: f2 }}
          >
            Ba bài học quản trị kinh điển vẫn còn nguyên giá trị cho các nhà hoạch định chính sách và CEO doanh nghiệp ngày nay.
          </p>
        </div>

        {/* 3 Bài Học Quản Trị */}
        <div className="mb-16">
          <div className="gsap-stagger-parent grid grid-cols-1 md:grid-cols-3 gap-6">
            {lessons.map((l) => (
              <div
                key={l.n}
                className="gsap-stagger-child p-8 bg-white rounded-3xl border border-[#3D3529]/10 hover:border-[#8B261D]/50 transition-all duration-300 hover:-translate-y-2 shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="text-4xl font-light text-[#8B261D]"
                      style={{ fontFamily: f1 }}
                    >
                      {l.n}.
                    </span>
                    <span className="px-3 py-1 bg-[#8B261D]/10 text-[#8B261D] text-[10px] font-bold rounded-full uppercase tracking-wider group-hover:bg-[#8B261D] group-hover:text-white transition-colors">
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
          <span>CHUYÊN ĐỀ VNR-T17 • GROUP 1</span>
          <span className="font-semibold text-[#8B261D]">1979–1981: SẢN XUẤT BUNG RA</span>
        </div>
      </div>
    </section>
  );
}
