"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SwipeableContainerProps {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
  showProgressBar?: boolean;
}

export default function SwipeableContainer({
  children,
  className = "",
  showArrows = true,
  showProgressBar = true,
}: SwipeableContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Mouse drag state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const overflowing = maxScroll > 10;
    setIsOverflowing(overflowing);

    if (overflowing) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < maxScroll - 5);
      const progress = Math.min(1, Math.max(0, el.scrollLeft / maxScroll));
      setScrollProgress(progress);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => updateScrollState();
    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    // Initial check after images load
    const timer = setTimeout(updateScrollState, 300);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
      clearTimeout(timer);
    };
  }, [updateScrollState]);

  // Mouse Drag to Scroll handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary mouse button
    const el = containerRef.current;
    if (!el) return;
    isDragging.current = true;
    hasMoved.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const distance = Math.abs(x - startX.current);
    if (distance > 12) {
      hasMoved.current = true;
      e.preventDefault();
      const walk = (x - startX.current) * 1.4;
      el.scrollLeft = scrollLeftStart.current - walk;
    }
  };

  const onMouseUpOrLeave = () => {
    isDragging.current = false;
    const el = containerRef.current;
    if (el) {
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
    }
    // Reset hasMoved after a short tick so click handler gets clean state
    setTimeout(() => {
      hasMoved.current = false;
    }, 50);
  };

  // Prevent accidental link/button click if user was dragging
  const onClickCapture = (e: React.MouseEvent) => {
    if (hasMoved.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMoved.current = false;
    }
  };

  const scrollByAmount = (amount: number) => {
    const el = containerRef.current;
    if (el) {
      el.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full group/swipe select-none">
      {/* Left scroll arrow button */}
      {showArrows && isOverflowing && canScrollLeft && (
        <button
          onClick={() => scrollByAmount(-280)}
          aria-label="Scroll Left"
          className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-gray-200 shadow-lg items-center justify-center text-gray-700 hover:text-[#ff5500] hover:scale-108 transition backdrop-blur-sm"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Main scrollable container */}
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        onClickCapture={onClickCapture}
        style={{
          cursor: isOverflowing ? "grab" : "default",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className={`flex items-center gap-4 overflow-x-auto touch-pan-x scroll-smooth no-scrollbar active:cursor-grabbing ${className}`}
      >
        {children}
      </div>

      {/* Right scroll arrow button */}
      {showArrows && isOverflowing && canScrollRight && (
        <button
          onClick={() => scrollByAmount(280)}
          aria-label="Scroll Right"
          className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/95 border border-gray-200 shadow-lg items-center justify-center text-gray-700 hover:text-[#ff5500] hover:scale-108 transition backdrop-blur-sm"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Dynamic Progress Indicator Bar (matches user screenshot style) */}
      {showProgressBar && isOverflowing && (
        <div className="w-full max-w-md mx-auto mt-4 px-2">
          <div className="h-1.5 w-full bg-gray-200/80 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#ff5500] to-amber-500 rounded-full transition-all duration-150"
              style={{
                width: "40%",
                transform: `translateX(${scrollProgress * 150}%)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
