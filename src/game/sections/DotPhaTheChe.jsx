export default function DotPhaTheChe() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  return (
    <section
      id="dot-pha"
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
              KHỐI 3
            </span>
          </div>

          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight uppercase"
            style={{ fontFamily: f1 }}
          >
            Nghệ Thuật Quản Trị Đánh Đổi & Phủ Định Biện Chứng
          </h2>

          <p
            className="gsap-reveal text-lg md:text-xl text-[#8B261D] max-w-3xl leading-relaxed font-bold mb-12"
            style={{ fontFamily: f2 }}
          >
            Ba bước đột phá thể chế (1979–1981) – Bản chất của sự kế thừa và lọc bỏ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="gsap-stagger-child p-8 bg-[#3D3529] text-[#EDE8E1] rounded-3xl border border-[#3D3529]/20 shadow-lg">
            <h4
              className="text-2xl font-bold text-[#C5A028] mb-6 uppercase"
              style={{ fontFamily: f1 }}
            >
              Quy luật Phủ định của Phủ định
            </h4>
            <p
              className="text-[#EDE8E1] text-base leading-relaxed font-light mb-6"
              style={{ fontFamily: f2 }}
            >
              Các quyết sách TW6 (1979), Chỉ thị 100 và Quyết định 25/26-CP (1981) không phủ nhận hoàn toàn CNXH, mà là phủ định biện chứng:
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/10 rounded-xl">
                <span className="text-[#8B261D] font-bold uppercase tracking-wider block mb-1">Lọc bỏ mặt tiêu cực</span>
                <p className="text-sm text-[#EDE8E1]/90">Xóa bỏ phân phối cào bằng, xóa bỏ độc quyền mậu dịch cứng nhắc, dỡ bỏ trạm kiểm soát ngăn sông cấm chợ.</p>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                <span className="text-[#C5A028] font-bold uppercase tracking-wider block mb-1">Kế thừa & Phát triển</span>
                <p className="text-sm text-[#EDE8E1]/90">Giữ vững vai trò chủ đạo của kinh tế quốc doanh, giữ vững kế hoạch pháp lệnh cốt lõi làm lưới an toàn, đồng thời mở van cho kinh tế hàng hóa và động lực cá nhân phát triển.</p>
              </div>
            </div>
          </div>

          <div className="gsap-stagger-child p-8 bg-white/70 rounded-3xl border border-[#3D3529]/10 hover:border-[#8B261D]/40 transition-all duration-300">
            <h4
              className="text-2xl font-bold text-[#3D3529] mb-6 uppercase"
              style={{ fontFamily: f1 }}
            >
              Cân bằng động trong Tam giác Cải cách
            </h4>
            <p
              className="text-[#5A4632] text-base leading-relaxed font-light mb-6"
              style={{ fontFamily: f2 }}
            >
              Quản trị vĩ mô giai đoạn này là bài toán tìm điểm cân bằng tối ưu giữa 3 cực (The Reform Trilemma):
            </p>

            <ul className="space-y-4">
              <li className="flex gap-4 p-4 bg-[#EDE8E1]/50 rounded-xl border border-[#3D3529]/10">
                <span className="text-2xl font-bold text-[#8B261D]">1</span>
                <div>
                  <strong className="block text-[#3D3529] font-bold">Chỉ tiêu Kế hoạch:</strong>
                  <span className="text-sm text-[#5A4632] leading-relaxed">Bảo đảm ngân sách và nhu cầu quốc phòng, an sinh thiết yếu.</span>
                </div>
              </li>
              <li className="flex gap-4 p-4 bg-[#EDE8E1]/50 rounded-xl border border-[#3D3529]/10">
                <span className="text-2xl font-bold text-[#8B261D]">2</span>
                <div>
                  <strong className="block text-[#3D3529] font-bold">Động lực Thị trường:</strong>
                  <span className="text-sm text-[#5A4632] leading-relaxed">Kích thích sức lao động qua phần vượt khoán và sản xuất phụ.</span>
                </div>
              </li>
              <li className="flex gap-4 p-4 bg-[#EDE8E1]/50 rounded-xl border border-[#3D3529]/10">
                <span className="text-2xl font-bold text-[#8B261D]">3</span>
                <div>
                  <strong className="block text-[#3D3529] font-bold">Kiểm soát Vĩ mô:</strong>
                  <span className="text-sm text-[#5A4632] leading-relaxed">Giữ vững kỷ cương, kiềm chế lạm phát và ổn định xã hội.</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
