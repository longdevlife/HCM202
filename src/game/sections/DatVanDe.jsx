export default function DatVanDe() {
  const elements = [
    { n: '01', t: 'Hợp hiến, Hợp pháp', s: 'Tổ chức tổng tuyển cử phổ thông đầu phiếu (1946) để lập Quốc hội, tạo cơ sở pháp lý vững chắc trong quan hệ quốc tế.' },
    { n: '02', t: 'Thượng tôn pháp luật', s: 'Quản lý bằng pháp luật là ưu tiên hàng đầu, bảo đảm thi hành nghiêm túc và khuyến khích nhân dân giám sát.' },
    { n: '03', t: 'Pháp quyền nhân nghĩa', s: 'Pháp luật không chỉ để cai trị mà phải vì con người, lấy giáo dục và cảm hóa làm căn bản.' },
  ];
  const practices = [
    { n: '01', t: 'Yêu sách An Nam', s: 'Đòi hỏi cốt lõi: bình đẳng pháp lý, xóa bỏ tòa án áp bức và thay sắc lệnh bằng đạo luật.' },
    { n: '02', t: 'Hoạt động lập pháp', s: 'Trực tiếp lãnh đạo soạn thảo 2 bản Hiến pháp (1946, 1959), ký ban hành 16 đạo luật và 613 sắc lệnh.' },
    { n: '03', t: 'Quyền con người', s: 'Tiếp cận toàn diện: quyền tự nhiên, chính trị - dân sự đến kinh tế, văn hóa, chú trọng nhóm dễ bị tổn thương.' }
  ];
  const solutions = [
    { n: 'I', t: 'Bình đẳng', s: 'Xóa bỏ tòa án áp bức, thay sắc lệnh bằng đạo luật.' },
    { n: 'II', t: 'Dân chủ', s: 'Thể hiện quyền lực tối cao của nhân dân qua bầu cử.' },
    { n: 'III', t: 'Nghiêm minh', s: 'Phê phán tình trạng "thưởng quá rộng, phạt không nghiêm".' },
    { n: 'IV', t: 'Nhân văn', s: 'Không đối xử dã man với con người, lấy giáo dục làm trọng.' },
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
          <span className="gsap-text-reveal block pb-2 md:pb-3">Cơ Sở Lý Thuyết &</span>
          <span className="gsap-text-reveal block italic font-light text-[#7A6040] pt-1">Nền Tảng Pháp Lý</span>
        </h2>
        <p className="gsap-reveal text-lg text-[#7A6040] max-w-2xl leading-relaxed font-light" style={{ fontFamily: f2 }}>
          Hồ Chí Minh sớm nhận thức tầm quan trọng của Hiến pháp. Khi trở thành người đứng đầu Nhà nước, Người chủ trương nhà nước phải được tổ chức và vận hành theo pháp luật.
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

      {/* Bottom Summary */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="gsap-scale-in bg-white/50 rounded-[20px] border border-[#3D3529]/5 p-10 md:p-16">
          <h3 className="gsap-reveal text-center text-sm font-semibold tracking-[0.2em] uppercase text-[#7A6040]/50 mb-16" style={{ fontFamily: f2 }}>Giá Trị Cốt Lõi</h3>
          <div className="gsap-stagger-parent grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {solutions.map((item) => (
              <div key={item.t} className="gsap-stagger-child flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-full bg-[#EDE8E1] flex items-center justify-center mb-6 border border-[#3D3529]/10 transition-all duration-500 group-hover:bg-[#C5A028] group-hover:border-[#C5A028]">
                  <span className="text-[#C5A028] text-lg font-bold group-hover:text-white transition-colors duration-500" style={{ fontFamily: f1 }}>{item.n}</span>
                </div>
                <h4 className="text-lg font-bold text-[#3D3529] mb-3" style={{ fontFamily: f1 }}>{item.t}</h4>
                <p className="text-[#7A6040] text-sm font-light leading-relaxed" style={{ fontFamily: f2 }}>{item.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
