"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function BottomNav({ isModalOpen = false }) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(null);
  const backgroundRef = useRef(null);
  const containerRef = useRef(null);

  const navItems = [
    {
      icon: <i className="fa-solid fa-cart-shopping" />,
      label: "المتجر",
      href: "/store",
    },
    { icon: <span>Aa</span>, label: "المواد", href: "/subject" },
    {
      icon: <i className="fa-solid fa-house" />,
      label: "الرئيسية",
      href: "/main",
    },
    {
      icon: <i className="fa-solid fa-th" />,
      label: "الدورات",
      href: "/course",
    },
    {
      icon: <i className="fa-solid fa-ellipsis" />,
      label: "المزيد",
      href: "/more",
    },
  ];

  const moveBackground = (target, bounce = true) => {
    if (!backgroundRef.current || !containerRef.current || !target) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const left =
      targetRect.left - containerRect.left + targetRect.width / 2 - 20;
    const top = targetRect.top - containerRect.top + targetRect.height / 2 - 20;

    if (bounce) {
      backgroundRef.current.style.transition = "none";
      backgroundRef.current.style.transform = `translate(${left}px, ${
        top + 60
      }px)`;
      setTimeout(() => {
        backgroundRef.current.style.transition =
          "transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)";
        backgroundRef.current.style.transform = `translate(${left}px, ${top}px)`;
      }, 50);
    } else {
      backgroundRef.current.style.transition = "transform 0.3s ease";
      backgroundRef.current.style.transform = `translate(${left}px, ${top}px)`;
    }
  };

  const handleMouseEnter = (e, index) => {
    if (isModalOpen) return;
    setActiveIndex(index);
    moveBackground(e.currentTarget.querySelector(".icon-wrapper"));
  };

  const handleMouseLeave = () => {
    if (isModalOpen) return;
    setActiveIndex(null);
  };

  useEffect(() => {
    const index = navItems.findIndex((item) => pathname.startsWith(item.href));
    setActiveIndex(index);
    setTimeout(() => {
      const icons = document.querySelectorAll(".icon-wrapper");
      if (icons[index]) moveBackground(icons[index], true);
    }, 200);
  }, [pathname]);

  const shouldHide =
    pathname.includes("/login") ||
    pathname.includes("/rejester") ||
    pathname.includes("/more-info") ||
    pathname.includes("/more/profile") ||
    pathname.includes("/more/notification") ||
    pathname.includes("/more/result") ||
    pathname.includes("/more/contact") ||
    pathname.includes("/more/wallet") ||
    pathname.includes("/more/order") ||
    pathname.includes("/subject/Teacher") ||
    pathname.includes("/subject/subject2") ||
    pathname.includes("/subject/Math") ||
    pathname.includes("/cart") ||
    pathname.includes("/basic") ||
    pathname.includes("/") ||
    pathname.startsWith("/subject/");

  if (shouldHide) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed bottom-0 left-0 right-0 z-50 py-2 px-4 sm:px-10 shadow-md transition-all duration-300 ${
        isModalOpen ? "bg-[rgba(0,0,0,0.4)] pointer-events-none" : "bg-white"
      }`}
    >
      <div
        ref={backgroundRef}
        className="w-10 h-10 rounded-full bg-[#bf9916] absolute pointer-events-none"
        style={{
          top: 0,
          left: 0,
          transform: "translate(0px, 100px)",
          zIndex: 0,
        }}
      ></div>

      <div
        className="flex justify-between flex-row-reverse sm:justify-center sm:gap-14 gap-4 items-center text-sm sm:text-base"
        onMouseLeave={handleMouseLeave}
      >
        {navItems.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center cursor-pointer"
            onMouseEnter={(e) => handleMouseEnter(e, index)}
          >
            <Link
              href={item.href}
              className="flex flex-col items-center justify-center"
            >
              <div
                className={`icon-wrapper text-lg sm:text-2xl w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  activeIndex === index
                    ? "text-white translate-y-[-5px]"
                    : "text-gray-500"
                }`}
                style={{ zIndex: activeIndex === index ? 10 : 1 }}
              >
                {item.icon}
              </div>
              <span className="text-[10px] sm:text-sm mt-1 font-medium">
                {item.label}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BottomNav;
