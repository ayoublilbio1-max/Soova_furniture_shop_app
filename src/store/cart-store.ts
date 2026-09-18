// Global cart + checkout state — line items, promo code, collected special
// offers, and the selected shipping address / shipping type / payment
// method. Persisted so a cart survives app restarts.
//
// NOTE: saved cards deliberately store only the last four digits, holder
// name, expiry and detected brand — never the full number, never the CVV.
// That mirrors how real payment UIs behave (the processor tokenizes the
// number and the app never keeps it) and avoids putting a full card number
// in device storage.
//
// lastOrder is a snapshot captured at the moment payment is confirmed —
// after that, the live cart clears (normal post-purchase behavior). It
// carries its own pre-computed totals rather than being recomputed by the
// screens that display it, so Review Summary / E-Receipt can never end up
// showing stale or empty numbers regardless of render timing.
//
// orders is the full order history (My Orders screen) — every completed
// order is appended here too, newest first, and never cleared. It's a
// separate array from lastOrder so History and the immediate post-purchase
// screens can't interfere with each other.

import { CODE_COUPONS, SPECIAL_COUPONS } from "@/data/coupons";
import { products } from "@/data/products";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type ShippingAddress = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
};

export type ShippingType = {
  id: string;
  name: string;
  fee: number;
  etaDays: number;
};

export type CardBrand = "visa" | "mastercard" | null;

export type SavedCard = {
  id: string;
  holderName: string;
  lastFour: string;
  expiry: string;

  // Optional keeps previously saved cards compatible with the new structure.
  // New cards will always save this value.
  brand?: CardBrand;
};

export type PaymentMethodId =
  | "cash"
  | "paypal"
  | "apple-pay"
  | "google-pay"
  | `card:${string}`;

export type PromoCode = {
  code: string;
  discount: number;
};

export type OrderTotals = {
  subTotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
};

export type CompletedOrder = {
  id: string;
  items: CartItem[];
  shippingTypeId: string;
  promo: PromoCode | null;
  addressId: string | null;
  paymentMethod: PaymentMethodId;
  placedAt: string;
  totals: OrderTotals;
};

// --- Promo codes derived from the same coupon data Shop's cards read, so
// the two can never disagree about amounts. ---
export const PROMO_CODES: PromoCode[] = CODE_COUPONS.map((c) => ({
  code: c.code,
  discount: c.amountOff,
}));

export const SHIPPING_TYPES: ShippingType[] = [
  { id: "economy", name: "Economy", fee: 15, etaDays: 7 },
  { id: "regular", name: "Regular", fee: 25, etaDays: 4 },
  { id: "express", name: "Express", fee: 40, etaDays: 2 },
];

export const TAX_RATE = 0.08;

// --- Demo addresses, matching the reference design ---
const SEED_ADDRESSES: ShippingAddress[] = [
  {
    id: "addr-home",
    label: "Home",
    street: "1901 Thornridge Cir.",
    city: "Shiloh",
    state: "Hawaii",
    zip: "81063",
  },
  {
    id: "addr-office",
    label: "Office",
    street: "4517 Washington Ave.",
    city: "Manchester",
    state: "Kentucky",
    zip: "39495",
  },
  {
    id: "addr-parents",
    label: "Parent's House",
    street: "8502 Preston Rd.",
    city: "Inglewood",
    state: "Maine",
    zip: "98380",
  },
  {
    id: "addr-friend",
    label: "Friend's House",
    street: "2464 Royal Ln.",
    city: "Mesa",
    state: "New Jersey",
    zip: "45463",
  },
];

// --- Demo saved card, so Payment Methods has something selectable out of
// the box during testing — no need to go through Add Card every time.
// Only the fields a real saved card would ever have (no full number/CVV).
const SEED_SAVED_CARDS: SavedCard[] = [
  {
    id: "card-demo-mastercard",
    holderName: "John Doe",
    lastFour: "4444",
    expiry: "12/29",
    brand: "mastercard",
  },
];

// --- Sum of collected special-offer discounts that are actually eligible
// given the current subtotal (each has its own minOrder threshold). ---
function eligibleSpecialDiscount(
  subTotal: number,
  collectedSpecialOfferIds: string[],
) {
  return SPECIAL_COUPONS.filter(
    (c) => collectedSpecialOfferIds.includes(c.id) && subTotal >= c.minOrder,
  ).reduce((sum, c) => sum + c.amountOff, 0);
}

