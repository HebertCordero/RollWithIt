// Inventory.tsx
import React, { useState } from "react";
import GridSystem from "./GridSystem";
import { DndContext, type DragEndEvent, type useDroppable } from '@dnd-kit/core';

// Define types locally instead of importing
type ItemSize = '1x1' | '2x1' | '1x2' | '2x2' | '2x3' | '3x2' | '3x3';
interface SampleItem {
  id: string;
  title: string;
  color: string;
  size?: ItemSize;
}

export default function Inventory() {
  // Separate states for backpack and floor items
  const [backpackItems, setBackpackItems] = useState<SampleItem[]>([
    { id: "1", title: "apple", color: "#ff6b6b", size: "1x1" },
    { id: "2", title: "sword", color: "#4ecdc4", size: "2x1" },
    { id: "3", title: "water", color: "#45b7d1", size: "1x1" },
  ]);

  const [floorItems, setFloorItems] = useState<SampleItem[]>([
    { id: "4", title: "bannana", color: "#f9c74f", size: "1x1" },
    { id: "5", title: "herb", color: "#90be6d", size: "1x1" },
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Check if dragging between grids
    const sourceGrid = findItemGrid(active.id as string);
    const targetGrid = over.data?.current?.gridType || "backpack";

    if (sourceGrid && sourceGrid !== targetGrid) {
      // Move item between grids
      moveItemBetweenGrids(active.id as string, sourceGrid, targetGrid);
    }
  };

  const findItemGrid = (itemId: string): "backpack" | "floor" | null => {
    if (backpackItems.some(item => item.id === itemId)) return "backpack";
    if (floorItems.some(item => item.id === itemId)) return "floor";
    return null;
  };

  const moveItemBetweenGrids = (itemId: string, from: "backpack" | "floor", to: "backpack" | "floor") => {
    if (from === to) return;

    const sourceItems = from === "backpack" ? backpackItems : floorItems;
    const targetItems = to === "backpack" ? backpackItems : floorItems;
    const setSource = from === "backpack" ? setBackpackItems : setFloorItems;
    const setTarget = to === "backpack" ? setBackpackItems : setFloorItems;

    const itemToMove = sourceItems.find(item => item.id === itemId);
    if (!itemToMove) return;

    // Remove from source
    setSource(sourceItems.filter(item => item.id !== itemId));
    // Add to target
    setTarget([...targetItems, itemToMove]);
  };

  const renderItem = (item: SampleItem, isDragging: boolean) => (
    <div
      className="dndItem"
      style={{
        padding: "5px",
        backgroundColor: item.color,
        borderRadius: "8px",
        color: "white",
        fontWeight: "bold",
        opacity: isDragging ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {item.title}
    </div>
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="inventory-container">
        <h1>Inventory System</h1>
        
        <div className="inventory-section">
          <h2>Backpack</h2>
          <GridSystem
            items={backpackItems}
            onItemsChange={setBackpackItems}
            defaultColumnCount={4}
            minColumns={3}
            maxColumns={6}
            renderItem={renderItem}
            gridType="backpack"
          />
        </div>

        <div className="inventory-section">
          <h2>Floor</h2>
          <GridSystem
            items={floorItems}
            onItemsChange={setFloorItems}
            defaultColumnCount={6}
            minColumns={4}
            maxColumns={8}
            renderItem={renderItem}
            gridType="floor"
          />
        </div>
      </div>
    </DndContext>
  );
}