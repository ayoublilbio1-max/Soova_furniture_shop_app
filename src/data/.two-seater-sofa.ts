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
  fallbackVideoPath?: string;
  createdAt: string;
  rating: number;
  salesCount: number;
  style?: "modern" | "vintage";
  salePercent?: number;
  isTopDeal?: boolean;
};

const BASE_URL =
  "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/two_seater_sofa";
const CLOUDFLARE_BASE =
  "https://pub-e5c0dd26c2e74f5686552a5198a41513.r2.dev/two_seater_sofa";

export const twoSeaterSofas: Product[] = [
  {
    id: "sofa-01",
    name: "Classic Velvet Two-Seater Sofa",
    category: "two_seater_sofa",
    price: 580,
    fullPath: `${BASE_URL}/sofa_01/product_01_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_01/product_01_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE}/sofa_01/product_01_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE}/sofa_01/product_01_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_01/product_01_a_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_01/product_01_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_01/product_01_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_01/product_01_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_01/product_01_b_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_01/product_01_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_01/product_01_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_01/product_01_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_01/product_01_c_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_c_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_01/product_01_c_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_01/product_01_c_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_01/product_01_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_01/product_01_d_full.webp`,
        medium: `${BASE_URL}/sofa_01/product_01_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_01/product_01_d_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_01/product_01_d_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_01/product_01_d_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_01/product_01_d_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.8,
    salesCount: 45,
    style: "vintage",
  },
  {
    id: "sofa-02",
    name: "Cozy Boucle Loveseat with Wooden Base",
    category: "two_seater_sofa",
    price: 620,
    fullPath: `${BASE_URL}/sofa_02/product_02_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_02/product_02_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE}/sofa_02/product_02_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE}/sofa_02/product_02_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_02/product_02_a_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/product_02_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/product_02_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/product_02_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_02/product_02_b_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/product_02_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/product_02_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/product_02_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_02/product_02_c_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_c_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/product_02_c_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/product_02_c_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/product_02_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_02/product_02_d_full.webp`,
        medium: `${BASE_URL}/sofa_02/product_02_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/product_02_d_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/product_02_d_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/product_02_d_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/product_02_d_thumb.webp`,
      },
    ],
    colorVariants: [
      {
        color: "black",
        full: `${BASE_URL}/sofa_02/color_black_full.webp`,
        medium: `${BASE_URL}/sofa_02/color_black_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/color_black_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/color_black_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/color_black_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/color_black_thumb.webp`,
      },
      {
        color: "blue_sky",
        full: `${BASE_URL}/sofa_02/color_blue_sky_full.webp`,
        medium: `${BASE_URL}/sofa_02/color_blue_sky_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/color_blue_sky_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/color_blue_sky_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/color_blue_sky_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/color_blue_sky_thumb.webp`,
      },
      {
        color: "caramel",
        full: `${BASE_URL}/sofa_02/color_caramel_full.webp`,
        medium: `${BASE_URL}/sofa_02/color_caramel_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/color_caramel_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/color_caramel_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/color_caramel_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/color_caramel_thumb.webp`,
      },
      {
        color: "yellow",
        full: `${BASE_URL}/sofa_02/color_yellow_full.webp`,
        medium: `${BASE_URL}/sofa_02/color_yellow_medium.webp`,
        thumb: `${BASE_URL}/sofa_02/color_yellow_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_02/color_yellow_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_02/color_yellow_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_02/color_yellow_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.9,
    salesCount: 78,
    style: "modern",
    salePercent: 15,
    isTopDeal: true,
  },
  {
    id: "sofa-03",
    name: "Minimalist Two-Seater Sofa with Round Legs",
    category: "two_seater_sofa",
    price: 550,
    fullPath: `${BASE_URL}/sofa_03/product_03_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_03/product_03_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE}/sofa_03/product_03_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE}/sofa_03/product_03_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_03/product_03_a_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_03/product_03_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_03/product_03_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_03/product_03_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_03/product_03_b_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_03/product_03_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_03/product_03_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_03/product_03_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_03/product_03_c_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_c_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_03/product_03_c_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_03/product_03_c_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_03/product_03_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_03/product_03_d_full.webp`,
        medium: `${BASE_URL}/sofa_03/product_03_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/product_03_d_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_03/product_03_d_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_03/product_03_d_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_03/product_03_d_thumb.webp`,
      },
    ],
    colorVariants: [
      {
        color: "beige",
        full: `${BASE_URL}/sofa_03/color_beige_full.webp`,
        medium: `${BASE_URL}/sofa_03/color_beige_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/color_beige_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_03/color_beige_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_03/color_beige_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_03/color_beige_thumb.webp`,
      },
      {
        color: "coffe",
        full: `${BASE_URL}/sofa_03/color_coffe_full.webp`,
        medium: `${BASE_URL}/sofa_03/color_coffe_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/color_coffe_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_03/color_coffe_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_03/color_coffe_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_03/color_coffe_thumb.webp`,
      },
      {
        color: "dark_caramel",
        full: `${BASE_URL}/sofa_03/color_dark_caramel_full.webp`,
        medium: `${BASE_URL}/sofa_03/color_dark_caramel_medium.webp`,
        thumb: `${BASE_URL}/sofa_03/color_dark_caramel_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_03/color_dark_caramel_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_03/color_dark_caramel_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_03/color_dark_caramel_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.7,
    salesCount: 39,
    style: "modern",
  },
  {
    id: "sofa-04",
    name: "Modern Curved Accent Loveseat",
    category: "two_seater_sofa",
    price: 640,
    fullPath: `${BASE_URL}/sofa_04/product_04_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_04/product_04_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE}/sofa_04/product_04_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE}/sofa_04/product_04_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_04/product_04_a_full.webp`,
        medium: `${BASE_URL}/sofa_04/product_04_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/product_04_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_04/product_04_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_04/product_04_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_04/product_04_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_04/product_04_b_full.webp`,
        medium: `${BASE_URL}/sofa_04/product_04_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/product_04_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_04/product_04_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_04/product_04_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_04/product_04_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_04/product_04_c_full.webp`,
        medium: `${BASE_URL}/sofa_04/product_04_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/product_04_c_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_04/product_04_c_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_04/product_04_c_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_04/product_04_c_thumb.webp`,
      },
    ],
    colorVariants: [
      {
        color: "red",
        full: `${BASE_URL}/sofa_04/color_red_full.webp`,
        medium: `${BASE_URL}/sofa_04/color_red_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/color_red_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_04/color_red_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_04/color_red_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_04/color_red_thumb.webp`,
      },
      {
        color: "yellowish",
        full: `${BASE_URL}/sofa_04/color_yellowish_full.webp`,
        medium: `${BASE_URL}/sofa_04/color_yellowish_medium.webp`,
        thumb: `${BASE_URL}/sofa_04/color_yellowish_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_04/color_yellowish_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_04/color_yellowish_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_04/color_yellowish_thumb.webp`,
      },
    ],
    createdAt: "2026-08-19",
    rating: 4.8,
    salesCount: 52,
    style: "modern",
  },
  {
    id: "sofa-05",
    name: "Luxe Low-Profile Boucle Two-Seater",
    category: "two_seater_sofa",
    price: 690,
    fullPath: `${BASE_URL}/sofa_05/product_05_a_full.webp`,
    thumbPath: `${BASE_URL}/sofa_05/product_05_a_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE}/sofa_05/product_05_a_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE}/sofa_05/product_05_a_thumb.webp`,
    images: [
      {
        angle: "a",
        full: `${BASE_URL}/sofa_05/product_05_a_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_a_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_05/product_05_a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_05/product_05_a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_05/product_05_a_thumb.webp`,
      },
      {
        angle: "b",
        full: `${BASE_URL}/sofa_05/product_05_b_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_b_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_05/product_05_b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_05/product_05_b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_05/product_05_b_thumb.webp`,
      },
      {
        angle: "c",
        full: `${BASE_URL}/sofa_05/product_05_c_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_c_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_c_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_05/product_05_c_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_05/product_05_c_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_05/product_05_c_thumb.webp`,
      },
      {
        angle: "d",
        full: `${BASE_URL}/sofa_05/product_05_d_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_d_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_d_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_05/product_05_d_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_05/product_05_d_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_05/product_05_d_thumb.webp`,
      },
      {
        angle: "e",
        full: `${BASE_URL}/sofa_05/product_05_e_full.webp`,
        medium: `${BASE_URL}/sofa_05/product_05_e_medium.webp`,
        thumb: `${BASE_URL}/sofa_05/product_05_e_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE}/sofa_05/product_05_e_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE}/sofa_05/product_05_e_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE}/sofa_05/product_05_e_thumb.webp`,
      },
    ],
    videoPath: `${BASE_URL}/sofa_05/video`,
    fallbackVideoPath: `${CLOUDFLARE_BASE}/sofa_05/video`,
    createdAt: "2026-08-19",
    rating: 5.0,
    salesCount: 84,
    style: "modern",
    salePercent: 20,
    isTopDeal: true,
  },
];
