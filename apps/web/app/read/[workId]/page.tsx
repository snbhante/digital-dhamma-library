import Link from "next/link";
import { notFound } from "next/navigation";
import corpus from "../../../../../data/corpus.json";
import CopyCitationButton from "../../../components/CopyCitationButton";

export function generateStaticParams() {
  return corpus.map((work) => ({ workId: work.id }));
}

export default async function WorkPage({
  params
}: {
  params: Promise<{ workId: string }>;
}) {
  const { workId } = await params;
  const work = corpus.find((item) => item.id === workId);

  if (!work) notFound();

  return (
    <main className="reader-shell">
      <nav className="topbar">
        <Link href="/">← Digital Dhamma Library</Link>
        <div className="topbar-actions">
          <Link href="/search/">Search</Link>
          <span>{work.collection}</span>
        </div>
      </nav>

      <header className="reader-header">
        <p className="eyebrow">{work.id.toUpperCase()}</p>
        <h1>{work.title}</h1>
        <p>{work.description}</p>
        <div className="metadata">
          <span>Language: {work.language}</span>
          <span>Type: {work.type}</span>
          <span>Edition: {work.edition}</span>
          <span>{work.paragraphs.length} paragraphs</span>
        </div>
      </header>

      <section className="text-column" aria-label={`${work.title} text`}>
        {work.paragraphs.map((paragraph) => (
          <article className="paragraph" id={paragraph.id} key={paragraph.id}>
            <div className="paragraph-head">
              <div className="paragraph-id">{paragraph.id}</div>
              <CopyCitationButton
                workTitle={work.title}
                paragraphId={paragraph.id}
                edition={work.edition}
              />
            </div>
            <p className="pali">{paragraph.pali}</p>
            {paragraph.english && <p className="translation">{paragraph.english}</p>}
            {paragraph.bangla && <p className="translation bangla">{paragraph.bangla}</p>}
            <div className="citation">
              <span>{work.edition}</span>
              <span>•</span>
              <a href={`#${paragraph.id}`}>#{paragraph.number}</a>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
