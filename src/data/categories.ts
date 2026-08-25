export type Category = {
  id: string;
  name: string;
  icon: "sofa" | "chair-rolling" | "floor-lamp" | "wardrobe-outline";
};

export const categories: Category[] = [
  { id: "sofa", name: "Sofa", icon: "sofa" },
  { id: "chair", name: "Chair", icon: "chair-rolling" },
  { id: "lamp", name: "Lamp", icon: "floor-lamp" },
  { id: "cupboard", name: "Cupboard", icon: "wardrobe-outline" },
];
