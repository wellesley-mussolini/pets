/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      keyframes: {
        "notfound-tail": {
          "0%, 100%": { transform: "rotate(-15deg)" },
          "50%": { transform: "rotate(20deg)" },
        },
        "notfound-body": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
        "notfound-head": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(4deg)" },
          "75%": { transform: "rotate(-3deg)" },
        },
        "notfound-ears": {
          "0%, 70%, 100%": { transform: "rotate(0deg)" },
          "80%": { transform: "rotate(-6deg)" },
          "90%": { transform: "rotate(3deg)" },
        },
        "notfound-blink": {
          "0%, 42%, 46%, 100%": { scaleY: "1" },
          "44%": { scaleY: "0.1" },
        },
      },
      animation: {
        "notfound-tail": "notfound-tail 800ms ease-in-out infinite",
        "notfound-body": "notfound-body 3s ease-in-out infinite",
        "notfound-head": "notfound-head 4s ease-in-out infinite",
        "notfound-ears": "notfound-ears 3.5s ease-in-out infinite",
        "notfound-blink": "notfound-blink 4s ease-in-out infinite",
      },
    },
  },
};
