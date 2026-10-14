export default function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-8 text-center text-2xl font-bold text-primary sm:text-3xl">
      {children}
      <span aria-hidden className="mx-auto mt-3 block h-1 w-12 rounded-full bg-accent" />
    </h2>
  );
}
