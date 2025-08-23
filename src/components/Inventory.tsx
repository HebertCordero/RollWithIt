import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { createSnapModifier } from '@dnd-kit/modifiers';
import { type InventoryItem as InventoryItemType } from '../types/inventory';
import InventoryGrid from './InventoryGrid';
import InventoryItem from './InventoryItem';
import ItemModal from './ItemModal';

interface InventoryProps {
  onUpdate: (items: InventoryItemType[]) => void;
}

export default function Inventory({ onUpdate }: InventoryProps) {
  const [items, setItems] = useState<InventoryItemType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemType | null>(null);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const gridSize = 30;
  const snapToGrid = useMemo(() => createSnapModifier(gridSize), [gridSize]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && over.id === 'inventory-grid') {
      // Item was dropped on the grid
      const item = items.find(item => item.id === active.id);
      if (item) {
        // Calculate grid position based on drop coordinates
        const rect = over.rect.current;
        if (rect) {
          const x = Math.floor((event.delta.x + rect.left) / (gridSize * 2)) * (gridSize * 2);
          const y = Math.floor((event.delta.y + rect.top) / (gridSize * 2)) * (gridSize * 2);
          
          setItems(prev => prev.map(i => 
            i.id === active.id ? { ...i, position: { x, y } } : i
          ));
        }
      }
    }
  };

  const handleCreateItem = (itemData: Omit<InventoryItemType, 'id'>) => {
    const newItem: InventoryItemType = {
      ...itemData,
      id: Date.now().toString(),
    };
    
    setItems(prev => [...prev, newItem]);
    onUpdate([...items, newItem]);
    setIsModalOpen(false);
  };

  const handleUpdateItem = (itemData: InventoryItemType) => {
    setItems(prev => prev.map(item => 
      item.id === itemData.id ? itemData : item
    ));
    onUpdate(items.map(item => item.id === itemData.id ? itemData : item));
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    onUpdate(items.filter(item => item.id !== id));
    setEditingItem(null);
  };

  const activeItem = items.find(item => item.id === activeId);

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory</h2>
        <button 
          className="add-item-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Item
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[snapToGrid]}
      >
        <div className="inventory-content">
          {/* Available Items (outside backpack) */}
          <div className="available-items">
            <h3>Available Items</h3>
            <div className="items-list">
              {items.filter(item => !item.position).map((item) => (
                <InventoryItem
                  key={item.id}
                  item={item}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Backpack Grid */}
          <div className="backpack-section">
            <h3>Backpack (5x5)</h3>
            <InventoryGrid 
              items={items.filter(item => item.position)}
              gridSize={gridSize}
              rows={5}
              columns={5}
            />
          </div>
        </div>
      </DndContext>

      {/* Modals */}
      {isModalOpen && (
        <ItemModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateItem}
        />
      )}
      
      {editingItem && (
        <ItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleUpdateItem}
          onDelete={() => handleDeleteItem(editingItem.id)}
        />
      )}
    </div>
  );
}