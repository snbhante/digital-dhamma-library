import Link from "next/link";

export type AvatarGender = "female" | "male" | "neutral";

export function normalizeAvatarGender(value: unknown): AvatarGender {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";
  if (["female", "woman", "f", "নারী", "মহিলা"].includes(normalized)) return "female";
  if (["male", "man", "m", "পুরুষ"].includes(normalized)) return "male";
  return "neutral";
}

export function UserAvatar({
  src,
  gender,
  name = "User avatar",
  size = "medium",
  href,
}: {
  src?: string | null;
  gender?: unknown;
  name?: string;
  size?: "small" | "medium" | "large";
  href?: string;
}) {
  const kind = normalizeAvatarGender(gender);
  const content = src ? (
    // Supabase Storage public avatar URLs are external, user-provided images.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`user-avatar-image avatar-${size}`} src={src} alt={`${name} profile picture`} />
  ) : (
    <span className={`user-avatar-fallback avatar-${size} avatar-gender-${kind}`} aria-label={`${kind} default avatar`} role="img">
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle cx="32" cy="23" r="12" />
        <path d={kind === "female" ? "M14 57c1-13 8-20 18-20s17 7 18 20H14Z" : "M13 58c1-13 8-20 19-20s18 7 19 20H13Z"} />
        {kind === "female" && <path d="M19 23c-2-13 5-19 13-19s15 7 13 19l-4-7-5-5c-4 4-9 6-17 6Z" />}
        {kind === "male" && <path d="M20 19c1-9 6-14 12-14 8 0 12 6 12 14-4-4-8-6-12-6s-8 2-12 6Z" />}
      </svg>
    </span>
  );

  return href ? <Link className={`user-avatar-link avatar-link-${size}`} href={href} aria-label="Open account profile">{content}</Link> : content;
}
