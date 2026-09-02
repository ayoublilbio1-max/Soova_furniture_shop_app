// Shared cart calculations. Every screen that shows money (cart, checkout,
// review summary, e-receipt) reads from here so the numbers can never
// disagree between screens.

import { SPECIAL_COUPONS } from "@/data/coupons";
import { Product, products } from "@/data/products";
import {
  CartItem,
  PromoCode,
  SHIPPING_TYPES,
  TAX_RATE,
} from "@/store/cart-store";

export type CartLine = {
  product: Product;
  quantity: number;
  lineTotal: number;
};

export function buildCartLines(items: CartItem[]): CartLine[] {
  return items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter((line): line is CartLine => line !== null);
}

export function getShippingType(shippingTypeId: string) {
  return (
    SHIPPING_TYPES.find((t) => t.id === shippingTypeId) ?? SHIPPING_TYPES[0]
  );
}

export type CartTotals = {
  subTotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
};

export function calculateTotals(
  lines: CartLine[],
  shippingTypeId: string,
  promo: PromoCode | null,
  collectedSpecialOfferIds: string[] = [],
): CartTotals {
  const subTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const deliveryFee =
    lines.length > 0 ? getShippingType(shippingTypeId).fee : 0;
  const tax = subTotal * TAX_RATE;

  const promoDiscount = promo ? promo.discount : 0;
  const specialDiscount = SPECIAL_COUPONS.filter(
    (c) => collectedSpecialOfferIds.includes(c.id) && subTotal >= c.minOrder,
  ).reduce((sum, c) => sum + c.amountOff, 0);
  const discount = Math.min(promoDiscount + specialDiscount, subTotal);

  const total = subTotal + deliveryFee + tax - discount;

  return { subTotal, deliveryFee, tax, discount, total };
}

export function getEstimatedArrival(shippingTypeId: string): Date {
  const days = getShippingType(shippingTypeId).etaDays;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export function formatAddress(
  street: string,
  city: string,
  state: string,
  zip: string,
) {
  return `${street} ${city}, ${state} ${zip}`;
}
