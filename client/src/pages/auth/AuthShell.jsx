import { useEffect, useRef } from "react";
import { Target, TrendingUp, Bot, ShieldCheck } from "lucide-react";

/* Split-screen authentication layout with a Vanta WAVES background. */
export function AuthShell({ children }) {
  const wavesRef = useRef(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let effectInstance = null;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);

        if (existing?.dataset.loaded === "true") {
          resolve();
          return;
        }

        const script = existing || document.createElement("script");

        const handleLoad = () => {
          script.dataset.loaded = "true";
          resolve();
        };

        const handleError = () => {
          reject(new Error(`Unable to load script: ${src}`));
        };

        script.addEventListener("load", handleLoad, { once: true });
        script.addEventListener("error", handleError, { once: true });

        if (!existing) {
          script.src = src;
          script.async = true;
          document.head.appendChild(script);
        }
      });

    const initializeVanta = async () => {
      try {
        // Load Three.js before Vanta.
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js",
        );

        if (cancelled) return;

        // Load the Vanta WAVES effect.
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js",
        );

        if (cancelled || !wavesRef.current) return;

        if (!window.THREE || !window.VANTA?.WAVES) {
          throw new Error("Three.js or Vanta WAVES is unavailable.");
        }

        effectInstance = window.VANTA.WAVES({
          el: wavesRef.current,
          THREE: window.THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth: 200,
          scale: 1,
          scaleMobile: 1,
          color: 0xaf522d,
        });

        vantaRef.current = effectInstance;
      } catch (error) {
        console.error("Vanta WAVES initialization failed:", error);
      }
    };

    initializeVanta();

    return () => {
      cancelled = true;
      effectInstance?.destroy();

      if (vantaRef.current === effectInstance) {
        vantaRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative flex min-h-screen bg-transparent">
      {/* Vanta background across the authentication screen */}
      <div ref={wavesRef} className="fixed inset-0 z-0" aria-hidden="true" />

      {/* Brand / marketing panel */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-between overflow-hidden bg-transparent p-12 text-white lg:flex">
        {/* Decorative overlays */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-primary-700/25 blur-3xl" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Target className="h-5 w-5" />
          </div>

          <span className="font-display text-lg font-bold">ClarioCRM</span>
        </div>

        {/* Marketing content */}
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Close more deals with an AI co-pilot in your pipeline.
          </h2>

          <p className="mt-4 max-w-md text-white/80">
            ClarioCRM unifies your leads, contacts and follow-ups — then layers
            AI-powered summaries, email drafts and sales insights on top.
          </p>

          <div className="mt-10 space-y-4">
            {[
              {
                icon: TrendingUp,
                text: "Visual pipeline with drag-and-drop stages",
              },
              {
                icon: Bot,
                text: "AI lead scoring & instant email drafting",
              },
              {
                icon: ShieldCheck,
                text: "Secure JWT auth, your data stays yours",
              },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="h-[18px] w-[18px]" />
                </div>

                <span className="text-sm text-white/90">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} ClarioCRM. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm rounded-2xl border border-white/50 bg-white/95 p-6 shadow-xl backdrop-blur-md sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
