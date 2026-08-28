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

const SUPABASE_BASE_URL = "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/cupboard";
const CLOUDFLARE_BASE_URL = "https://pub-e5c0dd26c2e74f5686552a5198a41513.r2.dev/cupboard";

export const cupboards: Product[] = [
  {
    id: "cupboard-01",
    name: "Classic Walnut Wooden Sideboard",
    category: "cupboard",
    price: 720,
    fullPath: `${SUPABASE_BASE_URL}/product_01/cupboard1_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_01/cupboard1_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1_thumb.webp`,
    images: [
      { 
        angle: "", 
        full: `${SUPABASE_BASE_URL}/product_01/cupboard1_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_01/cupboard1_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_01/cupboard1_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1_thumb.webp`
      },
      { 
        angle: "a", 
        full: `${SUPABASE_BASE_URL}/product_01/cupboard1a_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_01/cupboard1a_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_01/cupboard1a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1a_thumb.webp`
      },
      { 
        angle: "b", 
        full: `${SUPABASE_BASE_URL}/product_01/cupboard1b_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_01/cupboard1b_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_01/cupboard1b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_01/cupboard1b_thumb.webp`
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.8,
    salesCount: 42,
    style: "vintage",
  },
  {
    id: "cupboard-02",
    name: "Ribbed Wood Media Credenza",
    category: "cupboard",
    price: 780,
    fullPath: `${SUPABASE_BASE_URL}/product_02/cupboard2_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_02/cupboard2_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2_thumb.webp`,
    images: [
      { 
        angle: "", 
        full: `${SUPABASE_BASE_URL}/product_02/cupboard2_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_02/cupboard2_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_02/cupboard2_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2_thumb.webp`
      },
      { 
        angle: "a", 
        full: `${SUPABASE_BASE_URL}/product_02/cupboard2a_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_02/cupboard2a_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_02/cupboard2a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2a_thumb.webp`
      },
      { 
        angle: "b", 
        full: `${SUPABASE_BASE_URL}/product_02/cupboard2b_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_02/cupboard2b_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_02/cupboard2b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_02/cupboard2b_thumb.webp`
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.9,
    salesCount: 65,
    style: "modern",
    salePercent: 10,
    isTopDeal: true,
  },
  {
    id: "cupboard-03",
    name: "Boucle Accent Storage Cabinet",
    category: "cupboard",
    price: 650,
    fullPath: `${SUPABASE_BASE_URL}/product_03/cupboard3_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_03/cupboard3_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3_thumb.webp`,
    images: [
      { 
        angle: "", 
        full: `${SUPABASE_BASE_URL}/product_03/cupboard3_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_03/cupboard3_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_03/cupboard3_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3_thumb.webp`
      },
      { 
        angle: "a", 
        full: `${SUPABASE_BASE_URL}/product_03/cupboard3a_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_03/cupboard3a_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_03/cupboard3a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3a_thumb.webp`
      },
      { 
        angle: "b", 
        full: `${SUPABASE_BASE_URL}/product_03/cupboard3b_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_03/cupboard3b_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_03/cupboard3b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_03/cupboard3b_thumb.webp`
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.7,
    salesCount: 38,
    style: "modern",
  },
  {
    id: "cupboard-04",
    name: "Deep Mahogany Modern Sideboard",
    category: "cupboard",
    price: 810,
    fullPath: `${SUPABASE_BASE_URL}/product_04/cupboard4_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_04/cupboard4_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4_thumb.webp`,
    images: [
      { 
        angle: "", 
        full: `${SUPABASE_BASE_URL}/product_04/cupboard4_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_04/cupboard4_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_04/cupboard4_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4_thumb.webp`
      },
      { 
        angle: "a", 
        full: `${SUPABASE_BASE_URL}/product_04/cupboard4a_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_04/cupboard4a_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_04/cupboard4a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4a_thumb.webp`
      },
      { 
        angle: "b", 
        full: `${SUPABASE_BASE_URL}/product_04/cupboard4b_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_04/cupboard4b_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_04/cupboard4b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_04/cupboard4b_thumb.webp`
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.9,
    salesCount: 51,
    style: "vintage",
  },
  {
    id: "cupboard-05",
    name: "Rust Orange Modern Minimalist Cupboard",
    category: "cupboard",
    price: 690,
    fullPath: `${SUPABASE_BASE_URL}/product_05/cupboard5_full.webp`,
    thumbPath: `${SUPABASE_BASE_URL}/product_05/cupboard5_thumb.webp`,
    fallbackFullPath: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5_full.webp`,
    fallbackThumbPath: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5_thumb.webp`,
    images: [
      { 
        angle: "", 
        full: `${SUPABASE_BASE_URL}/product_05/cupboard5_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_05/cupboard5_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_05/cupboard5_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5_thumb.webp`
      },
      { 
        angle: "a", 
        full: `${SUPABASE_BASE_URL}/product_05/cupboard5a_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_05/cupboard5a_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_05/cupboard5a_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5a_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5a_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5a_thumb.webp`
      },
      { 
        angle: "b", 
        full: `${SUPABASE_BASE_URL}/product_05/cupboard5b_full.webp`, 
        medium: `${SUPABASE_BASE_URL}/product_05/cupboard5b_medium.webp`, 
        thumb: `${SUPABASE_BASE_URL}/product_05/cupboard5b_thumb.webp`,
        fallbackFull: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5b_full.webp`,
        fallbackMedium: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5b_medium.webp`,
        fallbackThumb: `${CLOUDFLARE_BASE_URL}/product_05/cupboard5b_thumb.webp`
      },
    ],
    createdAt: "2026-08-27",
    rating: 4.8,
    salesCount: 59,
    style: "modern",
    salePercent: 15,
    isTopDeal: true,
  },
];