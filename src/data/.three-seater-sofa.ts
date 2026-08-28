export type ProductImage = {
  angle: string;
  full: string;
  medium: string;
  thumb: string;
  fallbackFull?: string;
  fallbackMedium?: string;
  fallbackThumb?: string;
};

export type ProductColorVariant = {
  color: string;
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
  colorVariants?: ProductColorVariant[];
  videoPath?: string;
  createdAt: string;
  rating: number;
  salesCount: number;
  style?: "modern" | "vintage";
  salePercent?: number;
  isTopDeal?: boolean;
};

const BASE_URL =
  "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/three_seater_sofa";
const FALLBACK_BASE_URL =
  "https://pub-e5c0dd26c2e74f5686552a5198a41513.r2.dev/three_seater_sofa";

export const threeSeaterSofas: Product[] = [
  {
    id: "sofa-01",
    name: "Luxe Modular U-Shaped Sectional Sofa",
    category: "three_seater_sofa",
    price: 850,
    fullPath: `${BASE_URL}/sofa_01/product_01_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_01/product_01_a_thumb.webp`,
    fallbackFullPath: `${FALLBACK_BASE_URL}/sofa_01/product_01_a_full.webp`,
    fallbackThumbPath: `${FALLBACK_BASE_URL}/sofa_01/product_01_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_01/product_01_a_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_a_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_01/product_01_a_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_01/product_01_a_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_01/product_01_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_01/product_01_b_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_b_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_01/product_01_b_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_01/product_01_b_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_01/product_01_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_01/product_01_c_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_c_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_01/product_01_c_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_01/product_01_c_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_01/product_01_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_01/product_01_d_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_d_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_01/product_01_d_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_01/product_01_d_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_01/product_01_d_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.9,
    salesCount: 42,
    style: "modern",
    salePercent: 15,
    isTopDeal: true,
  },
  {
    id: "sofa-02",
    name: "Contemporary Low-Profile Sofa with Integrated Storage",
    category: "three_seater_sofa",
    price: 790,
    fullPath: `${BASE_URL}/sofa_02/product_02_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_02/product_02_a_thumb.webp`,
    fallbackFullPath: `${FALLBACK_BASE_URL}/sofa_02/product_02_a_full.webp`,
    fallbackThumbPath: `${FALLBACK_BASE_URL}/sofa_02/product_02_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_02/product_02_a_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_a_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_02/product_02_a_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_02/product_02_a_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_02/product_02_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_02/product_02_b_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_b_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_02/product_02_b_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_02/product_02_b_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_02/product_02_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_02/product_02_c_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_c_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_02/product_02_c_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_02/product_02_c_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_02/product_02_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_02/product_02_d_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_d_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_02/product_02_d_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_02/product_02_d_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_02/product_02_d_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.7,
    salesCount: 36,
    style: "modern",
  },
  {
    id: "sofa-03",
    name: "Classic Wooden Trim Three-Seater Sofa",
    category: "three_seater_sofa",
    price: 680,
    fullPath: `${BASE_URL}/sofa_03/product_03_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_03/product_03_a_thumb.webp`,
    fallbackFullPath: `${FALLBACK_BASE_URL}/sofa_03/product_03_a_full.webp`,
    fallbackThumbPath: `${FALLBACK_BASE_URL}/sofa_03/product_03_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_03/product_03_a_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_a_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_03/product_03_a_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_03/product_03_a_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_03/product_03_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_03/product_03_b_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_b_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_03/product_03_b_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_03/product_03_b_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_03/product_03_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_03/product_03_c_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_c_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_03/product_03_c_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_03/product_03_c_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_03/product_03_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_03/product_03_d_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_d_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_03/product_03_d_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_03/product_03_d_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_03/product_03_d_thumb.webp`,
      },
    ],
    colorVariants: [
      {
        color: "black",
        full: `${BASE_URL}/sofa_03/color_black_full.webp`,
        medium: `${BASE_URL}/sofa_03/color_black_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/color_black_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_03/color_black_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_03/color_black_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_03/color_black_thumb.webp`,
      },
      {
        color: "navy_blue",
        full: `${BASE_URL}/sofa_03/color_navy_blue_full.webp`,
        medium: `${BASE_URL}/sofa_03/color_navy_blue_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/color_navy_blue_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_03/color_navy_blue_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_03/color_navy_blue_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_03/color_navy_blue_thumb.webp`,
      },
      {
        color: "wine",
        full: `${BASE_URL}/sofa_03/color_wine_full.webp`,
        medium: `${BASE_URL}/sofa_03/color_wine_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/color_wine_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_03/color_wine_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_03/color_wine_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_03/color_wine_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.8,
    salesCount: 59,
    style: "vintage",
    salePercent: 10,
    isTopDeal: true,
  },
  {
    id: "sofa-04",
    name: "Curved Two-Tone Boucle & Leather Sectional",
    category: "three_seater_sofa",
    price: 890,
    fullPath: `${BASE_URL}/sofa_04/product_04_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_04/product_04_a_thumb.webp`,
    fallbackFullPath: `${FALLBACK_BASE_URL}/sofa_04/product_04_a_full.webp`,
    fallbackThumbPath: `${FALLBACK_BASE_URL}/sofa_04/product_04_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_04/product_04_a_full.webp`,
        medium: `${BASE_URL}/sofa_04/product_04_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/product_04_a_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_04/product_04_a_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_04/product_04_a_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_04/product_04_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_04/product_04_b_full.webp`,
        medium: `${BASE_URL}/sofa_04/product_04_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/product_04_b_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_04/product_04_b_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_04/product_04_b_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_04/product_04_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_04/product_04_c_full.webp`,
        medium: `${BASE_URL}/sofa_04/product_04_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/product_04_c_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_04/product_04_c_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_04/product_04_c_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_04/product_04_c_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.9,
    salesCount: 28,
    style: "modern",
  },
  {
    id: "sofa-05",
    name: "Serpentine Curved Modular Lounge Sofa",
    category: "three_seater_sofa",
    price: 920,
    fullPath: `${BASE_URL}/sofa_05/product_05_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_05/product_05_a_thumb.webp`,
    fallbackFullPath: `${FALLBACK_BASE_URL}/sofa_05/product_05_a_full.webp`,
    fallbackThumbPath: `${FALLBACK_BASE_URL}/sofa_05/product_05_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_05/product_05_a_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_a_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_05/product_05_a_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_05/product_05_a_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_05/product_05_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_05/product_05_b_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_b_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_05/product_05_b_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_05/product_05_b_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_05/product_05_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_05/product_05_c_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_c_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_05/product_05_c_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_05/product_05_c_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_05/product_05_c_thumb.webp`,
      },
    ],
    colorVariants: [
      {
        color: "gray",
        full: `${BASE_URL}/sofa_05/color_gray_05_full.webp`,
        medium: `${BASE_URL}/sofa_05/color_gray_05_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/color_gray_05_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_05/color_gray_05_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_05/color_gray_05_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_05/color_gray_05_thumb.webp`,
      },
      {
        color: "navy_blue",
        full: `${BASE_URL}/sofa_05/color_navy_blue_05_full.webp`,
        medium: `${BASE_URL}/sofa_05/color_navy_blue_05_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/color_navy_blue_05_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_05/color_navy_blue_05_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_05/color_navy_blue_05_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_05/color_navy_blue_05_thumb.webp`,
      },
      {
        color: "wine",
        full: `${BASE_URL}/sofa_05/color_wine_05_full.webp`,
        medium: `${BASE_URL}/sofa_05/color_wine_05_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/color_wine_05_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_05/color_wine_05_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_05/color_wine_05_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_05/color_wine_05_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.8,
    salesCount: 61,
    style: "modern",
    salePercent: 20,
    isTopDeal: true,
  },
  {
    id: "sofa-06",
    name: "Low-Profile Striped Velvet Modular Sofa",
    category: "three_seater_sofa",
    price: 740,
    fullPath: `${BASE_URL}/sofa_06/product_06_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_06/product_06_a_thumb.webp`,
    fallbackFullPath: `${FALLBACK_BASE_URL}/sofa_06/product_06_a_full.webp`,
    fallbackThumbPath: `${FALLBACK_BASE_URL}/sofa_06/product_06_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_06/product_06_a_full.webp`,
        medium: `${BASE_URL}/sofa_06/product_06_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_06/product_06_a_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_06/product_06_a_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_06/product_06_a_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_06/product_06_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_06/product_06_b_full.webp`,
        medium: `${BASE_URL}/sofa_06/product_06_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_06/product_06_b_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_06/product_06_b_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_06/product_06_b_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_06/product_06_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_06/product_06_c_full.webp`,
        medium: `${BASE_URL}/sofa_06/product_06_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_06/product_06_c_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_06/product_06_c_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_06/product_06_c_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_06/product_06_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_06/product_06_d_full.webp`,
        medium: `${BASE_URL}/sofa_06/product_06_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_06/product_06_d_thumb.webp`,
        fallbackFull: `${FALLBACK_BASE_URL}/sofa_06/product_06_d_full.webp`,
        fallbackMedium: `${FALLBACK_BASE_URL}/sofa_06/product_06_d_medium.webp`,
        fallbackThumb: `${FALLBACK_BASE_URL}/sofa_06/product_06_d_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.6,
    salesCount: 34,
    style: "modern",
  },
];
