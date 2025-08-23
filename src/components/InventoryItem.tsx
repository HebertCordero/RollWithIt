import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { type InventoryItem as InventoryItemType } from '../types/inventory';

interface InventoryItemProps {
  item: InventoryItemType;
  onEdit: () => void;
  onDelete: () => void;
}

export default function InventoryItem({ item, onEdit, onDelete }: InventoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: item.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`inventory-item ${isDragging ? 'dragging' : ''}`}
    >
      <div className="item-content">
        <span className="item-name">{item.name}</span>
        <span className="item-quantity">x{item.quantity}</span>
        <div className="item-actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }}>Edit</button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>Delete</button>
        </div>
      </div>
    </div>
  );
}