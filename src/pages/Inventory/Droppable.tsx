import React from 'react';
import {useDroppable} from '@dnd-kit/core';

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function Droppable({id, children, className}: DroppableProps) {
  const {isOver, setNodeRef} = useDroppable({
    id,
  });
  
  const style = {
    backgroundColor: isOver ? 'rgba(0, 255, 0, 0.1)' : undefined,
    border: isOver ? '2px dashed green' : '2px dashed #ccc',
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children}
    </div>
  );
}