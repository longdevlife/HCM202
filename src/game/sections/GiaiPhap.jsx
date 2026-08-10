export default function GiaiPhap() {
  const f1 = "'Playfair Display', serif";
  const f2 = "'Inter', sans-serif";

  const features = [
    { n: '01', t: 'Hợp hiến, Hợp pháp', s: 'Tạo nền tảng chính danh và ổn định chính trị qua bầu cử dân chủ; là cơ sở pháp lý để hội nhập quốc tế (CPTPP, EVFTA, FDI).' },
    { n: '02', t: 'Thượng tôn pháp luật', s: 'Bảo đảm công bằng, bình đẳng không phân biệt địa vị; kiểm soát quyền lực, phòng chống tham nhũng với kỷ cương nghiêm minh.' },
    { n: '03', t: 'Pháp quyền nhân nghĩa', s: 'Bảo đảm quyền con người, công bằng xã hội; lấy pháp luật làm công cụ phục vụ và phát triển con người toàn diện.' },
  ];

  const stats = [
    { num: '3', label: 'Giá trị cốt lõi' },
    { num: '1', label: 'Mục tiêu duy nhất' },
    { num: '1946', label: 'Bản Hiến pháp đầu tiên' },
    { num: '2', label: 'Ngày Độc Lập' },
  ];

  return (
    <section id="giai-phap" className="relative w-full bg-[#EDE8E1] px-4 py-32 md:py-40 overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-24 md:mb-32">
        <div className="gsap-reveal flex items-center gap-3 mb-6">
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
          <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-[#7A6040]" style={{ fontFamily: f2 }}>Phần 3</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-[#3D3529] mb-8 leading-snug" style={{ fontFamily: f1 }}>
          <span className="gsap-text-reveal block pb-2 md:pb-3">Giá Trị Vận Dụng &</span>
          <span className="gsap-text-reveal block italic font-light text-[#7A6040] pt-1">Kết Luận</span>
        </h2>
        <p className="gsap-reveal text-lg text-[#7A6040] max-w-2xl leading-relaxed font-light" style={{ fontFamily: f2 }}>
          Tư tưởng Hồ Chí Minh là kim chỉ nam cho công cuộc xây dựng Nhà nước pháp quyền Việt Nam hiện nay, đặc biệt trong việc bảo vệ quyền lợi của nhân dân.
        </p>
      </div>

      {/* Bento Grid — Entrance from opposite sides */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-32 auto-rows-fr">
        {/* Card 1 — Large, slide from left */}
        <div className="gsap-slide-left md:col-span-2 card-tilt group">
          <div className="h-full p-8 md:p-12 bg-white/50 rounded-[20px] border border-[#3D3529]/5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.08)]">
            <h3 className="text-3xl font-bold text-[#3D3529] mb-6" style={{ fontFamily: f1 }}>Thể Thống Nhất Trong Tư Tưởng HCM</h3>
            <p className="text-[#7A6040] text-base md:text-lg leading-relaxed font-light mb-8" style={{ fontFamily: f2 }}>
              Ba nội dung — hợp hiến hợp pháp, thượng tôn pháp luật và pháp quyền nhân nghĩa — tạo nền tảng vững chắc để xây dựng nhà nước <strong>của nhân dân, do nhân dân, vì nhân dân</strong>.
            </p>
            <div className="gsap-stagger-parent grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="gsap-stagger-child p-5 bg-[#EDE8E1] rounded-[16px]">
                <h4 className="font-bold text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>Chính danh</h4>
                <p className="text-[#7A6040] text-sm font-light" style={{ fontFamily: f2 }}>Tạo sự ủng hộ và niềm tin tuyệt đối từ nhân dân trong nước.</p>
              </div>
              <div className="gsap-stagger-child p-5 bg-[#EDE8E1] rounded-[16px]">
                <h4 className="font-bold text-[#3D3529] mb-2" style={{ fontFamily: f1 }}>Uy tín quốc tế</h4>
                <p className="text-[#7A6040] text-sm font-light" style={{ fontFamily: f2 }}>Khẳng định vị thế, thu hút hợp tác bình đẳng trên thế giới.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 — Small Dark, slide from right */}
        <div className="gsap-slide-right md:col-span-1 card-tilt group">
          <div className="h-full p-8 md:p-10 bg-[#3D3529] rounded-[20px] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(61,53,41,0.2)]">
            <h3 className="text-2xl md:text-3xl font-bold text-[#EDE8E1] mb-6" style={{ fontFamily: f1 }}>Mục tiêu tối thượng</h3>
            <p className="text-[#EDE8E1]/70 text-base leading-relaxed font-light" style={{ fontFamily: f2 }}>
              Một nhà nước thực sự "của nhân dân, do nhân dân và vì nhân dân" – tạo tiền đề cho sự phát triển vững bền của dân tộc.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Biểu hiện — Progressive stagger */}
      <div className="w-full max-w-7xl mx-auto mb-32">
        <div className="gsap-reveal flex items-center justify-center gap-4 mb-16">
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
          <span className="text-sm tracking-[0.25em] text-[#7A6040]/60 uppercase font-semibold" style={{ fontFamily: f2 }}>03 Giá Trị Trọng Tâm</span>
          <div className="h-[1px] w-12 bg-[#3D3529]/15 gsap-line-draw" />
        </div>
        <div className="gsap-stagger-parent grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((item) => (
            <div key={item.n} className="gsap-stagger-child card-tilt group">
              <div className="h-full p-8 border-t border-[#3D3529]/10 transition-colors duration-500 group-hover:border-[#C5A028]">
                <span className="gsap-counter text-4xl font-light text-[#C5A028] mb-6 block" style={{ fontFamily: f1, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} data-target={parseInt(item.n)}>{item.n}.</span>
                <h4 className="text-xl font-bold text-[#3D3529] mb-4" style={{ fontFamily: f1 }}>{item.t}</h4>
                <p className="text-[#7A6040] text-base leading-relaxed font-light" style={{ fontFamily: f2 }}>{item.s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Summary — Scale-in */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="gsap-scale-in bg-white/50 rounded-[20px] border border-[#3D3529]/5 p-10 md:p-16">
          <h3 className="gsap-reveal text-center text-sm font-semibold tracking-[0.2em] uppercase text-[#7A6040]/50 mb-16" style={{ fontFamily: f2 }}>Tư Tưởng Cốt Lõi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
            <div className="gsap-slide-left flex flex-col justify-center">
              <h4 className="text-3xl font-bold text-[#3D3529] mb-6" style={{ fontFamily: f1 }}>Di Sản Hồ Chí Minh</h4>
              <p className="text-[#7A6040] text-base leading-relaxed font-light mb-8" style={{ fontFamily: f2 }}>
                Tư tưởng của Người về nhà nước pháp quyền nhân nghĩa đã đi trước thời đại và đến nay vẫn còn nguyên giá trị định hướng.
              </p>
              <div className="space-y-4">
                {['Lấy sự ủng hộ của nhân dân làm gốc.', 'Thượng tôn pháp luật, hiến pháp.', 'Kết hợp nhuần nhuyễn giữa pháp trị và đức trị.'].map(text => (
                  <div key={text} className="gsap-reveal flex items-start gap-3 text-[#7A6040] font-light" style={{ fontFamily: f2 }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A028] mt-2 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="gsap-stagger-parent grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="gsap-stagger-child bg-[#EDE8E1] p-6 rounded-[16px] flex flex-col items-center justify-center text-center transition-all duration-500 hover:bg-[#3D3529] group">
                  <span className="gsap-counter text-4xl font-bold text-[#C5A028] mb-2 group-hover:text-[#C5A028]" style={{ fontFamily: f1, fontVariantNumeric: 'lining-nums', fontFeatureSettings: '"lnum" 1' }} data-target={parseInt(stat.num)}>{stat.num}</span>
                  <span className="text-sm font-medium text-[#7A6040] group-hover:text-[#EDE8E1]/70 transition-colors duration-500" style={{ fontFamily: f2 }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
