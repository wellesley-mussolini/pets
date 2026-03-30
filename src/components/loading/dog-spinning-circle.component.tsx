"use client";

import { useState, useEffect, useRef } from "react";

export const DogSpinningCircle = () => {
  const [eyelidD, setEyelidD] = useState(
    "M85.88 68.878l24.722-16.19 1.802 2.754-24.72 16.19z"
  );
  const [earTwitching, setEarTwitching] = useState(false);
  const rightEarRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let cancelled = false;

    const blink = () => {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        setEyelidD(
          "M85.89 68.876l24.72-16.19 17.96 27.423-24.72 16.188z"
        );
        setTimeout(() => {
          if (cancelled) return;
          setEyelidD(
            "M85.88 68.878l24.722-16.19 1.802 2.754-24.72 16.19z"
          );
          setTimeout(blink, 180);
        }, 180);
      }, 3000);
    };

    const twitchRightStart = () => {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        setEarTwitching(true);
        setTimeout(() => {
          if (cancelled) return;
          setTimeout(() => {
            if (cancelled) return;
            setEarTwitching(false);
            if (rightEarRef.current) {
              rightEarRef.current.setAttribute(
                "transform",
                "rotate(0 66 93)"
              );
            }
            setTimeout(twitchRightStart, 300);
          }, 50);
        }, 120);
      }, 2500);
    };

    blink();
    twitchRightStart();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex items-center justify-center z-20 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="relative h-[200px] w-[200px] [&>svg]:absolute">
        {/* Spinner */}
        <svg
          className="animate-spinner-rotate"
          stroke="#000"
          width="200"
          height="200"
          viewBox="0 0 206 206"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id="cut-off-bottom">
              <rect x="0" y="0" width="200" height="100" fill="#000" />
            </clipPath>
          </defs>
          <circle
            className="animate-spinner-dash origin-center [stroke-dasharray:622] [stroke-dashoffset:0] stroke-[#FCB316]"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            cx="103"
            cy="103"
            r="100"
          />
        </svg>

        {/* Dog */}
        <svg
          className="absolute left-[10px] bottom-[10px] w-[186px] h-auto"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 207.95 211.52"
        >
          <title>Loading...</title>
          <circle cx="100" cy="111.52" r="100" fill="url(#a)" />
          <path
            d="M125 199.08l-13.84-24.34 8.9-26.69-17 .91-39.27-30.15c-10.45 17.2-25.15 37.07-39.33 58.23a100.13 100.13 0 0 0 95.17 32.54l-6.13-16.86z"
            fill="#010101"
          />
          <path
            d="M197.73 71.64l10.22 6.71-31-58.29a10.75 10.75 0 0 0 4.47-13.3A10.82 10.82 0 0 0 161 13.83l-66.44 43L94 40.87l-6 14.8-7-18.53 1.22 19.66-11.85-11 7.39 21.82-23.52 15.24 8.46 31 .39.17c-3.7 16.38-7.16 32.53-7.16 36.58l44.78 26.27 21.53-35.81 18.49 18.66-7.24-18.76 14.22 14.64-9-21.29 19.62 13.81-14.6-18.31 18.92 14.2-12.43-18.92L165 138.47l-10.53-20.57 16.45 14.16-6.58-16.85 16.1 10.77-10-17.71 14.48 9-11.14-16.62 15.31 10.87-12.31-16.73 17.74 13.34-12.23-18 15.05 11.14-9.77-18.75 14.86 13.12-9-18.41 13.27 12.59z"
            fill="#010101"
            fillRule="evenodd"
          />
          {/* Left ear */}
          <path
            d="M88.42 75.73C77.16 62.28 62.48 44.71 45 45.62c-1.61 15.74 8.82 41.9 24.73 48.73a44.07 44.07 0 0 1 18.69-18.62z"
            fill="#010101"
            fillRule="evenodd"
          />
          {/* Eye highlight */}
          <path
            d="M167.92 2.39A10.16 10.16 0 0 0 164 5.52a15 15 0 0 1 1.94-1A11.63 11.63 0 0 1 180 9.01a11.06 11.06 0 0 0-.47-1.72 9 9 0 0 0-11.61-4.9zM114.25 64.09a11.82 11.82 0 1 0 5.75 15.6 11.65 11.65 0 0 0-5.75-15.6zm5.38 10.61a6.46 6.46 0 0 1-8.57 3.13 6.35 6.35 0 0 1-3.06-8.49 6.46 6.46 0 0 1 8.57-3.13 6.35 6.35 0 0 1 3.06 8.49z"
            fill="#fff"
            fillRule="evenodd"
          />
          {/* Right ear */}
          <path
            className={`transition-transform duration-200 ease-in-out origin-[66px_93px] ${
              earTwitching ? "rotate-15" : "rotate-0"
            }`}
            ref={rightEarRef}
            d="M69.42 78.07c-15.3-4.38-38.75-1.12-49.71 17.38 11.82 10.64 39.18 17.46 54 8.63a43.93 43.93 0 0 1-4.29-26.01z"
            fill="#010101"
            fillRule="evenodd"
          />
          {/* Collar */}
          <path
            fill="#8cbd44"
            fillRule="evenodd"
            d="M123.36 143.82l-66.62-22.91-5.14 16.33 68.33 24.02 3.43-17.44"
          />
          {/* Eyelid */}
          <path
            className="transition-all duration-200 ease-in-out"
            fill="#010101"
            d={eyelidD}
          />
        </svg>
      </div>
    </div>
  );
};
