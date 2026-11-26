import Link from "next/link";
import type { ReactNode } from "react";
import { Zeichen } from "./Zeichen";

/**
 * Knöpfe (Design.md, 8.4 und 9.17).
 * Hauptknopf: rot und rund wie ein Steckerstift. Bei Maus darüber füllt dunkleres Rot den Knopf
 * von links, ein Stecker schiebt sich hinein, der Text rückt 8 px. Mit Skript folgt er der Maus um höchstens 6 px.
 */
type Art = "haupt" | "zweit" | "weiss";

type Gemeinsam = {
  art?: Art;
  klein?: boolean;
  breit?: boolean;
  className?: string;
  children: ReactNode;
};

function klassen({ art = "haupt", klein, breit, className }: Omit<Gemeinsam, "children">) {
  return ["knopf", `knopf--${art}`, klein ? "knopf--klein" : "", breit ? "knopf--breit" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

function Inhalt({ art = "haupt", children }: { art?: Art; children: ReactNode }) {
  return (
    <>
      {art === "haupt" && <Zeichen name="stecker" className="knopf__stecker" />}
      <span className="knopf__text">{children}</span>
    </>
  );
}

export function KnopfLink({
  href,
  extern,
  ...rest
}: Gemeinsam & { href: string; extern?: boolean }) {
  const eigenschaften = {
    className: klassen(rest),
    "data-magnet": rest.art === undefined || rest.art === "haupt" ? "" : undefined,
  };
  if (extern || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("#")) {
    return (
      <a href={href} {...eigenschaften} {...(extern ? { rel: "noopener", target: "_blank" } : {})}>
        <Inhalt art={rest.art}>{rest.children}</Inhalt>
      </a>
    );
  }
  return (
    <Link href={href} {...eigenschaften}>
      <Inhalt art={rest.art}>{rest.children}</Inhalt>
    </Link>
  );
}

export function Knopf({
  type = "button",
  laedt,
  disabled,
  ...rest
}: Gemeinsam & { type?: "button" | "submit"; laedt?: boolean; disabled?: boolean }) {
  return (
    <button
      type={type}
      className={klassen(rest)}
      data-magnet={rest.art === undefined || rest.art === "haupt" ? "" : undefined}
      data-laedt={laedt ? "true" : undefined}
      disabled={disabled}
      aria-busy={laedt || undefined}
    >
      <Inhalt art={rest.art}>{rest.children}</Inhalt>
    </button>
  );
}
