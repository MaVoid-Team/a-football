"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { animate, createScope, stagger } from "animejs";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const root = useRef<HTMLElement>(null);
  const scope = useRef<ReturnType<typeof createScope> | null>(null);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";

  useEffect(() => {
    scope.current = createScope({ root }).add(() => {
      // Logo fade in first
      animate(".hero-logo", {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        delay: 50,
        easing: "easeOutExpo",
      });

      // Chars split animation for headline
      animate(".hero-char", {
        opacity: [0, 1],
        translateY: ["110%", "0%"],
        rotateZ: [8, 0],
        duration: 900,
        delay: stagger(28, { start: 200 }),
        easing: "easeOutExpo",
      });

      // Subtitle fade up
      animate(".hero-sub", {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 900,
        delay: 600,
        easing: "easeOutExpo",
      });

      // CTA buttons stagger
      animate(".hero-btn", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(120, { start: 800 }),
        duration: 700,
        easing: "easeOutExpo",
      });

      // Ambient orbs
      animate(".hero-orb", {
        scale: [0.85, 1],
        opacity: [0, 1],
        duration: 1400,
        delay: stagger(300),
        easing: "easeOutExpo",
      });

      // Loop pulse for orbs
      animate(".hero-orb-pulse", {
        scale: [1, 1.12, 1],
        duration: 5000,
        loop: true,
        easing: "easeInOutSine",
        delay: stagger(800),
      });

      // Scroll indicator
      animate(".scroll-cue", {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 600,
        delay: 1100,
        easing: "easeOutExpo",
      });
    });

    return () => scope.current?.revert();
  }, []);

  const headline = t("headline1");
  const headline2 = t("headline2");

  const splitWords = (text: string) =>
    text.split(" ").map((word, i, arr) => (
      <span key={i} className="inline-block overflow-hidden">
        <span
          className="hero-char inline-block opacity-0"
          style={{ willChange: "transform, opacity" }}
        >
          {word}
        </span>
        {i < arr.length - 1 && "\u00A0"}
      </span>
    ));

  return (
    <section
      ref={root}
      id="hero"
      className="relative min-h-[100dvh] w-full flex flex-col justify-center pb-24 px-8 md:px-16 lg:px-24 overflow-hidden pt-32"
    >
      {/* Ambient glow orbs */}
      <div className="hero-orb hero-orb-pulse absolute top-[-20%] right-[-5%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full bg-primary/5 blur-[140px] pointer-events-none opacity-0" />
      <div className="hero-orb hero-orb-pulse absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-primary/3 blur-[120px] pointer-events-none opacity-0" />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "6rem 6rem",
        }}
      />

      <div className="relative z-10 max-w-5xl">
        {/* Logo branding */}
        <div className="hero-logo opacity-0 mb-10 flex items-center gap-4">
          <img
            src={currentTheme === "dark" ? "/logo-light.png" : "/logo-dark.png"}
            alt="A Football Logo"
            className="w-auto h-20 object-contain"
          />
        </div>

        <h1 className="text-[clamp(3.5rem,10vw,9rem)] font-black tracking-[-0.04em] leading-[0.92] text-foreground overflow-hidden">
          <div className="overflow-hidden flex flex-wrap">
            {splitWords(headline)}
          </div>
          <div className="overflow-hidden">
            <span className="hero-char hero-headline inline-block opacity-0 italic text-primary-text">
              {headline2}
            </span>
          </div>
        </h1>

        <p className="hero-sub opacity-0 mt-10 max-w-xl text-lg sm:text-xl text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button
            asChild
            size="lg"
            className="hero-btn opacity-0 group font-semibold h-14 px-8 rounded-xl transition-all duration-200 hover:gap-4 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/book" className="flex items-center gap-3">
              {t("bookACourt")}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="hero-btn opacity-0 border-border/80 font-semibold h-14 px-8 rounded-xl transition-all duration-200 hover:bg-muted/60 hover:border-foreground/20 active:scale-[0.98]"
          >
            <Link href="/event" className="flex items-center">
              {t("browseEvents")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="scroll-cue opacity-0 absolute bottom-12 start-8 md:start-16 lg:start-24 flex items-center gap-3 text-muted-foreground/50">
        <span className="text-[11px] tracking-[0.25em] uppercase font-medium">
          {t("scrollToExplore")}
        </span>
        <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
      </div>
    </section>
  );
}
