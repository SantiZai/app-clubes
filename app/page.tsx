import Hero from "@/components/Hero";
import TorneoCard from "@/components/TorneoCard";
import Categories from "@/components/Categories";
import FeaturedClubs from "@/components/FeaturedClubs";
import TorneosDiscovery from "@/components/TorneosDiscovery";
import FeaturedTorneos from "@/components/FeaturedTorneos";
import { torneos } from "@/lib/data";

export default function Home() {
  const proximos = torneos.filter((t) => t.activo);

  return (
    <>
      <Hero />

      <TorneosDiscovery initialTorneos={proximos} />

      <div className="section-divider" />

      <FeaturedTorneos />

      <div className="section-divider" />

      <Categories />

      <div className="section-divider" />

      <FeaturedClubs />
    </>
  );
}
