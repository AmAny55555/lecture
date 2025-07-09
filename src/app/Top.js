"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaBars, FaStarAndCrescent, FaMagnifyingGlass } from "react-icons/fa6";

function Top() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(progress);
      setShowHeader(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <div
        className="absolute left-0 h-[3px] bg-[#854d0e] z-50 transition-all duration-200"
        style={{
          width: `${scrollProgress}%`,
          bottom: "-3px",
        }}
      ></div>

      <div className="flex md:hidden bg-white border-b-[#fde047] border-b-4 px-[5%] py-[2%] items-center justify-between shadow-md">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl text-[#444]"
            aria-label="Toggle menu"
          >
            <FaBars />
          </button>

          {menuOpen && (
            <div
              className="fixed top-[56px] left-0 right-0 bg-[#f7df5e] shadow-lg p-4 z-50 flex flex-col gap-4"
              style={{ maxWidth: "100vw" }}
            >
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <button className="w-full bg-[#854d0e] text-white py-3 rounded-2xl text-lg font-semibold hover:opacity-90 transition">
                  تسجيل الدخول
                </button>
              </Link>
              <Link href="/rejester" onClick={() => setMenuOpen(false)}>
                <button className="w-full bg-[#854d0e] text-white py-3 rounded-2xl text-lg font-semibold hover:opacity-90 transition">
                  ! انشئ حسابك الآن
                </button>
              </Link>
            </div>
          )}
        </div>

        <button className="bg-[#fde047] w-20 h-8 rounded-2xl px-1 flex items-center justify-between">
          <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center">
            <i className="fa-regular fa-sun text-[#facc15] text-sm"></i>
          </div>
          <FaStarAndCrescent className="text-[#fef9c3] text-sm mr-2" />
        </button>
      </div>

      <div
        className={`hidden md:flex fixed top-0 left-0 w-full bg-white border-b-[#fde047] border-b-4 px-[5%] py-[1%] items-center justify-between transition-all duration-500 ease-in-out transform ${
          showHeader
            ? "translate-y-0 opacity-100 shadow-md"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-5">
          <Image
            src="/slide.jpg"
            width={120}
            height={120}
            alt="teacher"
            className="w-[60px] h-[60px] rounded-full object-fill"
          />
          <button className="bg-[#fde047] w-20 h-8 rounded-2xl px-1 flex items-center justify-between">
            <div className="bg-white w-6 h-6 rounded-full flex items-center justify-center">
              <i className="fa-regular fa-sun text-[#facc15] text-sm"></i>
            </div>
            <FaStarAndCrescent className="text-[#fef9c3] text-sm mr-2" />
          </button>
        </div>

        <div className="flex gap-5 items-center">
          <Link href="/login">
            <button className="bg-white w-[190px] shadow-lg px-4 py-2 rounded-md text-lg">
              تسجيل <span className="text-[#f4d157]">الدخول</span>
            </button>
          </Link>

          <Link href="/rejester">
            <button className="bg-[#9e9898] text-white hover:bg-white hover:text-[#9e9898] hover:border-[#9e9898] border border-transparent w-[190px] py-2 rounded-md flex gap-2 items-center justify-center transition-all duration-300 font-semibold">
              ! انشىء حسابك الان
              <FaMagnifyingGlass />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Top;
