export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  fullPath: string;
  thumbPath: string;
  createdAt: string;
  rating: number;
  salesCount: number;
  style?: "modern" | "vintage";
  salePercent?: number;
  isTopDeal?: boolean;
};

// NOTE: names, prices, ratings, sales counts, dates, style tags, and sale
// percentages are still placeholders — replace with your real product data
// whenever you're ready.
export const products: Product[] = [
  {
    id: "chair-01",
    name: "Chair 01",
    category: "chair",
    price: 180,
    fullPath: "chairs/chair_01/chair_01_a_full.webp",
    thumbPath: "chairs/chair_01/chair_01_a_thumb.webp",
    createdAt: "2026-08-20",
    rating: 4.6,
    salesCount: 42,
    style: "modern",
    salePercent: 20,
    isTopDeal: true,
  },
  {
    id: "chair-02",
    name: "Chair 02",
    category: "chair",
    price: 150,
    fullPath: "chairs/chair_02/chair_02_a_full.webp",
    thumbPath: "chairs/chair_02/chair_02_a_thumb.webp",
    createdAt: "2026-07-15",
    rating: 4.2,
    salesCount: 78,
    style: "vintage",
    salePercent: 69,
  },
  {
    id: "chair-03",
    name: "Chair 03",
    category: "chair",
    price: 165,
    fullPath: "chairs/chair_03/chair_03_a_full.webp",
    thumbPath: "chairs/chair_03/chair_03_a_thumb.webp",
    createdAt: "2026-08-22",
    rating: 4.9,
    salesCount: 15,
    style: "modern",
    isTopDeal: true,
  },
  {
    id: "chair-04",
    name: "Chair 04",
    category: "chair",
    price: 140,
    fullPath: "chairs/chair_04/chair_04_a_full.webp",
    thumbPath: "chairs/chair_04/chair_04_a_thumb.webp",
    createdAt: "2026-06-10",
    rating: 4.0,
    salesCount: 120,
    style: "vintage",
  },
  {
    id: "chair-05",
    name: "Chair 05",
    category: "chair",
    price: 175,
    fullPath: "chairs/chair_05/chair_05_a_full.webp",
    thumbPath: "chairs/chair_05/chair_05_a_thumb.webp",
    createdAt: "2026-08-05",
    rating: 4.7,
    salesCount: 33,
    style: "modern",
    salePercent: 15,
  },
  {
    id: "chair-06",
    name: "Chair 06",
    category: "chair",
    price: 190,
    fullPath: "chairs/chair_06/chair_06_a_full.webp",
    thumbPath: "chairs/chair_06/chair_06_a_thumb.webp",
    createdAt: "2026-05-28",
    rating: 3.9,
    salesCount: 95,
    style: "vintage",
    isTopDeal: true,
  },
  {
    id: "chair-07",
    name: "Luna Lounge Chair",
    category: "chair",
    price: 120,
    fullPath: "chairs/chair_07/chair_07_a_full.webp",
    thumbPath: "chairs/chair_07/chair_07_a_thumb.webp",
    createdAt: "2026-08-23",
    rating: 5.0,
    salesCount: 61,
    style: "modern",
    salePercent: 30,
    isTopDeal: true,
  },
  {
    id: "chair-08",
    name: "Chair 08",
    category: "chair",
    price: 155,
    fullPath: "chairs/chair_08/chair_08_a_full.webp",
    thumbPath: "chairs/chair_08/chair_08_a_thumb.webp",
    createdAt: "2026-04-12",
    rating: 4.4,
    salesCount: 150,
    style: "vintage",
  },
];