type CartState = {
  items: CartItem[];
  addresses: ShippingAddress[];
  selectedAddressId: string | null;
  selectedShippingTypeId: string;
  savedCards: SavedCard[];
  selectedPaymentMethod: PaymentMethodId;
  appliedPromo: PromoCode | null;
  collectedSpecialOfferIds: string[];
  lastOrder: CompletedOrder | null;
  orders: CompletedOrder[];
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  addAddress: (address: Omit<ShippingAddress, "id">) => string;
  deleteAddress: (addressId: string) => void;
  selectAddress: (addressId: string) => void;
  selectShippingType: (shippingTypeId: string) => void;

  addCard: (card: Omit<SavedCard, "id">) => string;
  removeCard: (cardId: string) => void;
  selectPaymentMethod: (method: PaymentMethodId) => void;

  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  collectSpecialOffer: (couponId: string) => void;

  placeOrder: () => string;
  resetStore: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addresses: SEED_ADDRESSES,
      selectedAddressId: SEED_ADDRESSES[0].id,
      selectedShippingTypeId: "economy",
      savedCards: SEED_SAVED_CARDS,
      selectedPaymentMethod: "cash",
      appliedPromo: null,
      collectedSpecialOfferIds: [],
      lastOrder: null,
      orders: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      addToCart: (productId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }

          return {
            items: [...state.items, { productId, quantity }],
          };
        }),

      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity < 1) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            ),
          };
        }),

      clearCart: () =>
        set({
          items: [],
          appliedPromo: null,
        }),

      addAddress: (address) => {
        const id = `addr-${Date.now()}`;

        set((state) => ({
          addresses: [...state.addresses, { ...address, id }],
        }));

        return id;
      },

      deleteAddress: (addressId) =>
        set((state) => {
          const remaining = state.addresses.filter((a) => a.id !== addressId);

          const selectedAddressId =
            state.selectedAddressId === addressId
              ? (remaining[0]?.id ?? null)
              : state.selectedAddressId;

          return {
            addresses: remaining,
            selectedAddressId,
          };
        }),

      selectAddress: (addressId) =>
        set({
          selectedAddressId: addressId,
        }),

      selectShippingType: (shippingTypeId) =>
        set({
          selectedShippingTypeId: shippingTypeId,
        }),

      addCard: (card) => {
        const id = `card-${Date.now()}`;

        set((state) => ({
          savedCards: [
            ...state.savedCards,
            {
              ...card,
              id,
            },
          ],
          selectedPaymentMethod: `card:${id}` as PaymentMethodId,
        }));

        return id;
      },

      removeCard: (cardId) =>
        set((state) => ({
          savedCards: state.savedCards.filter((c) => c.id !== cardId),
          selectedPaymentMethod:
            state.selectedPaymentMethod === `card:${cardId}`
              ? "cash"
              : state.selectedPaymentMethod,
        })),

      selectPaymentMethod: (method) =>
        set({
          selectedPaymentMethod: method,
        }),

      applyPromo: (code) => {
        const match = PROMO_CODES.find(
          (p) => p.code.toLowerCase() === code.trim().toLowerCase(),
        );

        if (!match) return false;

        set({
          appliedPromo: match,
        });

        return true;
      },

      clearPromo: () =>
        set({
          appliedPromo: null,
        }),

      collectSpecialOffer: (couponId) =>
        set((state) =>
          state.collectedSpecialOfferIds.includes(couponId)
            ? state
            : {
                collectedSpecialOfferIds: [
                  ...state.collectedSpecialOfferIds,
                  couponId,
                ],
              },
        ),

      placeOrder: () => {
        const state = get();
        const orderId = `SV${Date.now()}`;

        // Computed inline (rather than via the shared cart-helpers module)
        // to avoid a circular import — cart-helpers itself reads from this
        // store. Duplicated math, but it's small and self-contained.
        const subTotal = state.items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId);

          return sum + (product ? product.price * item.quantity : 0);
        }, 0);

        const shippingType =
          SHIPPING_TYPES.find((t) => t.id === state.selectedShippingTypeId) ??
          SHIPPING_TYPES[0];

        const deliveryFee = state.items.length > 0 ? shippingType.fee : 0;

        const tax = subTotal * TAX_RATE;

        const promoDiscount = state.appliedPromo
          ? state.appliedPromo.discount
          : 0;

        const specialDiscount = eligibleSpecialDiscount(
          subTotal,
          state.collectedSpecialOfferIds,
        );

        const discount = Math.min(promoDiscount + specialDiscount, subTotal);

        const total = subTotal + deliveryFee + tax - discount;

        const order: CompletedOrder = {
          id: orderId,
          items: state.items,
          shippingTypeId: state.selectedShippingTypeId,
          promo: state.appliedPromo,
          addressId: state.selectedAddressId,
          paymentMethod: state.selectedPaymentMethod,
          placedAt: new Date().toISOString(),
          totals: {
            subTotal,
            deliveryFee,
            tax,
            discount,
            total,
          },
        };

        // Both discount sources are consumed once an order is placed.
        // orders is prepended (newest first) and never cleared, separate
        // from lastOrder which is just the immediate post-purchase snapshot.
        set({
          lastOrder: order,
          orders: [order, ...state.orders],
          items: [],
          appliedPromo: null,
          collectedSpecialOfferIds: [],
        });

        return orderId;
      },

      // --- Used by Settings > "Reset Demo Data". Wipes cart, orders,
      // saved cards, and promo state back to a fresh-install baseline.
      // Addresses reset to the seed list rather than being emptied, since
      // an address book with zero entries isn't a meaningful "fresh" state
      // for this app (Checkout always expects one to be selectable).
      resetStore: () =>
        set({
          items: [],
          addresses: SEED_ADDRESSES,
          selectedAddressId: SEED_ADDRESSES[0].id,
          selectedShippingTypeId: "economy",
          savedCards: SEED_SAVED_CARDS,
          selectedPaymentMethod: "cash",
          appliedPromo: null,
          collectedSpecialOfferIds: [],
          lastOrder: null,
          orders: [],
        }),
    }),
    {
      name: "soova-cart",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        items: state.items,
        addresses: state.addresses,
        selectedAddressId: state.selectedAddressId,
        selectedShippingTypeId: state.selectedShippingTypeId,
        savedCards: state.savedCards,
        selectedPaymentMethod: state.selectedPaymentMethod,
        appliedPromo: state.appliedPromo,
        collectedSpecialOfferIds: state.collectedSpecialOfferIds,
        lastOrder: state.lastOrder,
        orders: state.orders,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
