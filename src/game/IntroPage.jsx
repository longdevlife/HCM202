import React from "react";
import Hero from "./sections/Hero";
import Summary from "./sections/Summary";
import useGsapAnimations from "../hooks/useGsapAnimations";

export function IntroPage() {
  useGsapAnimations();

  return (
    <div className="w-full relative bg-[#EDE8E1]">
      <Hero />
      <Summary />
    </div>
  );
}
