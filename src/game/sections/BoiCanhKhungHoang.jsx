export default function BoiCanhKhungHoang() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  return (
    <section
      id="boi-canh"
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
              KHỐI 1
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight uppercase"
            style={{ fontFamily: f1 }}
          >
            Giải Phẫu Biện Chứng Về Mâu Thuẫn Kinh Tế (1975–1979)
          </h2>

          <p
            className="gsap-reveal text-lg md:text-xl text-[#8B261D] max-w-3xl leading-relaxed font-bold mb-12"
            style={{ fontFamily: f2 }}
          >
            Quy luật: Sự không phù hợp giữa Quan hệ sản xuất và Trình độ phát triển của Lực lượng sản xuất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="gsap-stagger-child p-8 bg-white/70 rounded-2xl border border-[#3D3529]/10 hover:border-[#8B261D]/40 transition-all duration-300">
            <h4
              className="text-xl font-bold text-[#3D3529] mb-4"
              style={{ fontFamily: f1 }}
            >
              Sự duy ý chí trong thiết lập Quan hệ sản xuất (QHSX)
            </h4>
            <p
              className="text-[#5A4632] text-sm leading-relaxed font-light"
              style={{ fontFamily: f2 }}
            >
              Sau năm 1975, mô hình kế hoạch hóa tập trung cố gắng đẩy QHSX (công hữu hóa tuyệt đối, hợp tác xã quy mô lớn, phân phối bình quân) đi trước quá xa so với trình độ còn rất thấp của Lực lượng sản xuất (LLSX) vốn chủ yếu là nông nghiệp thủ công và công nghiệp phân tán.
            </p>
          </div>

          <div className="gsap-stagger-child p-8 bg-white/70 rounded-2xl border border-[#3D3529]/10 hover:border-[#8B261D]/40 transition-all duration-300">
            <h4
              className="text-xl font-bold text-[#3D3529] mb-4"
              style={{ fontFamily: f1 }}
            >
              Hệ quả triệt tiêu
            </h4>
            <p
              className="text-[#5A4632] text-sm leading-relaxed font-light"
              style={{ fontFamily: f2 }}
            >
              QHSX trở thành "chiếc áo quá chật", tước đoạt lợi ích vật chất cá nhân, dẫn đến sự tha hóa lao động: công điểm cào bằng sinh ra "rong công phóng điểm", "cha chung không ai khóc", nhà máy đắp chiếu và nông dân bỏ ruộng.
            </p>
          </div>

          <div className="gsap-stagger-child p-8 bg-[#3D3529] text-[#EDE8E1] rounded-2xl shadow-md border border-[#3D3529]/20">
            <h4
              className="text-xl font-bold text-[#C5A028] mb-4"
              style={{ fontFamily: f1 }}
            >
              Bản chất biện chứng của các cuộc "Xé rào"
            </h4>
            <p
              className="text-[#EDE8E1]/90 text-sm leading-relaxed font-light"
              style={{ fontFamily: f2 }}
            >
              Các cuộc "xé rào" vi mô (Khoán chui Hải Phòng, Tổ gạo Ba Thi TP.HCM, Phương án 304 Dệt Thành Công) không phải là hiện tượng sai phạm ngẫu nhiên, mà là sự tự giải phóng mang tính quy luật tất yếu khách quan của Lực lượng sản xuất nhằm phá vỡ lực cản của một Quan hệ sản xuất xơ cứng, lỗi thời.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
