import type { ResearchProtocol } from "@/lib/content/types";

export function ResearchProtocolPanel({ protocol }: { protocol: ResearchProtocol }) {
  return (
    <section aria-labelledby="protocol-h" className="border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <p className="label-micro text-faint">Experimental design</p>
        <h2 id="protocol-h" className="mt-1 text-lg font-medium tracking-tight">
          Research protocol
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">{protocol.design}</p>
      </div>

      <dl className="divide-y divide-border">
        <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
          <div>
            <dt className="label-micro text-faint">Independent variable (IV)</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {protocol.independentVariable}
            </dd>
          </div>
          <div>
            <dt className="label-micro text-faint">Dependent variable(s) (DV)</dt>
            <dd className="mt-2">
              <ul className="space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                {protocol.dependentVariables.map((dv) => (
                  <li key={dv} className="flex gap-2">
                    <span className="text-primary" aria-hidden="true">
                      ·
                    </span>
                    {dv}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </div>

        <div className="px-5 py-4">
          <dt className="label-micro text-faint">Measured constructs</dt>
          <dd className="mt-3 flex flex-wrap gap-2">
            {protocol.measuredConstructs.map((c) => (
              <span
                key={c}
                className="border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </dd>
        </div>

        <div className="px-5 py-4">
          <dt className="label-micro text-faint">Operational definitions</dt>
          <dd className="mt-3 space-y-3">
            {Object.entries(protocol.operationalDefinitions).map(([label, def]) => (
              <div key={label}>
                <p className="text-sm font-medium tracking-tight">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{def}</p>
              </div>
            ))}
          </dd>
        </div>

        <div className="px-5 py-4">
          <dt className="label-micro text-faint">Key terms</dt>
          <dd className="mt-3 space-y-4">
            {protocol.keyTerms.map(({ term, definition }) => (
              <div key={term}>
                <p className="text-sm font-medium tracking-tight">{term}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {definition}
                </p>
              </div>
            ))}
          </dd>
        </div>
      </dl>
    </section>
  );
}
