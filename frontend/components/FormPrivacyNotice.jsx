import Link from "next/link";

// Privacy / consent note shown under every public form. Each form passes its own
// purpose sentence (what the details will be used for); the Privacy Policy link
// is always appended. Links open in a new tab so visitors don't lose form input.
//
// tone:  "light" (default, white backgrounds) | "dark" (e.g. the footer)
// align: "center" (default) | "left"
export const noticeLinkClass = {
  light: "font-semibold text-[#414143] underline underline-offset-2 hover:text-[#D52029]",
  dark: "font-semibold text-white underline underline-offset-2 hover:text-white/80",
};

export function NoticeLink({ href, tone = "light", children }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className={noticeLinkClass[tone]}>
      {children}
    </Link>
  );
}

export default function FormPrivacyNotice({ children, tone = "light", align = "center", className = "" }) {
  const color = tone === "dark" ? "text-white/60" : "text-slate-500";
  const alignment = align === "left" ? "text-left" : "text-center";
  return (
    <p className={`text-xs leading-relaxed ${color} ${alignment} ${className}`}>
      {children}{" "}
      See our{" "}
      <NoticeLink href="/privacy-policy" tone={tone}>
        Privacy Policy
      </NoticeLink>{" "}
      for how we handle your personal data.
    </p>
  );
}
