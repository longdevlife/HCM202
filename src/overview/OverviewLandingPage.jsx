import { useRef } from "react";

export const OverviewLandingPage = () => {
  const iframeRef = useRef(null);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#201c18",
      }}
    >
      <iframe
        ref={iframeRef}
        src="/landing-pages/meng-to-sketchbook.html"
        title="Meng To Sketchbook Landing Page"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
      />
    </div>
  );
};

export default OverviewLandingPage;
