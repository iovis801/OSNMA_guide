/** Citation chip for use inside React islands (mirror of the Astro DocRef). */
interface Props {
  doc: 'icd' | 'rxg';
  section: string;
}

export default function Cite({ doc, section }: Props) {
  const label = doc === 'icd' ? 'SIS ICD' : 'Rx Guidelines';
  const title =
    doc === 'icd'
      ? `Galileo OSNMA SIS ICD v1.1, section ${section}`
      : `Galileo OSNMA Receiver Guidelines v1.3, section ${section}`;
  return (
    <a
      href="/reference/sources"
      title={title}
      className="inline-flex items-center gap-1 rounded border border-line bg-panel2 px-1.5 py-0.5 align-middle text-[10px] font-medium text-muted no-underline transition-colors hover:border-brand hover:text-brand-bright"
    >
      {label} §{section}
    </a>
  );
}
