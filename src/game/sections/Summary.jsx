import React from "react";

export default function Summary() {
  return (
    <div className="bg-[#FAFAF8] text-[#1A1A1A] w-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* PHẦN 1: CƠ SỞ LÝ LUẬN (THEO GIÁO TRÌNH) */}
      <section id="phan-1" className="py-24 px-6 md:px-16 lg:px-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C5A028] tracking-[0.15em] uppercase font-semibold text-sm mb-3">Phần 1</p>
          <h2 className="text-4xl md:text-5xl font-light text-[#3D3529] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Tư tưởng Hồ Chí Minh về Nhà nước dân chủ
          </h2>
          <div className="w-24 h-1 bg-[#C5A028] mx-auto rounded-full"></div>
        </div>

        <div className="space-y-16">
          {/* a. Bản chất giai cấp */}
          <div>
            <h3 className="text-3xl text-[#3D3529] mb-6 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              a. Bản chất giai cấp của Nhà nước
            </h3>
            <p className="text-lg text-[#7A6040] italic mb-8">
              Nhà nước ta là Nhà nước dân chủ, nhưng không phải là "Nhà nước toàn dân" hiểu theo nghĩa phi giai cấp, mà là Nhà nước mang bản chất giai cấp công nhân. Bản chất này thể hiện ở các phương diện:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-[#EDE8E1]">
                <h4 className="text-xl text-[#C5A028] mb-3 font-semibold">Sự lãnh đạo của Đảng Cộng sản Việt Nam</h4>
                <p className="text-[#3D3529] leading-relaxed">Đảng giữ vai trò cầm quyền, lãnh đạo Nhà nước bằng đường lối, chủ trương, qua các tổ chức đảng và đảng viên gương mẫu trong bộ máy, và bằng công tác kiểm tra.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-[#EDE8E1]">
                <h4 className="text-xl text-[#C5A028] mb-3 font-semibold">Tính định hướng xã hội chủ nghĩa</h4>
                <p className="text-[#3D3529] leading-relaxed">Nhà nước dẫn dắt đất nước đi lên chủ nghĩa xã hội, thể hiện sứ mệnh lịch sử của giai cấp công nhân và nhân dân lao động.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-[#EDE8E1]">
                <h4 className="text-xl text-[#C5A028] mb-3 font-semibold">Nguyên tắc tổ chức tập trung dân chủ</h4>
                <p className="text-[#3D3529] leading-relaxed">Đây là nguyên tắc cốt lõi trong tổ chức và hoạt động của bộ máy nhà nước.</p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm border border-[#EDE8E1]">
                <h4 className="text-xl text-[#C5A028] mb-3 font-semibold">Sự thống nhất biện chứng</h4>
                <p className="text-[#3D3529] leading-relaxed">Bản chất giai cấp công nhân thống nhất sâu sắc với tính nhân dân và tính dân tộc. Nhà nước ra đời là kết quả đấu tranh gian khổ của toàn dân tộc; Nhà nước gánh vác nhiệm vụ bảo vệ độc lập, chủ quyền và kiên trì mục tiêu vì lợi ích cốt lõi của quốc gia - dân tộc.</p>
              </div>
            </div>
          </div>

          {/* b. Nhà nước Của dân */}
          <div id="phan-1-2">
            <h3 className="text-3xl text-[#3D3529] mb-6 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
              b. Nhà nước "Của dân"
            </h3>
            <div className="p-8 bg-[#EDE8E1]/40 rounded-3xl mb-8 border-l-4 border-[#C5A028]">
              <h4 className="text-xl text-[#3D3529] font-semibold mb-2">Quyền lực tối cao thuộc về nhân dân</h4>
              <p className="text-lg text-[#3D3529] leading-relaxed" style={{ fontFamily: "'EB Garamond', serif" }}>
                Tất cả mọi quyền lực trong Nhà nước Dân chủ Cộng hòa đều thuộc về nhân dân. Nguyên lý "dân là chủ" xác định địa vị tối cao của người dân là người chủ nước nhà.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#EDE8E1]">
                <h4 className="text-xl text-[#7A6040] mb-3 font-semibold">Hai hình thức thực hiện quyền lực:</h4>
                <ul className="list-disc list-inside space-y-2 text-[#3D3529] ml-2">
                  <li><strong>Dân chủ trực tiếp:</strong> Nhân dân trực tiếp quyết định các vấn đề hệ trọng liên quan đến vận mệnh quốc gia, thực hiện quyền bầu cử, ứng cử.</li>
                  <li><strong>Dân chủ gián tiếp (Dân chủ đại diện):</strong> Nhân dân ủy quyền lực cho các cơ quan đại diện do mình bầu ra (Quốc hội, Hội đồng nhân dân). Quyền lực nhà nước chỉ là "thừa ủy quyền" của nhân dân.</li>
                </ul>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#EDE8E1]">
                  <h4 className="text-xl text-[#7A6040] mb-3 font-semibold">Vị thế của cán bộ</h4>
                  <p className="text-[#3D3529]">Cán bộ từ Chủ tịch nước đến người quét rác đều là "công bộc", "đầy tớ" của nhân dân chứ không phải là "quan cách mạng" để đè đầu cưỡi cổ dân.</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-[#EDE8E1]">
                  <h4 className="text-xl text-[#7A6040] mb-3 font-semibold">Quyền kiểm soát của dân</h4>
                  <p className="text-[#3D3529]">Nhân dân có quyền phê bình, kiểm soát nhà nước, bãi miễn các đại biểu không xứng đáng và có quyền giải tán Chính phủ nếu Chính phủ làm hại dân.</p>
                </div>
              </div>
            </div>
          </div>

          {/* c & d. Nhà nước Do dân & Vì dân */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* c. Nhà nước Do dân */}
            <div>
              <h3 className="text-3xl text-[#3D3529] mb-6 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                c. Nhà nước "Do dân"
              </h3>
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-xl shadow-sm border-t-2 border-[#C5A028]">
                  <h4 className="font-semibold text-[#3D3529] mb-2">Do dân xây dựng</h4>
                  <p className="text-[#7A6040]">Nhà nước do nhân dân tự tay tổ chức, lựa chọn và lập nên thông qua các cuộc Tổng tuyển cử tự do.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border-t-2 border-[#3D3529]">
                  <h4 className="font-semibold text-[#3D3529] mb-2">"Dân làm chủ" - Trách nhiệm và nghĩa vụ</h4>
                  <p className="text-[#7A6040]">Đi đôi với quyền lợi là nghĩa vụ làm chủ. Dân làm chủ là phải tự giác tuân thủ pháp luật, đóng thuế, tham gia gánh vác công việc chung, bảo vệ Tổ quốc.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border-t-2 border-[#C5A028]">
                  <h4 className="font-semibold text-[#3D3529] mb-2">Giáo dục năng lực làm chủ</h4>
                  <p className="text-[#7A6040]">Hồ Chí Minh nhấn mạnh: "Muốn làm chủ tốt, phải có năng lực làm chủ". Nhà nước cần giáo dục, chuẩn bị và tạo mọi điều kiện thuận lợi để người dân thực hành đầy đủ các quyền làm chủ của mình.</p>
                </div>
              </div>
            </div>

            {/* d. Nhà nước Vì dân */}
            <div>
              <h3 className="text-3xl text-[#3D3529] mb-6 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                d. Nhà nước "Vì dân"
              </h3>
              <div className="space-y-4">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-[#EDE8E1]">
                  <h4 className="font-semibold text-[#C5A028] mb-2">Mục tiêu tối thượng</h4>
                  <p className="text-[#3D3529]">Phục vụ lợi ích và nguyện vọng chính đáng của nhân dân, không có đặc quyền đặc lợi, thực sự trong sạch.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-[#EDE8E1]">
                  <h4 className="font-semibold text-[#C5A028] mb-2">Nguyên tắc hành động</h4>
                  <p className="text-[#3D3529]">Mọi chính sách phải hướng tới mưu cầu hạnh phúc cho dân. "Việc gì có lợi cho dân, ta phải hết sức làm. Việc gì có hại cho dân, ta phải hết sức tránh".</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-[#EDE8E1]">
                  <h4 className="font-semibold text-[#C5A028] mb-2">Đạo đức người lãnh đạo</h4>
                  <p className="text-[#3D3529]">Cán bộ phải có tinh thần "lo trước thiên hạ, vui sau thiên hạ", vừa là người lãnh đạo hướng dẫn, vừa là đầy tớ trung thành của nhân dân.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 2: LIÊN HỆ THỰC TIỄN & KỶ NGUYÊN SỐ (ASSIGNMENT) */}
      <section id="phan-2" className="py-24 px-6 md:px-16 lg:px-24 bg-[#EDE8E1]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[#7A6040] tracking-[0.15em] uppercase font-semibold text-sm mb-3">Phần 2</p>
            <h2 className="text-4xl md:text-5xl font-light text-[#3D3529] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Liên Hệ Thực Tiễn & Kỷ Nguyên Số
            </h2>
            <p className="text-lg text-[#7A6040] max-w-3xl mx-auto leading-relaxed">
              Làm thế nào để vừa bảo đảm <strong>"dân là chủ, dân làm chủ"</strong>, vừa thích ứng với yêu cầu <strong>quản trị quốc gia hiện đại</strong>? Dưới đây là bức tranh thực tiễn về việc ứng dụng công nghệ số và mạng xã hội để phát huy quyền làm chủ của nhân dân.
            </p>
          </div>

          {/* Khối Số Liệu Biết Nói (4 chỉ số) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center border-b-4 border-[#C5A028]">
              <h4 className="text-4xl md:text-5xl font-light text-[#C5A028] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>100%</h4>
              <p className="text-[#7A6040] text-sm font-medium">Dịch vụ công thiết yếu trực tuyến</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center border-b-4 border-[#3D3529]">
              <h4 className="text-4xl md:text-5xl font-light text-[#3D3529] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>&gt;70M</h4>
              <p className="text-[#7A6040] text-sm font-medium">Tài khoản định danh VNeID</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center border-b-4 border-[#C5A028]">
              <h4 className="text-4xl md:text-5xl font-light text-[#C5A028] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>100%</h4>
              <p className="text-[#7A6040] text-sm font-medium">Phản ánh trên App đô thị được minh bạch</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center border-b-4 border-[#3D3529]">
              <h4 className="text-4xl md:text-5xl font-light text-[#3D3529] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>24H</h4>
              <p className="text-[#7A6040] text-sm font-medium">Xác minh phản ánh dư luận trên MXH</p>
            </div>
          </div>

          {/* 3 Block thực tiễn số mới */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-md border border-[#EDE8E1]">
              <p className="text-xs uppercase tracking-widest text-[#C5A028] font-bold mb-3">Block 01</p>
              <h3 className="text-2xl text-[#3D3529] mb-4 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Dân Chủ Trực Tiếp Qua App Công Dân
              </h3>
              <h4 className="text-sm font-semibold text-[#7A6040] mb-4 pb-4 border-b border-[#EDE8E1]">
                Ứng dụng Phản ánh Hiện trường (Huế-S, 1022, VNeID)
              </h4>
              <p className="text-[#3D3529] leading-relaxed">
                Người dân trực tiếp gửi phản ánh, góp ý chính sách real-time đến chính quyền. Quy trình xử lý được công khai, minh bạch và dân được trực tiếp đánh giá mức độ hài lòng đối với cán bộ.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md border border-[#EDE8E1]">
              <p className="text-xs uppercase tracking-widest text-[#3D3529] font-bold mb-3">Block 02</p>
              <h3 className="text-2xl text-[#3D3529] mb-4 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Quyền Giám Sát Công Quyền Qua MXH
              </h3>
              <h4 className="text-sm font-semibold text-[#7A6040] mb-4 pb-4 border-b border-[#EDE8E1]">
                Giám sát công quyền "Không vùng cấm"
              </h4>
              <p className="text-[#3D3529] leading-relaxed">
                Mạng xã hội trở thành công cụ giám sát đắc lực. Người dân phản ánh thái độ hạch dịch, nhũng nhiễu của cán bộ, buộc cơ quan chức năng phải xác minh, xử lý nghiêm minh, khẳng định cán bộ là "đầy tớ" của dân.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-md border border-[#EDE8E1]">
              <p className="text-xs uppercase tracking-widest text-[#C5A028] font-bold mb-3">Block 03</p>
              <h3 className="text-2xl text-[#3D3529] mb-4 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Chính Phủ Số - Bỏ Cơ Chế "Xin - Cho"
              </h3>
              <h4 className="text-sm font-semibold text-[#7A6040] mb-4 pb-4 border-b border-[#EDE8E1]">
                Cổng Dịch vụ công Trực tuyến toàn trình (Đề án 06)
              </h4>
              <p className="text-[#3D3529] leading-relaxed">
                Hiện thực hóa Nhà nước "Vì Dân". Thực hiện thủ tục trực tuyến giúp triệt tiêu nhũng nhiễu vặt, giảm chi phí và thời gian cho dân, lấy sự tiện lợi của nhân dân làm thước đo phục vụ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PHẦN 3: GIÁ TRỊ VẬN DỤNG & GIẢI PHÁP QUẢN TRỊ HIỆN ĐẠI */}
      <section id="phan-3" className="py-24 px-6 md:px-16 lg:px-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#C5A028] tracking-[0.15em] uppercase font-semibold text-sm mb-3">Phần 3</p>
          <h2 className="text-4xl md:text-5xl font-light text-[#3D3529] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Giải Pháp Vận Hành Quản Trị Hiện Đại
          </h2>
          <div className="w-24 h-1 bg-[#C5A028] mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white rounded-3xl shadow-sm border border-[#EDE8E1] hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A028] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <h3 className="text-5xl text-[#EDE8E1] font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>01</h3>
            <h4 className="text-2xl text-[#3D3529] mb-4 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Thể chế hóa "Dân chủ số"</h4>
            <p className="text-[#7A6040] leading-relaxed">
              Bắt buộc công khai, minh bạch quy trình giải trình phản ánh của dân trên môi trường số; tạo hành lang pháp lý cho dân chủ trực tuyến.
            </p>
          </div>
          
          <div className="p-8 bg-white rounded-3xl shadow-sm border border-[#EDE8E1] hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#3D3529] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <h3 className="text-5xl text-[#EDE8E1] font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>02</h3>
            <h4 className="text-2xl text-[#3D3529] mb-4 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Chuẩn hóa cán bộ "Công bộc số"</h4>
            <p className="text-[#7A6040] leading-relaxed">
              Nâng cao đạo đức công vụ số, kỹ năng tương tác văn minh và tinh thần lắng nghe, phục vụ nhân dân trên không gian mạng.
            </p>
          </div>
          
          <div className="p-8 bg-white rounded-3xl shadow-sm border border-[#EDE8E1] hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#C5A028] transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <h3 className="text-5xl text-[#EDE8E1] font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>03</h3>
            <h4 className="text-2xl text-[#3D3529] mb-4 font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>Nâng cao "Năng lực làm chủ số" cho Dân</h4>
            <p className="text-[#7A6040] leading-relaxed">
              Phổ cập kỹ năng số, văn hóa mạng để người dân nhận diện tin giả, thực hành quyền dân chủ một cách đúng đắn, trách nhiệm.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
