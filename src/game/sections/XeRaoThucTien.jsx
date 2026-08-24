export default function XeRaoThucTien() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  return (
    <section
      id="xe-rao"
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
              KHỐI 2
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight uppercase"
            style={{ fontFamily: f1 }}
          >
            Mối Quan Hệ Giữa Thực Tiễn Và Nhận Thức Chân Lý
          </h2>

          <p
            className="gsap-reveal text-lg md:text-xl text-[#8B261D] max-w-3xl leading-relaxed font-bold mb-12"
            style={{ fontFamily: f2 }}
          >
            Sự chuyển dịch từ "Duy ý chí chủ quan" sang "Duy vật biện chứng" của Đảng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="p-8 bg-white/70 rounded-3xl border border-[#3D3529]/10 hover:border-[#8B261D]/40 transition-all duration-300">
            <h4
              className="text-xl font-bold text-[#3D3529] mb-4 uppercase"
              style={{ fontFamily: f1 }}
            >
              Thực tiễn là điểm xuất phát và thước đo chân lý
            </h4>
            <p
              className="text-[#5A4632] text-base leading-relaxed font-light"
              style={{ fontFamily: f2 }}
            >
              Giai đoạn 1979–1981 đánh dấu bước trưởng thành vượt bậc về năng lực lãnh đạo của Đảng: Thay vì dùng mệnh lệnh hành chính thô bạo để trấn áp các sáng kiến "trái quy định" ở cơ sở, Trung ương Đảng đã trực tiếp về tận ruộng đồng, xí nghiệp để lắng nghe và kiểm chứng thực tế.
            </p>
          </div>

          <div className="p-8 bg-[#3D3529] text-[#EDE8E1] rounded-3xl shadow-md border border-[#3D3529]/20">
            <h4
              className="text-xl font-bold text-[#C5A028] mb-4 uppercase"
              style={{ fontFamily: f1 }}
            >
              Ý nghĩa phương pháp luận
            </h4>
            <p
              className="text-[#EDE8E1]/90 text-base leading-relaxed font-light"
              style={{ fontFamily: f2 }}
            >
              Đây là minh chứng điển hình cho phương pháp luận duy vật: Ý thức, đường lối, chính sách phải bắt nguồn từ vật chất, từ thực tiễn sản xuất của quần chúng nhân dân.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-white rounded-3xl border border-[#3D3529]/10 shadow-xl">
          <h4
            className="text-2xl font-bold text-[#3D3529] mb-8 text-center"
            style={{ fontFamily: f1 }}
          >
            Sơ đồ Vòng lặp Học hỏi Chính sách Thích ứng (Policy Learning Loop)
          </h4>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {[
              "Khủng hoảng Sinh tồn",
              "Thử nghiệm Vi mô (Xé rào)",
              "Khảo nghiệm & Đối thoại",
              "Thí điểm có Kiểm soát",
              "Thể chế hóa thành Đường lối vĩ mô"
            ].map((step, idx, arr) => (
              <div key={idx} className="flex flex-col md:flex-row items-center gap-4 text-center">
                <div className="p-4 bg-[#EDE8E1]/60 rounded-xl border border-[#8B261D]/20 shadow-sm w-48 h-24 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#8B261D]">{step}</span>
                </div>
                {idx < arr.length - 1 && (
                  <div className="text-[#8B261D] text-2xl font-bold rotate-90 md:rotate-0">
                    ➔
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
