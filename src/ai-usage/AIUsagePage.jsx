import React from 'react';

const TOOLS = [
  {
    name: 'NotebookLM',
    purpose: 'Tóm tắt slide giáo trình của trường thành các từ khóa, ý chính.',
    human: 'Đối chiếu với giáo trình gốc. Biên tập lại thành câu thoại ngắn gọn. Tự biên soạn lại câu hỏi quiz để đảm bảo độ khó.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
    )
  },
  {
    name: 'Antigravity',
    purpose: 'Gợi ý cú pháp, viết nhanh boilerplate code trong lúc lập trình.',
    human: 'Review toàn bộ logic. Cấu hình các thông số Three.js, xử lý các lỗi tương tác (click, hover, state).',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
    )
  },
  {
    name: 'ChatGPT',
    purpose: 'Hỗ trợ phác thảo nội dung kịch bản, gợi ý dàn ý phân tích lý thuyết và lên ý tưởng cho các phòng triển lãm.',
    human: 'Đối chiếu thông tin trực tiếp với Giáo trình Tư tưởng Hồ Chí Minh chính thống, biên tập lại toàn bộ lập luận theo văn phong học thuật và trực tiếp xây dựng kịch bản chi tiết.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
    )
  },
  {
    name: 'Gemini',
    purpose: 'Tạo hình ảnh 2D, texture bề mặt (VD: vân gỗ, kim loại).',
    human: 'Dùng Photoshop cắt nền, chỉnh màu đồng bộ với thiết kế UI tổng thể của dự án.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    )
  }
];

