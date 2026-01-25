export interface GiftItem {
  id: string;
  name: string;
  price: number;
  image: string;
  isNew?: boolean;
}

export const GIFT_ITEMS: GiftItem[] = [
  {
    id: "1",
    name: "Fellowship T-Shirt",
    price: 450,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=500",
  },
  {
    id: "2",
    name: "Fellowship Stickers",
    price: 50,
    image:
      "https://images.unsplash.com/photo-1572375927902-1c09367532c5?auto=format&fit=crop&q=80&w=500",
  },
  {
    id: "3",
    name: "Fellowship Bracelet",
    price: 80,
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500",
  },
  {
    id: "4",
    name: "Study Materials",
    price: 300,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=500",
  },
  {
    id: "5",
    name: "Fellowship Hoodie",
    price: 850,
    isNew: true,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=500",
  },
];
