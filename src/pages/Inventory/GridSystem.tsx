// GridSystem.tsx
import React, { useState, ReactNode } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
  useDndContext,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

interface GridItem {
  id: UniqueIdentifier;
  content: ReactNode;
  // Add any other item properties you need
}

interface GridSystemProps {
  items: GridItem[];
  onItemsChange: (items: GridItem[]) => void;
  defaultColumnCount?: number;
  minColumns?: number;
  maxColumns?: number;
  renderItem?: (item: GridItem, isDragging: boolean) => ReactNode;
  gridType?: string;
}

export default function GridSystem({
  items,
  onItemsChange,
  defaultColumnCount = 4,
  minColumns = 3,
  maxColumns = 6,
  renderItem,
  gridType = "default",
}: GridSystemProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [columnCount, setColumnCount] = useState(defaultColumnCount);

  function handleDragStart({ active }: { active: { id: UniqueIdentifier } }) {
    setActiveId(active.id);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);

    // Only handle internal grid rearrangements
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onItemsChange(newItems);
      }
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className={`grid-system ${gridType}`}>
      <div className="grid-controls">
        <input
          type="range"
          value={columnCount}
          min={minColumns}
          max={maxColumns}
          onChange={(event) => {
            setColumnCount(Number(event.target.value));
          }}
        />
        <span>Columns: {columnCount}</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(item => item.id)}>
          <div
            className="grid-container"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              gap: "8px",
              padding: "16px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              minHeight: "200px",
            }}
            data-grid-type={gridType}
          >
            {items.map((item) => (
              <GridItemComponent
                key={item.id}
                item={item}
                activeId={activeId}
                renderItem={renderItem}
                gridType={gridType}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <DragOverlayItem 
              item={items.find(item => item.id === activeId)} 
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

interface GridItemComponentProps {
  item: GridItem;
  activeId: UniqueIdentifier | null;
  renderItem?: (item: GridItem, isDragging: boolean) => ReactNode;
  gridType?: string;
}

function GridItemComponent({ item, activeId, renderItem, gridType }: GridItemComponentProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({ id: item.id, data: { gridType } });

  return (
    <motion.div
      layoutId={item.id.toString()}
      transition={{
        type: "spring",
        duration: activeId ? 0 : 0.6,
      }}
      ref={setNodeRef}
      style={{
        cursor: "grab",
        opacity: isDragging ? 0.5 : 1,
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : "none",
        transition,
      }}
      {...attributes}
      {...listeners}
      data-item-id={item.id}
      data-grid-type={gridType}
    >
      {renderItem ? renderItem(item, isDragging) : (
        <div className="grid-item-default">
          {item.content}
        </div>
      )}
    </motion.div>
  );
}

function DragOverlayItem({ item }: { item?: GridItem }) {
  if (!item) return null;

  return (
    <div className="drag-overlay-item">
      {item.content}
    </div>
  );
}