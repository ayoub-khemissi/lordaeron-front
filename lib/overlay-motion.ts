import type { HTMLMotionProps } from "framer-motion";

/*
 * The site's menus and panels open with a short fade (Ayoub, 09/10/2026: they "glitched"). HeroUI's default is a spring zoom that
 * overshoots its size and reflows the text while it settles; with the page scroll lock, the page also jumped by the scrollbar's width.
 * Use with `shouldBlockScroll={false}` (Select: in popoverProps).
 */
export const OVERLAY_MOTION: HTMLMotionProps<"div"> = {
  variants: {
    enter: { opacity: 1, transition: { duration: 0.12, ease: "easeOut" } },
    exit: { opacity: 0, transition: { duration: 0.08, ease: "easeIn" } },
  },
};

export const OVERLAY_POPOVER = {
  motionProps: OVERLAY_MOTION,
  shouldBlockScroll: false,
};
