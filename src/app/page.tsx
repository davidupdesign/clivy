"use client";

import { useState, useEffect, useRef } from "react";
import { Infinity } from 'lucide-react';

// ─── animated counter hook ───
function useCountUp(target, duration = 1800, trigger = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(id);
  }, [trigger, target, duration]);
  return count;
}

// ─── intersection observer hook for scroll reveals ───
function useInView(opts = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.15, ...opts },
    );
    ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return [ref, inView];
}

// ─── feature card ───
function FeatureCard({ icon, title, desc, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `all 0.5s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-7 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors duration-300"
    >
      <div className="mb-4 w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        {desc}
      </p>
    </div>
  );
}

// ─── step component ───
function Step({ number, title, desc, delay }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.5s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
      className="text-center"
    >
      <div className="mx-auto mb-5 w-14 h-14 rounded-full border-2 border-zinc-900 dark:border-zinc-100 flex items-center justify-center text-xl font-bold text-zinc-900 dark:text-zinc-100">
        {number}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
        {desc}
      </p>
    </div>
  );
}

// ─── main page ───
export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsRef, statsInView] = useInView();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const c1 = useCountUp(500, 1600, statsInView);
  const c2 = useCountUp(12, 1200, statsInView);
  const c3 = useCountUp(99, 1400, statsInView);

  return (
    <div
      className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-x-hidden"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-100 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">Clivy</span>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-4 py-2"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0s",
            }}
          >
            <div className="inline-flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 rounded-full px-4 py-1.5 mb-8 text-sm text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Open source changelog platform
            </div>
          </div>
          <h1
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.1s",
            }}
            className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
          >
            Keep your users
            <br />
            <span className="bg-gradient-to-r from-zinc-900 via-zinc-600 to-zinc-400 dark:from-zinc-100 dark:via-zinc-400 dark:to-zinc-600 bg-clip-text text-transparent">
              in the loop</span>
          </h1>
          <p
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.2s",
            }}
            className="text-lg sm:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Beautiful changelogs your users will actually read. Write in
            markdown, tag your updates, publish instantly — all from a clean
            dashboard.
          </p>
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(.22,1,.36,1) 0.3s",
            }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-base font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Start for free
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12l5-5-5-5" />
              </svg>
            </a>
            <a
              href="/changelog/clivy"
              target="_blank"
              className="inline-flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-base font-medium px-8 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              View live demo
            </a>
          </div>
        </div>
      </section>

      {/* ─── PRODUCT MOCKUP ─── */}
      <section className="px-6 pb-28">
        <div
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(40px)",
            transition: "all 1s cubic-bezier(.22,1,.36,1) 0.5s",
          }}
          className="max-w-5xl mx-auto"
        >
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-zinc-900/50">
            {/* browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </div>
              <div className="flex-1 mx-4 h-7 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center px-3">
                <span className="text-xs text-zinc-400">
                  yourapp.clivy.co/changelog
                </span>
              </div>
            </div>
            {/* Content mock */}
            <div className="p-8 sm:p-12">
              <div className="flex gap-8">
                {/* Sidebar mock */}
                <div className="hidden sm:block w-48 shrink-0 space-y-3">
                  <div className="h-6 w-20 bg-zinc-900 dark:bg-zinc-100 rounded-md" />
                  <div className="mt-6 space-y-2">
                    <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full" />
                    <div className="h-9 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg w-full" />
                  </div>
                </div>
                {/* Main content mock */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-8 w-32 bg-zinc-900 dark:bg-zinc-100 rounded-lg" />
                    <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                    <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                            i === 0
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : i === 1
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {i === 0 ? "NEW" : i === 1 ? "IMPROVEMENT" : "FIX"}
                        </span>
                        <span className="text-xs text-zinc-400 font-medium">
                          v2.{3 - i}.0
                        </span>
                      </div>
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                      <div className="h-3 bg-zinc-100 dark:bg-zinc-800/50 rounded w-full" />
                      <div className="h-3 bg-zinc-100 dark:bg-zinc-800/50 rounded w-5/6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Three steps. That's it.
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              From zero to a live changelog in under two minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Step
              number="1"
              title="Create a project"
              desc="Name it, pick a slug. Your public changelog URL is ready instantly."
              delay={0}
            />
            <Step
              number="2"
              title="Write an entry"
              desc="Markdown editor with live preview. Add tags, versions, and header images."
              delay={0.1}
            />
            <Step
              number="3"
              title="Publish"
              desc="One click. Your users see a beautiful, timeline-based changelog page."
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">
              No bloat. Just the tools that matter for shipping updates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              delay={0}
              icon={
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V5l-3-3z" />
                  <path d="M13 2v3h3M8 10h4M8 14h2" />
                </svg>
              }
              title="Markdown Editor"
              desc="Write rich changelogs with a split-pane editor and instant preview. Code blocks, images, lists — all supported."
            />
            <FeatureCard
              delay={0.05}
              icon={
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6v4l2.5 2.5" />
                </svg>
              }
              title="Timeline View"
              desc="Public changelog page with a Vercel-inspired timeline layout. Date separators, sticky headers, smooth scrolling."
            />
            <FeatureCard
              delay={0.1}
              icon={
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h12v12H4z" />
                  <path d="M4 9h12M9 4v12" />
                </svg>
              }
              title="Color-coded Tags"
              desc="Categorize entries as New, Fix, Improvement, or anything custom. Each tag gets its own color."
            />
            <FeatureCard
              delay={0.15}
              icon={
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 2l-4 4-4-4-4 4" />
                  <path d="M4 6v8a2 2 0 002 2h8a2 2 0 002-2V6" />
                </svg>
              }
              title="Email Notifications"
              desc="Subscribers get notified automatically when you publish. Powered by Resend with clean, branded emails."
            />
            <FeatureCard
              delay={0.2}
              icon={
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20V10M18 20V4M6 20v-4" />
                </svg>
              }
              title="Analytics"
              desc="Track page views per entry, total subscribers, and top-performing updates — right in your dashboard."
            />
            <FeatureCard
              delay={0.25}
              icon={
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 3l14 7-14 7V3z" />
                </svg>
              }
              title="Scheduled Publishing"
              desc="Write now, publish later. Set a date and time — Clivy handles the rest with automated cron jobs."
            />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section
        ref={statsRef}
        className="py-20 px-6 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            { val: c1 + "+", label: "Changelog entries published" },
            { val: c2 + "+", label: "Features shipped" },
            { val: c3 + ".9%", label: "Uptime" },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
                {s.val}
              </div>
              <div className="text-sm text-zinc-400 dark:text-zinc-500 font-medium">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ALSO INCLUDES ─── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-14">
            Also included
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-8">
            {[
              [
                "RSS Feed",
                "Let users subscribe via their favorite RSS reader.",
              ],
              [
                "Reactions",
                "Heart, downvote, and question reactions per entry.",
              ],
              [
                "Header Images",
                "Upload or paste a URL. Auto-cropped to 5:2 ratio.",
              ],
              [
                "Version Tracking",
                "Semantic versioning with previous version hints.",
              ],
              [
                "Subscriber Management",
                "View, filter, and remove subscribers per project.",
              ],
              [
                "Scheduled Cron Jobs",
                "Vercel cron publishes scheduled entries automatically.",
              ],
            ].map(([t, d], i) => {
              const [ref, inView] = useInView();
              return (
                <div
                  key={i}
                  ref={ref}
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateX(0)" : "translateX(-12px)",
                    transition: `all 0.4s ease ${i * 0.05}s`,
                  }}
                  className="flex gap-4 items-start"
                >
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5">
                      {t}
                    </h4>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {d}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ─── */}
      <section className="py-16 px-6 border-t border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-6">
            Built with
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {[
              "Next.js 16",
              "TypeScript",
              "Prisma 7",
              "PostgreSQL",
              "NextAuth",
              "Tailwind CSS",
              "shadcn/ui",
              "Vercel",
            ].map((t) => (
              <span
                key={t}
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-default"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6">
            Ship updates your users
            <br />
            will actually see.
          </h2>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-10 max-w-xl mx-auto">
            Stop burying release notes in docs nobody reads. Give your product a
            changelog that looks as good as the work you ship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="inline-flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-base font-semibold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Get started — it's free
            </a>
            <a
              href="https://github.com/davidupdesign/clivy"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-base font-medium px-8 py-3.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.42.36.81 1.1.81 2.22v3.29c0 .32.19.69.8.58A12 12 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-zinc-100 dark:border-zinc-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-zinc-400">Built by David K.</span>
          <div className="flex gap-6 text-sm text-zinc-400">
            <a
              href="https://github.com/davidupdesign/clivy"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              GitHub
            </a>
            <a
              href="/login"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
