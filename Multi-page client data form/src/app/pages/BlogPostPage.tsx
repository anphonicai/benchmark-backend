import { useEffect, useRef } from "react";
import { Link, useParams, Navigate } from "react-router";
import Logo from "../components/Logo";
import { blogPosts } from "../utils/blogData";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resizeLenis } from "../utils/lenisInstance";

gsap.registerPlugin(ScrollTrigger);

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | Anphonic`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", post.metaDescription);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
      gsap.fromTo(
        heroRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.2 }
      );
      if (bodyRef.current) {
        const items = bodyRef.current.querySelectorAll(".fade-in");
        gsap.fromTo(
          items,
          { y: 20, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: bodyRef.current, start: "top 85%" },
          }
        );
      }
    });

    setTimeout(resizeLenis, 100);
    return () => ctx.revert();
  }, [post]);

  if (!post) return <Navigate to="/blogs" replace />;

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <header
        ref={headerRef}
        className="flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm"
      >
        <Logo />
        <Link
          to="/blogs"
          className="text-xs text-[#9CA3AF] hover:text-[#14b8a6] transition-colors font-medium tracking-wider"
        >
          ← All articles
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        {/* Hero */}
        <div ref={heroRef} className="mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
            <span className="text-xs text-[#14b8a6] font-semibold tracking-[0.16em] uppercase">
              {post.tag}
            </span>
            <span className="text-xs text-[#9CA3AF]">· {post.date}</span>
          </div>
          <h1
            className="text-3xl md:text-5xl text-[#0a1f3d] mb-6 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {post.title}
          </h1>
        </div>

        {/* Body */}
        <div ref={bodyRef} className="space-y-10">
          {post.sections.map((section, i) => {
            const hasHeading = Boolean(section.heading);
            const inner = (
              <>
                {section.paragraphs?.map((p, j) => (
                  <p key={j} className="text-[15px] leading-relaxed text-[#6B7280]">
                    {p}
                  </p>
                ))}

                {section.table && (
                  <table className="w-full text-sm mt-4">
                    <thead>
                      <tr className="border-b border-[#E8E3DA]">
                        {section.table.headers.map((h, k) => (
                          <th
                            key={k}
                            className={`py-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                              k === 0 ? "text-left pr-4" : k === section.table!.headers.length - 1 ? "text-right pl-4 text-[#14b8a6]" : "text-right px-4 text-[#9CA3AF]"
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, k) => (
                        <tr key={k} className="border-b border-[#F5F3EF]">
                          {row.map((cell, l) => (
                            <td
                              key={l}
                              className={`py-3 ${
                                l === 0
                                  ? "pr-4 text-[#374151]"
                                  : l === row.length - 1
                                  ? "pl-4 text-right font-semibold text-[#14b8a6]"
                                  : "px-4 text-right text-[#6B7280]"
                              }`}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {section.list && (
                  section.list.ordered ? (
                    <ol className="space-y-2 mt-2">
                      {section.list.items.map((item, k) => (
                        <li key={k} className="flex gap-3 text-[15px] text-[#6B7280]">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full border border-[#E8E3DA] flex items-center justify-center text-[10px] font-semibold text-[#9CA3AF]">
                            {k + 1}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ul className="space-y-2 mt-2">
                      {section.list.items.map((item, k) => (
                        <li key={k} className="flex gap-3 text-[15px] text-[#6B7280]">
                          <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </>
            );

            return hasHeading ? (
              <div
                key={i}
                className="fade-in bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm space-y-4"
              >
                <h2
                  className="text-xl font-semibold text-[#0a1f3d]"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {section.heading}
                </h2>
                {inner}
              </div>
            ) : (
              <div key={i} className="fade-in space-y-4">
                {inner}
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-14 pt-8 border-t border-[#E8E3DA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-[#9CA3AF]">
            Want to see where your brand sits?{" "}
            <Link to="/" className="text-[#14b8a6] font-medium hover:underline">
              Run your free benchmark →
            </Link>
          </p>
          <Link
            to="/blogs"
            className="text-sm text-[#9CA3AF] hover:text-[#14b8a6] transition-colors font-medium"
          >
            ← All articles
          </Link>
        </div>

      </main>
    </div>
  );
}
