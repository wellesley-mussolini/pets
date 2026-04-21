"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex justify-center items-center flex-col">
      <Link href="/breeds" className="text-2xl font-bold">Breeds</Link>
    </div>
  );
}
