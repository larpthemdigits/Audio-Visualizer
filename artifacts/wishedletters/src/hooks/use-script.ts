import { useState, useEffect } from 'react';

export function useScript(src: string) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(() => {
    if (typeof window === "undefined") return "loading";
    const existingScript = document.querySelector(`script[src="${src}"]`);
    return existingScript ? "ready" : "loading";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.setAttribute("data-status", "loading");
      document.body.appendChild(script);

      const setAttributeFromEvent = (event: Event) => {
        script.setAttribute(
          "data-status",
          event.type === "load" ? "ready" : "error"
        );
      };

      script.addEventListener("load", setAttributeFromEvent);
      script.addEventListener("error", setAttributeFromEvent);
    } else {
      setStatus(script.getAttribute("data-status") as "loading" | "ready" | "error" || "ready");
    }

    const setStateFromEvent = (event: Event) => {
      setStatus(event.type === "load" ? "ready" : "error");
    };

    script.addEventListener("load", setStateFromEvent);
    script.addEventListener("error", setStateFromEvent);

    return () => {
      if (script) {
        script.removeEventListener("load", setStateFromEvent);
        script.removeEventListener("error", setStateFromEvent);
      }
    };
  }, [src]);

  return status;
}
