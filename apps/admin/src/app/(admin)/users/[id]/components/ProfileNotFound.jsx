"use client";

import React from "react";
import { Button } from "@/components/ui";

export default function ProfileNotFound({ router }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-6 p-6 transition-colors duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black font-outfit uppercase text-zinc-900 dark:text-white">
          User Not Found
        </h2>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
          The requested personnel profile could not be located in the database.
        </p>
      </div>
      <Button
        onClick={() => router.push("/users")}
        className="px-8 h-12 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full font-black uppercase text-xs tracking-widest shadow-md cursor-pointer"
      >
        Return to User Directory
      </Button>
    </div>
  );
}
