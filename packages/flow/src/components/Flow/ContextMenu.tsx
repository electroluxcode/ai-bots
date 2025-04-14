import { useState, useCallback, useEffect, useRef } from 'react';

interface ContextMenuProps {
  nodeId: string;
  top: number;
  left: number;
  onClose: () => void;
  onDelete: (nodeId: string) => void;
}

export const ContextMenu = ({ nodeId, top, left, onClose, onDelete }: ContextMenuProps): JSX.Element => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  const handleDelete = useCallback(() => {
    onDelete(nodeId);
    onClose();
  }, [nodeId, onDelete, onClose]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  return (
    <div 
      ref={menuRef}
      className="absolute bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
      style={{ top, left }}
    >
      <button 
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
        onClick={handleDelete}
      >
        <span className="mr-2">🗑️</span> 删除节点
      </button>
    </div>
  );
}; 