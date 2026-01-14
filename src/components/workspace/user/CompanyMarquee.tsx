import Marquee from "react-fast-marquee";

export default function CompanyMarquee() {
  const companies = [
    { id: 1, logoUrl: "/workspace/amet.png", name: "AMET" },
    { id: 2, logoUrl: "/workspace/edii.png", name: "EDII Periyakulam" },
    { id: 3, logoUrl: "/enablers/satyabhama.png", name: "Sathyabama TBI" },
    { id: 4, logoUrl: "/workspace/sona.png", name: "SONA" },
    { id: 5, logoUrl: "/workspace/tbi.png", name: "Bharath TBI" },
    { id: 6, logoUrl: "/workspace/grg.png", name: "GRG" },
    { id: 7, logoUrl: "/enablers/veltech.png", name: "VEL TECH" },
  ];

  return (
    <div className="relative max-w-7xl mx-auto py-12 overflow-hidden">
      {/* optional fading edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

    <Marquee speed={60} pauseOnHover={true} gradient={false}>
  {companies.map((c) => (
    <div
      key={c.id}
      className="flex items-center gap-4 mx-12 hover:grayscale-0 transition duration-300"
    >
      <img
        src={c.logoUrl}
        alt={c.name}
        className="h-12 w-auto object-contain"
      />
      <span className="text-base font-medium text-gray-700">{c.name}</span>
    </div>
  ))}
</Marquee>

    </div>
  );
}
