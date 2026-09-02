// Single source of truth for the sale coupons shown on the Shop screen.
// Special coupons (no `code`) apply automatically as a cart discount once
// collected. Coded coupons (`code` present) copy their code to the
// clipboard so it can be pasted into Cart's promo field instead.

export type Coupon = {
  id: string;
  amountOff: number;
  minOrder: number;
  code?: string;
};

export const SHOP_COUPONS: Coupon[] = [
  { id: "c1", amountOff: 10, minOrder: 50 },
  { id: "c2", amountOff: 8, minOrder: 20 },
  { id: "c3", amountOff: 50, minOrder: 400, code: "SOOVA55" },
  { id: "c4", amountOff: 3, minOrder: 30, code: "SOOVA10" },
];

export const SPECIAL_COUPONS = SHOP_COUPONS.filter((c) => !c.code);
export const CODE_COUPONS = SHOP_COUPONS.filter(
  (c): c is Coupon & { code: string } => !!c.code
);