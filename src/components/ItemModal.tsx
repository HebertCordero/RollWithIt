import React, { useState, useEffect } from 'react';
import { type InventoryItem, type ItemSize } from '../types/inventory';

interface ItemModalProps {
  item?: InventoryItem;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id'> | InventoryItem) => void;
  onDelete?: () => void;
}

const itemSizes: ItemSize[] = ['1x1', '2x1', '1x2', '2x2', '2x3', '3x2', '3x3'];

export default function ItemModal({ item, onClose, onSave, onDelete }: ItemModalProps) {
  const [name, setName] = useState(item?.name || '');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [description, setDescription] = useState(item?.description || '');
  const [size, setSize] = useState<ItemSize>(item?.size || '1x1');

  useEffect(() => {
    if (item) {
      setName(item.name);
      setQuantity(item.quantity);
      setDescription(item.description);
      setSize(item.size);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name,
      quantity,
      description,
      size,
    };

    if (item) {
      onSave({ ...itemData, id: item.id });
    } else {
      onSave(itemData);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{item ? 'Edit Item' : 'Create Item'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Size:</label>
            <select value={size} onChange={(e) => setSize(e.target.value as ItemSize)}>
              {itemSizes.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="submit">Save</button>
            {onDelete && (
              <button type="button" onClick={onDelete} className="delete-btn">
                Delete
              </button>
            )}
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}