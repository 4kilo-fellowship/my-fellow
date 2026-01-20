export type Announcement = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaIcon: string;
  image: string;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1",
    title: "Annual Youth Camp",
    subtitle: "Join us for 3 days of worship.",
    cta: "Register",
    ctaIcon: "log-in-outline",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    title: "Charity Drive",
    subtitle: "Help us reach our goal.",
    cta: "Donate",
    ctaIcon: "heart-outline",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Community Cleanup",
    subtitle: "Join us in keeping our city clean.",
    cta: "Sign Up",
    ctaIcon: "brush-outline",
    image: "https://images.unsplash.com/photo-1761839259946-2d80f8e72e18?",
  },
  {
    id: "4",
    title: "Music Workshop",
    subtitle: "Learn from professional musicians.",
    cta: "Enroll",
    ctaIcon: "musical-notes-outline",
    image:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    title: "Food Festival",
    subtitle: "Taste dishes from around the world.",
    cta: "Get Tickets",
    ctaIcon: "restaurant-outline",
    image:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    title: "Art Exhibition",
    subtitle: "Explore works from local artists.",
    cta: "Visit",
    ctaIcon: "brush-outline",
    image:
      "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
  },
];
