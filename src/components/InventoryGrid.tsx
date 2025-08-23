import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { type InventoryItem as InventoryItemType } from '../types/inventory';

interface InventoryGridProps {
  items: InventoryItemType[];
  gridSize: number;
  rows: number;
  columns: number;
}

export default function InventoryGrid({ items, gridSize, rows, columns }: InventoryGridProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'inventory-grid',
  });

  return (
    <div
      ref={setNodeRef}
      className={`inventory-grid ${isOver ? 'drop-over' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, ${gridSize * 2}px)`,
        gridTemplateRows: `repeat(${rows}, ${gridSize * 2}px)`,
        gap: '1px',
        backgroundColor: '#ccc',
        padding: '2px',
        position: 'relative',
      }}
    >
      {/* Grid cells */}
      {Array.from({ length: rows * columns }).map((_, index) => (
        <div
          key={index}
          className="grid-cell"
          style={{
            width: gridSize * 2,
            height: gridSize * 2,
            backgroundColor: 'white',
            border: '1px solid #ddd',
          }}
        />
      ))}
      
      {/* Items positioned on grid */}
      {items.map((item) => (
        <div
          key={item.id}
          className="grid-item"
          style={{
            position: 'absolute',
            left: item.position?.x || 0,
            top: item.position?.y || 0,
            width: getItemWidth(item.size, gridSize),
            height: getItemHeight(item.size, gridSize),
            backgroundColor: '#ffd700',
            border: '2px solid #daa520',
            padding: '4px',
          }}
        >
          {item.name} ({item.quantity})
        </div>
      ))}
    </div>
  );
}

// Helper functions
const getItemWidth = (size: string, gridSize: number): number => {
  const [width] = size.split('x').map(Number);
  return width * gridSize * 2;
};

const getItemHeight = (size: string, gridSize: number): number => {
  const [, height] = size.split('x').map(Number);
  return height * gridSize * 2;
};