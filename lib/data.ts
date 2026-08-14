import type { Tables } from "@/types/database.types";

type Tournament = Tables<"torneos">

export const torneosMock: Tournament[] = [
  {
    id: "torneo-001",
    nombre: "Open Verano Pádel Club",
    slug: "open-verano-padel-club",
    estado: "en_curso",
    visibilidad: "publico",

    categoria: "5ta",
    nivel: "Intermedio",
    ciudad: "Rosario",
    provincia: "Santa Fe",
    direccion: "Av. Pellegrini 1450",

    fecha_inicio: "2026-09-12T09:00:00.000Z",
    fecha_fin: "2026-09-13T20:00:00.000Z",
    hora_inicio: "09:00",
    fecha_limite_inscripcion: "2026-09-08T23:59:59.000Z",
    fecha_sorteo: "2026-09-09T19:00:00.000Z",
    fecha_publicacion_fixture: "2026-09-10T12:00:00.000Z",

    cupos: 32,
    parejas_inscriptas: 24,
    minimo_parejas: 8,
    cantidad_canchas: 6,

    precio_inscripcion: 25000,

    descripcion:
      "Torneo de pádel para jugadores de categoría 5ta. Dos jornadas de competencia con fase de grupos y eliminación directa.",
    resumen:
      "Torneo de 5ta categoría con 32 cupos y premios para los finalistas.",

    premios: "Trofeos + órdenes de compra",
    reglamento: "Reglamento oficial de pádel con fase de grupos y playoffs.",

    color_tema: "#10B981",
    banner: "/images/torneos/open-verano.jpg",

    destacado: true,
    eliminado: false,
    clima_suspendido: false,

    permite_lista_espera: true,
    requiere_confirmacion_admin: true,

    autoplay_fixture: true,
    autoplay_playoffs: true,

    ranking_otorga_puntos: true,
    ranking_id: "ranking-padel-001",

    club_id: "club-001",
    organizador_id: "organizador-001",

    email_contacto: "torneos@padelclub.com",
    whatsapp_contacto: "+5493415551234",
    instagram: "@padelclubrosario",

    alias_pago: "PADEL.CLUB",
    mercado_pago_link: "https://mpago.la/ejemplo1",
    qr_pago: "/images/qr/open-verano.png",

    motivo_suspension: null,

    creado_en: "2026-08-01T14:00:00.000Z",
    actualizado_en: "2026-08-10T18:30:00.000Z",
  },

  {
    id: "torneo-002",
    nombre: "Copa Primavera Tenis",
    slug: "copa-primavera-tenis",
    estado: "inscripciones",
    visibilidad: "publico",

    categoria: "Libre",
    nivel: "Avanzado",
    ciudad: "Córdoba",
    provincia: "Córdoba",
    direccion: "Av. Circunvalación Km 8",

    fecha_inicio: "2026-10-03T08:30:00.000Z",
    fecha_fin: "2026-10-04T19:00:00.000Z",
    hora_inicio: "08:30",
    fecha_limite_inscripcion: "2026-09-28T23:59:59.000Z",
    fecha_sorteo: "2026-09-29T20:00:00.000Z",
    fecha_publicacion_fixture: null,

    cupos: 16,
    parejas_inscriptas: 9,
    minimo_parejas: 4,
    cantidad_canchas: 4,

    precio_inscripcion: 30000,

    descripcion:
      "Competencia abierta para jugadores avanzados. El torneo tendrá eliminación directa desde octavos de final.",
    resumen:
      "Copa de tenis para jugadores avanzados con premios en efectivo.",

    premios: "$300.000 al campeón + trofeo",
    reglamento: "Reglamento oficial de tenis. Partidos al mejor de 3 sets.",

    color_tema: "#3B82F6",
    banner: "/images/torneos/copa-primavera.jpg",

    destacado: true,
    eliminado: false,
    clima_suspendido: false,

    permite_lista_espera: false,
    requiere_confirmacion_admin: true,

    autoplay_fixture: false,
    autoplay_playoffs: true,

    ranking_otorga_puntos: true,
    ranking_id: "ranking-tenis-001",

    club_id: "club-002",
    organizador_id: "organizador-002",

    email_contacto: "torneos@teniscordoba.com",
    whatsapp_contacto: "+5493515556789",
    instagram: "@teniscordoba",

    alias_pago: "COPA.TENIS",
    mercado_pago_link: "https://mpago.la/ejemplo2",
    qr_pago: "/images/qr/copa-primavera.png",

    motivo_suspension: null,

    creado_en: "2026-08-05T16:00:00.000Z",
    actualizado_en: "2026-08-12T12:00:00.000Z",
  },

  {
    id: "torneo-003",
    nombre: "Liga Nocturna Pádel",
    slug: "liga-nocturna-padel",
    estado: "finalizado",
    visibilidad: "publico",

    categoria: "7ma",
    nivel: "Principiante",
    ciudad: "Villa María",
    provincia: "Córdoba",
    direccion: "Bv. Sarmiento 820",

    fecha_inicio: "2026-07-18T18:00:00.000Z",
    fecha_fin: "2026-07-19T23:30:00.000Z",
    hora_inicio: "18:00",
    fecha_limite_inscripcion: "2026-07-14T23:59:59.000Z",
    fecha_sorteo: "2026-07-15T19:00:00.000Z",
    fecha_publicacion_fixture: "2026-07-16T12:00:00.000Z",

    cupos: 24,
    parejas_inscriptas: 24,
    minimo_parejas: 8,
    cantidad_canchas: 5,

    precio_inscripcion: 18000,

    descripcion:
      "Torneo nocturno para jugadores principiantes. Ideal para quienes buscan competir por primera vez.",
    resumen:
      "Torneo nocturno de 7ma categoría completamente lleno.",

    premios: "Trofeos + indumentaria deportiva",
    reglamento: "Reglamento general del torneo.",

    color_tema: "#8B5CF6",
    banner: "/images/torneos/liga-nocturna.jpg",

    destacado: false,
    eliminado: false,
    clima_suspendido: false,

    permite_lista_espera: true,
    requiere_confirmacion_admin: false,

    autoplay_fixture: true,
    autoplay_playoffs: false,

    ranking_otorga_puntos: false,
    ranking_id: null,

    club_id: "club-003",
    organizador_id: "organizador-003",

    email_contacto: "liga@padelvillamaria.com",
    whatsapp_contacto: "+5493535554321",
    instagram: "@padelvillamaria",

    alias_pago: null,
    mercado_pago_link: null,
    qr_pago: null,

    motivo_suspension: null,

    creado_en: "2026-07-01T10:00:00.000Z",
    actualizado_en: "2026-07-20T14:00:00.000Z",
  },
];