import { useEffect, useRef, useState, useCallback } from "react";

const SCRIPT_URL = "//translate.google.com/translate_a/element.js";
const SCRIPT_SRC = `${SCRIPT_URL}?cb=googleTranslateElementInit`;
const STORAGE_KEY = "googtrans";
const LANGUAGES = [
  { code: "es", label: "ES" },
  { code: "eu", label: "EU" },
  { code: "en", label: "EN" },
];

function getCookie(name) {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value) {
  document.cookie = `${name}=${value};path=/;max-age=31536000`;
}

export default function GoogleTranslateWidget() {
  const [currentLang, setCurrentLang] = useState(() => {
    const saved = getCookie(STORAGE_KEY);
    if (saved === "/es/eu") return "eu";
    if (saved === "/es/en") return "en";
    return "es";
  });
  const [open, setOpen] = useState(false);
  const initDone = useRef(false);
  const selectReady = useRef(false);
  const comboRef = useRef(null);
  const currentLangRef = useRef(currentLang);
  const dropRef = useRef(null);

  currentLangRef.current = currentLang;

  function doTranslate(lang) {
    const select = comboRef.current;
    if (!select) return;
    if (lang === "es") {
      select.value = "es";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    select.value = lang;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  const handleSelect = useCallback((code) => {
    setCurrentLang(code);
    setOpen(false);
    doTranslate(code);
  }, []);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "es",
          includedLanguages: "es,eu,en",
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        "google_translate_element"
      );

      const check = setInterval(() => {
        const combo = document.querySelector(".goog-te-combo");
        if (combo) {
          comboRef.current = combo;
          combo.style.display = "none";
          selectReady.current = true;
          clearInterval(check);

          const saved = getCookie(STORAGE_KEY);
          if (saved === "/es/eu") {
            combo.value = "eu";
            combo.dispatchEvent(new Event("change", { bubbles: true }));
            setCurrentLang("eu");
          } else if (saved === "/es/en") {
            combo.value = "en";
            combo.dispatchEvent(new Event("change", { bubbles: true }));
            setCurrentLang("en");
          }
        }
      }, 200);

      setTimeout(() => clearInterval(check), 10000);
    };

    const existing = document.querySelector(`script[src*="${SCRIPT_URL}"]`);
    if (existing && window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    const observer = new MutationObserver((mutations) => {
      const hasNew = mutations.some(
        (m) =>
          m.type === "childList" &&
          Array.from(m.addedNodes).some(
            (n) =>
              n.nodeType === Node.ELEMENT_NODE &&
              n.nodeName !== "SCRIPT" &&
              n.nodeName !== "STYLE" &&
              !n.closest("#google_translate_element") &&
              !n.closest(".goog-te-banner-frame") &&
              !n.closest(".skiptranslate") &&
              !n.closest(".header__lang")
          )
      );
      if (hasNew && selectReady.current && currentLangRef.current !== "es") {
        const combo = comboRef.current;
        if (combo) {
          combo.value = currentLangRef.current;
          combo.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const scriptEl = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
      if (scriptEl) scriptEl.remove();
      delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    if (currentLang === "es") {
      setCookie(STORAGE_KEY, "/es/es");
    } else {
      setCookie(STORAGE_KEY, `/es/${currentLang}`);
    }
  }, [currentLang]);

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [open]);

  return (
    <div ref={dropRef} style={{ position: "relative", display: "inline-block" }}>
      <div id="google_translate_element" style={{ display: "none" }} />

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          padding: "4px 10px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer",
          fontSize: 14,
        }}
      >
        {LANGUAGES.find((l) => l.code === currentLang)?.label || "ES"}
      </button>

      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            margin: "4px 0 0",
            padding: 0,
            listStyle: "none",
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 4,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 9999,
            minWidth: 60,
          }}
        >
          {LANGUAGES.map((l) => (
            <li
              key={l.code}
              onClick={() => handleSelect(l.code)}
              style={{
                padding: "6px 14px",
                cursor: "pointer",
                fontWeight: l.code === currentLang ? 700 : 400,
                background:
                  l.code === currentLang ? "#f0f0f0" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e8e8e8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  l.code === currentLang ? "#f0f0f0" : "transparent")
              }
            >
              {l.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
