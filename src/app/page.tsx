"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import ComingSoon from "@/components/ComingSoon";
import Footer from "@/components/Footer";
import AskMeModal from "@/components/AskMeModal";

export default function Home() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [askMeOpen, setAskMeOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".fade-up");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header
        onMenuClick={() => setMobileNavOpen(true)}
        onAskMeClick={() => setAskMeOpen(true)}
      />
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onAskMeClick={() => {
          setMobileNavOpen(false);
          setAskMeOpen(true);
        }}
      />
      <AskMeModal isOpen={askMeOpen} onClose={() => setAskMeOpen(false)} />

      <main>
        <Hero />
        <Features />
        <Pricing />
        <ComingSoon />
      </main>

      <Footer />
    </>
  );
}
