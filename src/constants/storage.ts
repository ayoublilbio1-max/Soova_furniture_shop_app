const SUPABASE_BASE_URL =
  "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images";
const CLOUDFLARE_BASE_URL =
  "https://pub-e5c0dd26c2e74f5686552a5198a41513.r2.dev";

export function getSupabaseImageUrl(path: string) {
  return `${SUPABASE_BASE_URL}/${path}`;
}

export function getCloudflareImageUrl(path: string) {
  return `${CLOUDFLARE_BASE_URL}/${path}`;
}
