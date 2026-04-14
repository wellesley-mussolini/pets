"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { BoneIcon } from "@/svgs/bone.svg";
import Link from "next/link";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const toggleTheme = useCallback(() => {
    document.documentElement.classList.add("transitioning");
    setTheme(theme === "dark" ? "light" : "dark");
    setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 350);
  }, [theme, setTheme]);

  return (
    <header
      className="
      sticky 
      top-0 
      z-50 
      flex 
      justify-between 
      items-center 
      px-6 
      py-4 
      dark:bg-gray-950 
      bg-background 
      shadow-[0_1px_3px_0_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] 
      dark:shadow-none 
      ">
      <Link href="/">
        <BoneIcon
          className="w-8 hover:scale-120 transition-all duration-300 cursor-pointer"
        />
      </Link>

      <div className="flex items-center justify-end flex-row gap-2 w-52">
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
          onClick={toggleTheme}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="w-18 rounded-md cursor-pointer"
          onClick={signOut}
        >
          SAIR
        </Button>
      </div>
    </header>
  );
};
