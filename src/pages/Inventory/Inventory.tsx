// App.tsx
import React, { useState } from "react";
import GridSystem from "./GridSystem";

import './Inventory.css'

interface SampleItem {
  id: string;
  title: string;
  color: string;
}

export default function Inventory() {
  const [items, setItems] = useState<SampleItem[]>([
    { id: "1", title: "apple", color: "#ff6b6b" },
    { id: "2", title: "sword", color: "#4ecdc4" },
    { id: "3", title: "water", color: "#45b7d1" },
    { id: "4", title: "bannana", color: "#f9c74f" },
    { id: "5", title: "herb", color: "#90be6d" },
    // Add more items...
  ]);

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
    <div>
      <h1>My Grid System</h1>
      <GridSystem
        items={items}
        onItemsChange={setItems}
        defaultColumnCount={3}
        minColumns={2}
        maxColumns={5}
        renderItem={renderItem}
      />
    </div>
  );
}