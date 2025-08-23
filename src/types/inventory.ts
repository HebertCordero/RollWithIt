export type ItemSize = '1x1' | '2x1' | '1x2' | '2x2' | '2x3' | '3x2' | '3x3';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  size: ItemSize;
  position?: { x: number; y: number };
}

export interface InventoryGrid {
  width: number;
  height: number;
  items: InventoryItem[];
}