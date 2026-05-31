export type Club = {
  name: string;
  slug: string;
  city: string;
  photo?: string; // path under public/images/clubs/
  rating?: number;
};

export const clubs: Club[] = [
  {
    name: "Club Central Pádel",
    slug: "club-central",
    city: "Buenos Aires",
    photo: "/images/clubs/club-central.jpg",
    rating: 4.6,
  },
  {
    name: "Club Alta Vista",
    slug: "alta-vista",
    city: "Córdoba",
    photo: "/images/clubs/alta-vista.jpg",
    rating: 4.4,
  },
  {
    name: "Club Marítimo",
    slug: "club-maritimo",
    city: "Mar del Plata",
    photo: "/images/clubs/club-maritimo.jpg",
    rating: 4.7,
  },
];
