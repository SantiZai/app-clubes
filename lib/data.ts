export type Torneo = {
  id: string;
  nombre: string;
  categoria: "Masculino" | "Femenino" | "Mixto";
  nivel: string;
  fecha: string;
  fechaFin: string;
  inscripcionHasta: string;
  precio: number;
  cupos: number;
  inscriptos: number;
  descripcion: string;
  formato: string;
  activo: boolean;
  club?: string;
  banner?: string;
  clubLogo?: string;
  logoKey?: string;
};

export const torneos: Torneo[] = [
  {
    id: "1",
    nombre: "Copa Primavera 2026",
    categoria: "Masculino",
    nivel: "5ta / 6ta",
    fecha: "2026-06-15",
    fechaFin: "2026-06-22",
    inscripcionHasta: "2026-06-10",
    precio: 8000,
    cupos: 32,
    inscriptos: 24,
    descripcion:
      "Torneo masculino en categoría 5ta/6ta. Formato de grupos con los mejores 8 equipos avanzando a eliminación directa. Premiación para los primeros tres puestos.",
    formato: "Fase de grupos + eliminación directa",
    activo: true,
    club: "Club Central Pádel",
    banner:
      "https://picsum.photos/id/1018/1400/800",
    clubLogo: "https://placehold.co/64x64/00E5A0/0A0A0A?text=CC",
    logoKey: "CC",
  },
  {
    id: "2",
    nombre: "Torneo Femenino Invierno",
    categoria: "Femenino",
    nivel: "Todas las categorías",
    fecha: "2026-07-05",
    fechaFin: "2026-07-12",
    inscripcionHasta: "2026-06-30",
    precio: 7500,
    cupos: 16,
    inscriptos: 8,
    descripcion:
      "Torneo femenino abierto a todas las categorías. Gran premiación para las campeonas y trofeos para el podio completo. Se juega en canchas techadas.",
    formato: "Round robin + eliminación directa",
    activo: true,
    club: "Club Alta Vista",
    banner:
      "https://picsum.photos/id/1015/1400/800",
    clubLogo: "https://placehold.co/64x64/00E5A0/0A0A0A?text=AV",
    logoKey: "AV",
  },
  {
    id: "3",
    nombre: "Abierto de Verano",
    categoria: "Mixto",
    nivel: "3ra / 4ta",
    fecha: "2026-08-10",
    fechaFin: "2026-08-17",
    inscripcionHasta: "2026-08-05",
    precio: 9000,
    cupos: 32,
    inscriptos: 0,
    descripcion:
      "El torneo más grande del año. Torneo mixto con premios en efectivo para los dos primeros puestos. Nivel 3ra y 4ta categoría.",
    formato: "Eliminación directa",
    activo: true,
    club: "Club Marítimo",
    banner:
      "https://picsum.photos/id/1019/1400/800",
    clubLogo: "https://placehold.co/64x64/00E5A0/0A0A0A?text=CM",
    logoKey: "CM",
  },
];
