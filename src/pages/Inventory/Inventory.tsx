import React, { useState } from "react";
import { DndContext, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { Droppable } from './Droppable';
import { Draggable } from './Draggable';
import './Inventory.css';

interface SampleItem {
  id: string;
  title: string;
  color: string;
}

export default function Inventory() {
  const [backpackItems, setBackpackItems] = useState<SampleItem[]>([
    { id: "1", title: "apple", color: "#ff6b6b" },
    { id: "2", title: "sword", color: "#4ecdc4" },
    { id: "3", title: "water", color: "#45b7d1" },
  ]);

  const [floorItems, setFloorItems] = useState<SampleItem[]>([
    { id: "4", title: "bannana", color: "#f9c74f" },
    { id: "5", title: "herb", color: "#90be6d" },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const itemId = active.id as string;
    const targetContainerId = over.id as string;

    // Find which container the item is currently in
    const sourceContainer = findItemContainer(itemId);
    
    if (sourceContainer && sourceContainer !== targetContainerId) {
      moveItemBetweenContainers(itemId, sourceContainer, targetContainerId);
    }
  };

  const findItemContainer = (itemId: string): string | null => {
    if (backpackItems.some(item => item.id === itemId)) return 'backpack';
    if (floorItems.some(item => item.id === itemId)) return 'floor';
    return null;
  };

  const moveItemBetweenContainers = (itemId: string, from: string, to: string) => {
    let sourceItems: SampleItem[];
    let setSource: React.Dispatch<React.SetStateAction<SampleItem[]>>;
    let targetItems: SampleItem[];
    let setTarget: React.Dispatch<React.SetStateAction<SampleItem[]>>;

    if (from === 'backpack') {
      sourceItems = backpackItems;
      setSource = setBackpackItems;
    } else {
      sourceItems = floorItems;
      setSource = setFloorItems;
    }

    if (to === 'backpack') {
      targetItems = backpackItems;
      setTarget = setBackpackItems;
    } else {
      targetItems = floorItems;
      setTarget = setFloorItems;
    }

    const itemToMove = sourceItems.find(item => item.id === itemId);
    if (!itemToMove) return;

    // Remove from source
    setSource(sourceItems.filter(item => item.id !== itemId));
    // Add to target
    setTarget([...targetItems, itemToMove]);
  };

  const renderItem = (item: SampleItem) => (
    <div
      className="dndItem"
      style={{
        backgroundColor: item.color,
      }}
    >
      {item.title}
    </div>
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="inventory-container">
        <h1>Inventory System</h1>
        
        <div className="inventory-section">
          <h2>Backpack</h2>
          <Droppable id="backpack" className="grid-container backpack-grid">
            {backpackItems.map((item) => (
              <Draggable key={item.id} id={item.id}>
                {renderItem(item)}
              </Draggable>
            ))}
            {backpackItems.length === 0 && <div className="empty-state">Drop items here</div>}
          </Droppable>
        </div>

        <div className="inventory-section">
          <h2>Floor</h2>
          <Droppable id="floor" className="grid-container floor-grid">
            {floorItems.map((item) => (
              <Draggable key={item.id} id={item.id}>
                {renderItem(item)}
              </Draggable>
            ))}
            {floorItems.length === 0 && <div className="empty-state">Drop items here</div>}
          </Droppable>
        </div>

        {/* Active drag overlay */}
        {activeId && (
          <div className="drag-overlay">
            {renderItem(
              [...backpackItems, ...floorItems].find(item => item.id === activeId)!
            )}
          </div>
        )}
      </div>
    </DndContext>
  );
}