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
];
