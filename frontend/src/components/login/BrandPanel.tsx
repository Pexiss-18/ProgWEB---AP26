import PlanetIcon from "./PlanetIcon";

export default function BrandPanel() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full bg-ag-dark overflow-hidden px-10 py-12">
      {/* Decorative floating spheres */}
      <div
        className="absolute top-10 left-8 w-2 h-2 rounded-full bg-ag-beige opacity-20"
        aria-hidden="true"
      />
      <div
        className="absolute top-20 right-10 w-1.5 h-1.5 rounded-full bg-ag-beige opacity-15"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-16 left-14 w-1 h-1 rounded-full bg-ag-beige opacity-20"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-24 right-8 w-2.5 h-2.5 rounded-full bg-ag-gold opacity-15"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-5 w-1 h-1 rounded-full bg-ag-beige opacity-10"
        aria-hidden="true"
      />

      {/* Decorative floating lines */}
      <div
        className="absolute top-14 left-6 w-8 h-px bg-ag-beige opacity-10 rotate-45"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-20 right-6 w-6 h-px bg-ag-beige opacity-10 -rotate-30"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-4 w-4 h-px bg-ag-gold opacity-10"
        aria-hidden="true"
      />

      {/* Subtle ambient glow behind planet */}
      <div
        className="absolute w-48 h-48 rounded-full bg-ag-sepia opacity-10 blur-3xl"
        aria-hidden="true"
      />

      {/* Planet icon */}
      <div style={{ filter: "drop-shadow(0 0 12px rgba(201,168,76,0.4))" }}>
        <PlanetIcon />
      </div>

      {/* Decorative line above name */}
      <div className="mt-6 w-12 h-px bg-ag-gold opacity-40" aria-hidden="true" />

      {/* Brand name */}
      <div className="mt-3 flex flex-col items-center gap-1 select-none">
        <p
          className="text-sm font-light uppercase bg-gradient-to-r from-ag-gold to-ag-gold-light bg-clip-text text-transparent"
          style={{ letterSpacing: "0.4em" }}
        >
          Marlon Barber
        </p>
        <p className="mt-2 text-[9px] tracking-[0.3em] uppercase text-ag-sepia">
          Est. 2024 — Premium Grooming
        </p>
      </div>

      {/* Decorative line below name */}
      <div className="mt-3 w-12 h-px bg-ag-gold opacity-40" aria-hidden="true" />
    </div>
  );
}
