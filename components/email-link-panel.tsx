"use client";

import type { ReactNode } from "react";

import { motion } from "framer-motion";

// the frame of the pages an e-mail link opens (confirm-email, unsubscribe): a Northrend backdrop and one glass card
export function EmailLinkPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      className="relative min-h-[calc(100vh-64px)] bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "url('/img/Wrath of the Lich King Classic Cinematic Stills/Wrath_of_the_Lich_King_Classic_Cinematic_Still__(4).jpg')",
      }}
    >
      <div className="absolute inset-0 bg-wow-darker/90" />
      <div className="relative container mx-auto flex max-w-7xl items-center justify-center px-6 py-16">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="glass glow-gold w-full max-w-md rounded-2xl p-8 text-center"
          initial={{ opacity: 0, y: 16 }}
        >
          <img
            alt=""
            className="mx-auto mb-4 h-14 w-14"
            src="/img/email/logo-144.png"
          />
          <h1 className="mb-5 font-heading text-2xl wow-gradient-text">
            {title}
          </h1>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
