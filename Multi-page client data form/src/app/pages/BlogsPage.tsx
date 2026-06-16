import { useEffect, useRef } from "react";
import { Link } from "react-router";
import Logo from "../components/Logo";
import { blogPosts } from "../utils/blogData";
import gsap from "gsap";
import { resizeLenis } from "../utils/lenisInstance";

export default function BlogsPage() {
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Blog | Anphonic";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Retention benchmarks, Shelf Score insights, and D2C growth tactics for Indian brands."
      );
    }

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
      if (listRef.current) {
        const cards = listRef.current.querySelectorAll(".blog-card");
        gsap.fromTo(
          cards,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 0.4 }
        );
      }
    });

    setTimeout(resizeLenis, 100);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <header
        ref={headerRef}
        className="flex justify-between items-center px-6 py-5 md:px-16 md:py-6 border-b border-[#E8E3DA] bg-[#F5F3EF]/80 backdrop-blur-sm"
      >
        <Logo />
        <Link
          to="/"
          className="text-xs text-[#9CA3AF] hover:text-[#14b8a6] transition-colors font-medium tracking-wider"
        >
          ← Back to home
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        <div ref={heroRef} className="mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
            <span className="text-xs text-[#14b8a6] font-semibold tracking-[0.16em] uppercase">
              Anphonic Blog
            </span>
          </div>
          <h1
            className="text-3xl md:text-4xl text-[#0a1f3d] leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Benchmarks, retention insights,<br className="hidden md:block" /> and D2C growth tactics.
          </h1>
        </div>

        <div ref={listRef} className="space-y-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blogs/${post.slug}`}
              className="blog-card block bg-white border border-[#E8E3DA] rounded-2xl p-6 md:p-8 shadow-sm hover:border-[#14b8a6] hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#14b8a6]">
                  {post.tag}
                </span>
                <span className="text-[10px] text-[#9CA3AF]">· {post.date}</span>
              </div>
              <h2
                className="text-lg font-semibold text-[#0a1f3d] mb-2 group-hover:text-[#14b8a6] transition-colors leading-snug"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed text-[#6B7280]">{post.excerpt}</p>
              <p className="mt-4 text-xs font-medium text-[#14b8a6]">Read article →</p>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}