export const AIUsagePage = () => {
  return (
    <div className="w-full min-h-screen bg-[#EDE8E1] text-[#3D3529] pt-32 pb-24 px-6 md:px-12 relative overflow-y-auto flex justify-center">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#E5E0D8] to-transparent opacity-40 pointer-events-none"></div>

      <div className="max-w-[1000px] w-full relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 animate-in fade-in slide-in-from-top-4">
          <span className="section-label text-[#C5A028] mb-4 tracking-[0.2em] block uppercase font-['Inter'] text-xs font-semibold">Phụ Lục Đặc Biệt</span>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl font-medium tracking-wide mb-6">Báo Cáo Ứng Dụng AI</h1>
          <div className="w-24 h-[1px] bg-[#C5A028] mx-auto opacity-40"></div>
          <p className="mt-6 text-[#7A6040] font-['Inter'] font-light max-w-2xl mx-auto leading-relaxed">
            Sự minh bạch làm nên giá trị học thuật, tính liêm chính định hình trách nhiệm. Phụ lục này là lời cam kết nghiêm túc của chúng em, vạch rõ ranh giới giữa năng lực hỗ trợ của Trí tuệ Nhân tạo và dấu ấn tri thức sáng tạo độc lập của con người trong suốt hành trình kiến tạo dự án.
          </p>
        </div>

        {/* Cột chính */}
        <div className="grid grid-cols-1 gap-12">
          
          {/* Part 1: Cam Kết Liêm Chính */}
          <section className="bg-white/50 border border-[#3D3529]/5 rounded-[20px] p-8 md:p-12 hover:bg-white/80 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#C5A028] block">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </span>
              <h2 className="font-['Playfair_Display'] text-2xl tracking-wider text-[#3D3529]" style={{ fontVariantNumeric: "lining-nums" }}>1. Cam Kết Liêm Chính & Trách Nhiệm</h2>
            </div>
            <div className="space-y-6 font-['Inter'] font-light text-[#7A6040] leading-relaxed">
              <div className="flex flex-col gap-2">
                <h3 className="text-[#3D3529] font-medium tracking-widest text-[11px] uppercase opacity-80">Cam kết cốt lõi</h3>
                <p>Chúng em khẳng định AI chỉ đóng vai trò là trợ lý hỗ trợ xử lý dữ liệu thô. <strong className="text-[#C5A028] font-normal">Không để AI làm thay hoàn toàn.</strong> Nhóm chúng em trực tiếp xây dựng logic, thiết kế kiến trúc và quyết định nội dung của sản phẩm cuối cùng.</p>
              </div>
              <div className="w-full h-[1px] bg-[#3D3529]/10 my-2"></div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[#3D3529] font-medium tracking-widest text-[11px] uppercase opacity-80">Kiểm chứng thông tin</h3>
                <p>Mọi nội dung do AI sinh ra (đặc biệt là phần tóm tắt và phân tích môn Tư tưởng Hồ Chí Minh) đều được đối chiếu trực tiếp với <strong className="text-[#3D3529] font-semibold">Giáo trình Tư tưởng Hồ Chí Minh chính thống</strong>. Chúng em hoàn toàn chịu trách nhiệm 100% về tính chính xác của thông tin.</p>
              </div>
              <div className="w-full h-[1px] bg-[#3D3529]/10 my-2"></div>
              <div className="flex flex-col gap-2">
                <h3 className="text-[#3D3529] font-medium tracking-widest text-[11px] uppercase opacity-80">Phân định rõ ràng</h3>
                <p>AI hỗ trợ gợi ý tài nguyên thô (dàn ý văn bản, gợi ý code, ảnh nền). Chúng em chịu trách nhiệm nghiên cứu sâu, biên tập nội dung khoa học, tối ưu mã nguồn và thiết kế giao diện để tích hợp vào website.</p>
              </div>
            </div>
          </section>

          {/* Part 2: Ứng dụng Sáng tạo */}
          <section className="bg-white/50 border border-[#3D3529]/5 rounded-[20px] p-8 md:p-12 hover:bg-white/80 transition-colors duration-300">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[#C5A028] block">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              </span>
              <h2 className="font-['Playfair_Display'] text-2xl tracking-wider text-[#3D3529]" style={{ fontVariantNumeric: "lining-nums" }}>2. Ứng Dụng Sáng Tạo</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 font-['Inter'] font-light text-[#7A6040] leading-relaxed">
              <div>
                <h3 className="text-[#3D3529] font-medium tracking-widest text-[11px] uppercase opacity-80 mb-3 border-b border-[#3D3529]/10 pb-2 block">Nghiên cứu & Kịch bản</h3>
                <p className="text-sm">Sử dụng NotebookLM và ChatGPT để hỗ trợ tóm tắt slide giáo trình và gợi ý cấu trúc phân tích. Chúng em dựa vào đó để <strong>đối chiếu giáo trình chính gốc</strong>, tự viết kịch bản chi tiết và xây dựng bộ câu hỏi quiz trắc nghiệm.</p>
              </div>
              <div>
                <h3 className="text-[#3D3529] font-medium tracking-widest text-[11px] uppercase opacity-80 mb-3 border-b border-[#3D3529]/10 pb-2 block">Mỹ thuật & Texture</h3>
                <p className="text-sm">Dùng Gemini hỗ trợ phác thảo texture thô (vân gỗ, bề mặt kim loại). Chúng em tự tay cắt ghép nền bằng Photoshop, tinh chỉnh màu sắc để đảm bảo tính mỹ thuật cổ điển, đồng bộ hoàn hảo với UI tổng thể.</p>
              </div>
              <div>
                <h3 className="text-[#3D3529] font-medium tracking-widest text-[11px] uppercase opacity-80 mb-3 border-b border-[#3D3529]/10 pb-2 block">Lập trình & Kiến trúc</h3>
                <p className="text-sm">Sử dụng Antigravity để tối ưu hóa thời gian viết code lặp lại (boilerplate). Chúng em hoàn toàn làm chủ thiết kế kiến trúc 3D, kiểm soát luồng dữ liệu React-Jotai và trực tiếp lập trình sửa các lỗi tương tác phức tạp.</p>
              </div>
            </div>
          </section>

          {/* Part 3: Tool Breakdown */}
          <section className="pt-8">
            <div className="flex flex-col items-center gap-1 mb-10 text-center">
              <h2 className="font-['Playfair_Display'] text-3xl tracking-wider text-[#3D3529]" style={{ fontVariantNumeric: "lining-nums" }}>3. Bảng Phân Định Công Cụ AI</h2>
            </div>

            <div className="space-y-6">
              {TOOLS.map((tool, idx) => (
                <div key={idx} className="bg-white/40 border border-[#3D3529]/5 rounded-[16px] p-6 transition-all duration-300">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Icon & Name */}
                    <div className="md:w-1/4 flex flex-col items-center md:items-start text-center md:text-left md:border-r border-[#3D3529]/10 pr-4">
                      <div className="text-[#C5A028] bg-[#C5A028]/10 p-3 rounded-full mb-3 inline-block border border-[#C5A028]/20">
                        {tool.icon}
                      </div>
                      <h3 className="font-['Playfair_Display'] text-xl text-[#3D3529] tracking-wide">{tool.name}</h3>
                    </div>
                    {/* Details */}
                    <div className="md:w-3/4 flex flex-col sm:flex-row gap-6 font-['Inter'] font-light">
                      <div className="sm:w-1/2 bg-white/60 rounded-[12px] p-5 border border-[#3D3529]/5">
                        <span className="text-[#7A6040]/70 text-[10px] uppercase tracking-widest font-semibold block mb-3">Vai trò của AI (Input thô)</span>
                        <p className="text-[#7A6040] text-sm leading-relaxed">{tool.purpose}</p>
                      </div>
                      <div className="sm:w-1/2 bg-[#C5A028]/5 rounded-[12px] p-5 border border-[#C5A028]/10">
                        <span className="text-[#C5A028] text-[10px] uppercase tracking-widest font-semibold block mb-3 flex items-center gap-2">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                          Chúng em xử lý (Hoàn thiện)
                        </span>
                        <p className="text-[#3D3529] text-sm leading-relaxed">{tool.human}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Part 4: Minh chứng Prompt */}
          <section className="bg-white/50 border border-[#3D3529]/5 rounded-[20px] p-8 md:p-12 hover:bg-white/80 transition-colors duration-300 mt-8">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[#C5A028] block">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </span>
              <h2 className="font-['Playfair_Display'] text-2xl tracking-wider text-[#3D3529]" style={{ fontVariantNumeric: "lining-nums" }}>4. Minh Chứng Sử Dụng Prompt</h2>
            </div>

            <div className="space-y-12 font-['Inter']">
              {/* Prompt 1 */}
              <div>
                <h3 className="text-[#3D3529] font-medium text-lg tracking-wide mb-4 font-['Playfair_Display']">I. Cơ sở lý thuyết</h3>
                <div className="bg-white/80 border border-[#3D3529]/10 rounded-lg p-4 mb-6">
                  <span className="text-[#C5A028] text-xs font-semibold uppercase tracking-wider block mb-2">Prompt:</span>
                  <p className="text-[#7A6040] text-[15px] leading-relaxed italic font-['EB_Garamond']">
                    "Hãy từ giáo trình Tư tưởng Hồ Chí Minh 2021 đưa ra nội dung phân tích cho phần Cơ sở lý thuyết của Nhà nước pháp quyền trong tư tưởng Hồ Chí Minh, làm rõ quan điểm về Nhà nước hợp hiến, hợp pháp; Nhà nước thượng tôn pháp luật; và pháp quyền nhân nghĩa trong quản lý xã hội."
                  </p>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#3D3529]/10 shadow-md">
                  <img src="/images/cosolythuyet.jpg" alt="Đoạn chat cơ sở lý thuyết" className="w-full object-cover" />
                </div>
              </div>

              <div className="w-full h-[1px] bg-[#3D3529]/10"></div>

              {/* Prompt 2 */}
              <div>
                <h3 className="text-[#3D3529] font-medium text-lg tracking-wide mb-4 font-['Playfair_Display']">II. Liên hệ thực tiễn</h3>
                <div className="bg-white/80 border border-[#3D3529]/10 rounded-lg p-4 mb-6">
                  <span className="text-[#C5A028] text-xs font-semibold uppercase tracking-wider block mb-2">Prompt:</span>
                  <p className="text-[#7A6040] text-[15px] leading-relaxed italic font-['EB_Garamond']">
                    "Hãy từ giáo trình Tư tưởng Hồ Chí Minh 2021 đưa ra nội dung phân tích cho phần liên hệ thực tiễn của Nhà nước pháp quyền, làm rõ việc vận dụng tư tưởng Hồ Chí Minh về Nhà nước hợp hiến, hợp pháp; Nhà nước thượng tôn pháp luật; và pháp quyền nhân nghĩa trong hoạt động quản lý nhà nước và đời sống xã hội Việt Nam hiện nay."
                  </p>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#3D3529]/10 shadow-md">
                  <img src="/images/lienhethuctien.jpg" alt="Đoạn chat liên hệ thực tiễn" className="w-full object-cover" />
                </div>
              </div>

              <div className="w-full h-[1px] bg-[#3D3529]/10"></div>

              {/* Prompt 3 */}
              <div>
                <h3 className="text-[#3D3529] font-medium text-lg tracking-wide mb-4 font-['Playfair_Display']">III. Giá trị vận dụng ngày nay</h3>
                <div className="bg-white/80 border border-[#3D3529]/10 rounded-lg p-4 mb-6">
                  <span className="text-[#C5A028] text-xs font-semibold uppercase tracking-wider block mb-2">Prompt:</span>
                  <p className="text-[#7A6040] text-[15px] leading-relaxed italic font-['EB_Garamond']">
                    "Hãy từ giáo trình Tư tưởng Hồ Chí Minh 2021 đưa ra nội dung phân tích cho phần giá trị vận dụng hiện nay của Nhà nước pháp quyền, làm rõ ý nghĩa của Nhà nước hợp hiến, hợp pháp; Nhà nước thượng tôn pháp luật; và pháp quyền nhân nghĩa trong xây dựng Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam hiện nay."
                  </p>
                </div>
                <div className="rounded-xl overflow-hidden border border-[#3D3529]/10 shadow-md">
                  <img src="/images/giatrivandung.jpg" alt="Đoạn chat giá trị vận dụng ngày nay" className="w-full object-cover" />
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
