import Hero from "@/components/Hero";
import TorneoCard from "@/components/TorneoCard";
import Categories from "@/components/Categories";
import FeaturedClubs from "@/components/FeaturedClubs";
import TorneosDiscovery from "@/components/TorneosDiscovery";
import FeaturedTorneos from "@/components/FeaturedTorneos";
import { torneosMock } from "@/lib/data";

import type { Tables } from "@/types/database.types";

type Tournament = Tables<"torneos">

export default function Home() {
  /* const proximos = torneosMock.filter((t) => t.activo); */

  return (
    <>
      <Hero />

      <TorneosDiscovery initialTorneos={[]} />

      <div className="section-divider" />

      <FeaturedTorneos />

      <div className="section-divider" />

      <Categories />

      <div className="section-divider" />

      <FeaturedClubs />
    </>
  );
}
