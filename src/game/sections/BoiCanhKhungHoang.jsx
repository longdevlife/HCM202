export default function BoiCanhKhungHoang() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const mechanisms = [
    {
      n: "01",
      title: "Cơ chế “Cấp phát – Giao nộp”",
      desc: "Nhà nước ấn định chỉ tiêu pháp lệnh, cấp vốn và vật tư đầu vào; độc quyền thu mua sản phẩm đầu ra theo mức giá danh nghĩa thấp hơn xa chi phí thực tế.",
      tag: "Kế hoạch hóa tập trung",
    },
    {
      n: "02",
      title: "Phân phối hiện vật qua Tem phiếu",
      desc: "Hàng hóa tiêu dùng thiết yếu (gạo, vải, chất đốt, thịt...) được cấp phát theo định ngạch cứng nhắc, triệt tiêu động lực và quan hệ hàng hóa - tiền tệ.",
      tag: "Mậu dịch quốc doanh",
    },
    {
      n: "03",
      title: "“Ngăn sông cấm chợ” & Độc quyền",
      desc: "Hàng loạt trạm kiểm soát liên ngành trên các tuyến quốc lộ ngăn cấm tư nhân vận chuyển buôn bán hàng hóa, bóp nghẹt chuỗi lưu thông nội địa.",
      tag: "Ách tắc lưu thông",
    },
    {
      n: "04",
      title: "Triệt tiêu Động lực Lao động",
      desc: "Nông nghiệp chấm công điểm cào bằng dẫn đến 'rong công phóng điểm', 'cha chung không ai khóc'. Công nghiệp xơ cứng, máy móc đắp chiếu, công nhân nhận 70% lương chờ việc.",
      tag: "Khủng hoảng động lực",
    },
  ];

  const shocks = [
    {
      num: "01",
      title: "Chiến tranh Bảo vệ Biên giới",
      detail: "Xung đột tại biên giới Tây Nam (1978–1979) và phía Bắc (tháng 2/1979) buộc nền kinh tế phải vừa sản xuất vừa dồn toàn lực phục vụ quốc phòng bảo vệ Tổ quốc.",
    },
    {
      num: "02",
      title: "Bao vây & Cấm vận Ngặt nghèo",
      detail: "Phương Tây và Mỹ áp đặt lệnh cấm vận kinh tế và cô lập ngoại giao nghiêm ngặt, cắt đứt quan hệ thương mại quốc tế của Việt Nam.",
    },
    {
      num: "03",
      title: "Cắt giảm Nguồn Viện trợ",
      detail: "Nguồn viện trợ không hoàn lại và các khoản vay ưu đãi truyền thống từ khối các nước XHCN và tổ chức quốc tế bị thu hẹp đáng kể.",
    },
    {
      num: "04",
      title: "Thiên tai Đại hồng thủy (1978)",
      detail: "Trận lụt lịch sử năm 1978 tàn phá nặng nề mùa màng trên diện rộng tại cả hai vựa lúa đồng bằng sông Hồng và đồng bằng sông Cửu Long.",
    },
  ];

  return (
    <section
      id="boi-canh"
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
              Phần 1 • Khảo Sát Lịch Sử
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#3D3529] mb-6 leading-tight"
            style={{ fontFamily: f1 }}
          >
            <span className="gsap-text-reveal block">Khủng Hoảng Hệ Thống &</span>
            <span className="gsap-text-reveal block italic font-light text-[#7A6040]">
              Cơ Chế Bao Cấp (1975–1979)
            </span>
          </h2>

          <p
            className="gsap-reveal text-base md:text-lg text-[#5A4632] max-w-3xl leading-relaxed font-light"
            style={{ fontFamily: f2 }}
          >
            Sau ngày đất nước thống nhất năm 1975, mô hình kinh tế kế hoạch hóa tập trung quan liêu bao cấp bộc lộ sự xơ cứng, triệt tiêu động lực lao động và đẩy đất nước vào nguy cơ khủng hoảng thiếu hụt trầm trọng.
          </p>
        </div>

        {/* 4 Cột Trụ Vận Hành Cũ */}
        <div className="mb-28">
          <div className="gsap-reveal flex items-center justify-between gap-4 mb-10 pb-4 border-b border-[#3D3529]/10">
            <h3
              className="text-2xl md:text-3xl font-bold text-[#3D3529]"
              style={{ fontFamily: f1 }}
            >
              Giải phẫu Cơ chế Hành chính – Mệnh lệnh
            </h3>
            <span
              className="hidden sm:inline text-xs uppercase tracking-wider text-[#7A6040] font-semibold"
              style={{ fontFamily: f2 }}
            >
              4 Rào cản cốt lõi
            </span>
          </div>

          <div className="gsap-stagger-parent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mechanisms.map((m) => (
              <div
                key={m.n}
                className="gsap-stagger-child p-7 bg-white/70 rounded-2xl border border-[#3D3529]/10 hover:border-[#8B261D]/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-3xl font-light text-[#8B261D]"
                      style={{ fontFamily: f1 }}
                    >
                      {m.n}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-[#8B261D]/10 text-[#8B261D]">
                      {m.tag}
                    </span>
                  </div>
                  <h4
                    className="text-lg font-bold text-[#3D3529] mb-3 leading-snug"
                    style={{ fontFamily: f1 }}
                  >
                    {m.title}
                  </h4>
                  <p
                    className="text-[#6B5744] text-sm leading-relaxed font-light"
                    style={{ fontFamily: f2 }}
                  >
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bốn Cú Sốc Dồn Dập */}
        <div className="mb-24">
          <div className="gsap-reveal flex items-center justify-between gap-4 mb-10 pb-4 border-b border-[#3D3529]/10">
            <div>
              <span
                className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#8B261D] block mb-1"
                style={{ fontFamily: f2 }}
              >
                1978 – 1979
              </span>
              <h3
                className="text-2xl md:text-3xl font-bold text-[#3D3529]"
                style={{ fontFamily: f1 }}
              >
                Bốn Cú Sốc Kinh Tế – Xã Hội Dồn Dập
              </h3>
            </div>
            <span className="px-3 py-1 bg-[#8B261D] text-white text-xs font-semibold rounded-full uppercase tracking-wider">
              Khủng hoảng sinh tồn
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shocks.map((s) => (
              <div
                key={s.num}
                className="gsap-slide-left p-8 bg-[#3D3529] text-[#EDE8E1] rounded-2xl shadow-md border border-[#3D3529]/20 flex gap-5 items-start"
              >
                <span
                  className="text-3xl font-light text-[#C5A028] shrink-0"
                  style={{ fontFamily: f1 }}
                >
                  {s.num}
                </span>
                <div>
                  <h4
                    className="text-xl font-bold text-white mb-2"
                    style={{ fontFamily: f1 }}
                  >
                    {s.title}
                  </h4>
                  <p
                    className="text-[#EDE8E1]/80 text-sm leading-relaxed font-light"
                    style={{ fontFamily: f2 }}
                  >
                    {s.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thống kê cảnh báo sinh tồn */}
        <div className="gsap-scale-in p-8 md:p-12 rounded-3xl bg-white/80 border border-[#3D3529]/10 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#8B261D] font-bold block mb-2">
                Sản lượng lương thực bình quân (1976–1980)
              </span>
              <div
                className="text-5xl md:text-6xl font-extrabold text-[#8B261D]"
                style={{ fontFamily: f1 }}
              >
                13,4 <span className="text-2xl font-normal text-[#3D3529]">triệu tấn</span>
              </div>
              <p className="text-xs text-[#7A6040] mt-2 italic">
                Dưới mức tiêu thụ tối thiểu của cả nước
              </p>
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#8B261D] font-bold block mb-2">
                Dự trữ lương thực TP. Hồ Chí Minh (1978)
              </span>
              <div
                className="text-5xl md:text-6xl font-extrabold text-[#3D3529]"
                style={{ fontFamily: f1 }}
              >
                &lt; 3 <span className="text-2xl font-normal text-[#7A6040]">ngày</span>
              </div>
              <p className="text-xs text-[#7A6040] mt-2 italic">
                Nạn đói đe dọa hơn 4 triệu dân đô thị
              </p>
            </div>

            <div className="p-6 bg-[#EDE8E1]/60 rounded-2xl border border-[#3D3529]/10">
              <span className="text-xs font-bold text-[#8B261D] uppercase tracking-wider block mb-2">
                Áp Lực Thực Tiễn
              </span>
              <p
                className="text-[#3D3529] text-sm leading-relaxed font-medium italic"
                style={{ fontFamily: "'EB Garamond', serif" }}
              >
                "Đứng trước nguy cơ thiếu đói cận kề, những người lãnh đạo và cơ sở dám nghĩ dám làm đã buộc phải xé rào tìm đường sống cho dân."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
