export type ProductImage = {
  angle: string;
  full: string;
  medium: string;
  thumb: string;
  fallbackFull?: string;
  fallbackMedium?: string;
  fallbackThumb?: string;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  fullPath: string;
  thumbPath: string;
  fallbackFullPath?: string;
  fallbackThumbPath?: string;
  images: ProductImage[];
  createdAt: string;
  rating: number;
  salesCount: number;
  style?: "modern" | "vintage";
  salePercent?: number;
  isTopDeal?: boolean;
};

const SUPABASE_BASE_URL =
  "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/lamp";
const CLOUDFLARE_BASE_URL =
  "https://pub-e5c0dd26c2e74f5686552a5198a41513.r2.dev/lamp";

export const lamps: Product[] = [
  {
    id: "lamp-01",
    name: "Olive Ceramic Table Lamp with Wooden Base",
    category: "lamp",
    price: 180,
    fullPath: `${SUPABASE_BASE_URL}/product_01/lamp_a_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_01/lamp_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_01/lamp_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_01/lamp_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${SUPABASE_BASE_URL}/product_01/lamp_a_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_01/lamp_a_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_01/lamp_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_01/lamp_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_01/lamp_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_01/lamp_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${SUPABASE_BASE_URL}/product_01/lamp_b_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_01/lamp_b_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_01/lamp_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_01/lamp_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_01/lamp_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_01/lamp_b_thumb.webp`,
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.8,
    salesCount: 46,
    style: "modern",
  },
  {
    id: "lamp-02",
    name: "Classic Velvet Shade Brass Table Lamp",
    category: "lamp",
    price: 210,
    fullPath: `${SUPABASE_BASE_URL}/product_02/lamp_a_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_02/lamp_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_02/lamp_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_02/lamp_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${SUPABASE_BASE_URL}/product_02/lamp_a_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_02/lamp_a_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_02/lamp_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_02/lamp_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_02/lamp_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_02/lamp_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${SUPABASE_BASE_URL}/product_02/lamp_b_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_02/lamp_b_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_02/lamp_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_02/lamp_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_02/lamp_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_02/lamp_b_thumb.webp`,
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.9,
    salesCount: 62,
    style: "vintage",
    salePercent: 15,
    isTopDeal: true,
  },
  {
    id: "lamp-03",
    name: "Woven Rattan Cylindrical Table Lamp",
    category: "lamp",
    price: 165,
    fullPath: `${SUPABASE_BASE_URL}/product_03/lamp_a_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_03/lamp_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_03/lamp_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_03/lamp_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${SUPABASE_BASE_URL}/product_03/lamp_a_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_03/lamp_a_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_03/lamp_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_03/lamp_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_03/lamp_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_03/lamp_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${SUPABASE_BASE_URL}/product_03/lamp_b_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_03/lamp_b_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_03/lamp_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_03/lamp_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_03/lamp_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_03/lamp_b_thumb.webp`,
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.7,
    salesCount: 34,
    style: "modern",
  },
  {
    id: "lamp-04",
    name: "Amber Glass Minimalist Table Lamp",
    category: "lamp",
    price: 195,
    fullPath: `${SUPABASE_BASE_URL}/product_04/lamp_a_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_04/lamp_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_04/lamp_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_04/lamp_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${SUPABASE_BASE_URL}/product_04/lamp_a_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_04/lamp_a_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_04/lamp_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_04/lamp_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_04/lamp_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_04/lamp_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${SUPABASE_BASE_URL}/product_04/lamp_b_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_04/lamp_b_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_04/lamp_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_04/lamp_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_04/lamp_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_04/lamp_b_thumb.webp`,
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.8,
    salesCount: 41,
    style: "modern",
    salePercent: 10,
    isTopDeal: true,
  },
  {
    id: "lamp-05",
    name: "Modern Dome Accent Desk Lamp",
    category: "lamp",
    price: 145,
    fullPath: `${SUPABASE_BASE_URL}/product_05/lamp_a_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_05/lamp_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_05/lamp_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_05/lamp_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${SUPABASE_BASE_URL}/product_05/lamp_a_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_05/lamp_a_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_05/lamp_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_05/lamp_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_05/lamp_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_05/lamp_a_thumb.webp`,
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.6,
    salesCount: 29,
    style: "modern",
  },
  {
    id: "lamp-06",
    name: "Luxe Velvet Cylindrical Bedside Lamp",
    category: "lamp",
    price: 220,
    fullPath: `${SUPABASE_BASE_URL}/product_06/lamp_a_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_06/lamp_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_06/lamp_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_06/lamp_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${SUPABASE_BASE_URL}/product_06/lamp_a_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_06/lamp_a_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_06/lamp_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_06/lamp_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_06/lamp_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_06/lamp_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${SUPABASE_BASE_URL}/product_06/lamp_b_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_06/lamp_b_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_06/lamp_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_06/lamp_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_06/lamp_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_06/lamp_b_thumb.webp`,
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.9,
    salesCount: 55,
    style: "modern",
    salePercent: 20,
    isTopDeal: true,
  },
  {
    id: "lamp-07",
    name: "Turned Wooden Heritage Table Lamp",
    category: "lamp",
    price: 190,
    fullPath: `${SUPABASE_BASE_URL}/product_07/lamp_a_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_07/lamp_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_07/lamp_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_07/lamp_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${SUPABASE_BASE_URL}/product_07/lamp_a_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_07/lamp_a_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_07/lamp_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_07/lamp_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_07/lamp_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_07/lamp_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${SUPABASE_BASE_URL}/product_07/lamp_b_full.webp`,
        medium: `${SUPABASE_BASE_URL}/product_07/lamp_b_medium.webp`,
        thumb: `${SUPABASE_BASE_URL}/product_07/lamp_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_07/lamp_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_07/lamp_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_07/lamp_b_thumb.webp`,
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.7,
    salesCount: 38,
    style: "vintage",
  },
];
