export default function DatVanDe() {
  const elements = [
    { n: '01', t: 'Bản Chất Giai Cấp Công Nhân', s: 'Mang bản chất giai cấp công nhân do Đảng Cộng sản lãnh đạo, giữ định hướng XHCN và vận hành theo nguyên tắc Tập trung dân chủ. Bản chất này thống nhất sâu sắc với tính nhân dân và tính dân tộc.' },
    { n: '02', t: 'Nhà Nước Của Dân (Dân Là Chủ)', s: 'Tất cả quyền lực thuộc về nhân dân. Thực thi qua Dân chủ trực tiếp và gián tiếp. Cán bộ là "công bộc, đầy tớ", dân có quyền kiểm soát và bãi miễn các đại biểu không xứng đáng.' },
    { n: '03', t: 'Nhà Nước Do Dân & Vì Dân', s: 'Do dân tự tay bầu nên và gánh vác. Phục vụ lợi ích tối thượng của dân, không có đặc quyền đặc lợi với phương châm: "Việc gì có lợi cho dân, ta phải hết sức làm".' },
  ];
  const practices = [
    { n: '01', t: 'Quyền lực tối cao của Dân', s: 'Dân bầu ra bộ máy công quyền, có quyền kiểm soát, phê bình và bãi miễn đại biểu không xứng đáng, giải tán Chính phủ nếu Chính phủ làm hại dân.' },
    { n: '02', t: 'Vị thế "Công bộc" cán bộ', s: 'Cán bộ từ Chủ tịch nước đến người quét rác đều là "đầy tớ" của nhân dân chứ không phải "quan cách mạng", phải "lo trước thiên hạ, vui sau thiên hạ".' },
    { n: '03', t: 'Năng lực làm chủ', s: 'Hồ Chí Minh nhấn mạnh "Muốn làm chủ tốt phải có năng lực làm chủ" – Nhà nước có trách nhiệm giáo dục và nâng cao dân trí, chuẩn bị điều kiện cho dân.' }
  ];


  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  return (
    <section id="dat-van-de" className="relative w-full bg-[#EDE8E1] px-4 py-32 md:py-40 overflow-hidden">
      {/* Header with text reveal */}
      <div className="w-full max-w-7xl mx-auto mb-24 md:mb-32">
        <div className="gsap-reveal flex items-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#7A6040]" style={{ fontFamily: f2 }}>Phần 1</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-[#3D3529] mb-8 leading-snug" style={{ fontFamily: f1 }}>
          <span className="gsap-text-reveal block pb-2 md:pb-3">Cơ Sở Lý Luận &</span>
          <span className="gsap-text-reveal block italic font-light text-[#7A6040] pt-1">Bốn Trụ Cột Cốt Lõi</span>
        </h2>
        <p className="gsap-reveal text-lg text-[#7A6040] max-w-2xl leading-relaxed font-light" style={{ fontFamily: f2 }}>
          Hồ Chí Minh khẳng định Nhà nước ta là Nhà nước dân chủ, mang bản chất giai cấp công nhân. Sự kết hợp hài hòa giữa bản chất giai cấp và sức mạnh đại đoàn kết toàn dân tộc tạo nên mô hình quản trị quốc gia vĩ đại.
        </p>
      </div>

      {/* 3 Core Elements — Progressive Stagger */}
      <div className="w-full max-w-7xl mx-auto gsap-stagger-parent grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-32">
        {elements.map((item) => (
          <div key={item.n} className="gsap-stagger-child card-tilt group">
            <div className="h-full p-8 md:p-10 bg-white/50 rounded-[20px] border border-[#3D3529]/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.08)]">
              <span className="gsap-counter text-4xl font-light text-[#C5A028] mb-6 block" style={{ fontFamily: f1 }} data-target={parseInt(item.n)}>{item.n}</span>
              <h4 className="text-xl font-bold text-[#3D3529] mb-4" style={{ fontFamily: f1 }}>{item.t}</h4>
              <p className="text-[#7A6040] text-base leading-relaxed font-light" style={{ fontFamily: f2 }}>{item.s}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Practical Application — Stagger from different directions */}
      <div className="w-full max-w-7xl mx-auto mb-32">
        <div className="gsap-reveal flex items-center justify-center gap-4 mb-16">
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
          <span className="text-sm tracking-[0.25em] text-[#7A6040]/60 uppercase font-semibold" style={{ fontFamily: f2 }}>Biểu Hiện Cụ Thể</span>
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
        </div>
        <div className="gsap-stagger-parent grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {practices.map((item) => (
            <div key={item.n} className="gsap-stagger-child card-tilt group">
              <div className="h-full p-8 border-t border-[#3D3529]/10 transition-colors duration-500 group-hover:border-[#C5A028]">
                <span className="gsap-counter text-4xl font-light text-[#C5A028] mb-6 block" style={{ fontFamily: f1 }} data-target={parseInt(item.n)}>{item.n}.</span>
                <h4 className="text-xl font-bold text-[#3D3529] mb-4" style={{ fontFamily: f1 }}>{item.t}</h4>
                <p className="text-[#7A6040] text-base leading-relaxed font-light" style={{ fontFamily: f2 }}>{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Removed Bottom Summary to avoid redundancy */}
    </section>
  );
}
