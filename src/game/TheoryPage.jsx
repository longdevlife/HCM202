import Hero from './sections/Hero';
import BoiCanhKhungHoang from './sections/BoiCanhKhungHoang';
import XeRaoThucTien from './sections/XeRaoThucTien';
import DotPhaTheChe from './sections/DotPhaTheChe';
import CoCheHocHoi from './sections/CoCheHocHoi';
import DiSanQuanTri from './sections/DiSanQuanTri';
import useGsapAnimations from '../hooks/useGsapAnimations';
import useScrollReveal from '../hooks/useScrollReveal';

export const TheoryPage = () => {
  // GSAP scroll trigger animation hook for smooth editorial reading
  useGsapAnimations();
  useScrollReveal();

  return (
    <div
      className="theory-page-container bg-[#EDE8E1]"
      style={{
        width: '100%',
        minHeight: '100vh',
        scrollBehavior: 'smooth',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      <style>{`.theory-page-container::-webkit-scrollbar { display: none; }`}</style>

      {/* Hero Header */}
      <Hero />

      {/* Phần 1: Bối cảnh lịch sử & Khủng hoảng hệ thống 1975-1979 */}
      <BoiCanhKhungHoang />

      {/* Phần 2: Hồ sơ các cuộc Xé Rào thực tiễn */}
      <XeRaoThucTien />

      {/* Phần 3: Ba Cột Mốc Văn Kiện & Đột Phá Thể Chế 1979-1981 */}
      <DotPhaTheChe />

      {/* Phần 4: Cơ Chế Học Hỏi Chính Sách Từ Dưới Lên */}
      <CoCheHocHoi />

      {/* Phần 5: Di Sản Đến Đại Hội VI & 3 Bài Học Quản Trị */}
      <DiSanQuanTri />
    </div>
  );
};

export default TheoryPage;
