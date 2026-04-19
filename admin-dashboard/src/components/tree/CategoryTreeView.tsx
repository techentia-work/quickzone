// @/components/CategoryTreeView.tsx
"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { CategoryType } from "@/lib/types";

interface CategoryTreeViewProps {
  categories: CategoryType[];
  onView?: (category: CategoryType) => void;
  onEdit?: (category: CategoryType) => void;
  onDelete?: (category: CategoryType) => void;
  enableDragDrop?: boolean;
  onMove?: (categoryId: string, newParentId: string | null, newOrder: number) => Promise<void>;
}

interface TreeNodeProps {
  category: CategoryType;
  level: number;
  onView?: (category: CategoryType) => void;
  onEdit?: (category: CategoryType) => void;
  onDelete?: (category: CategoryType) => void;
  enableDragDrop?: boolean;
  onDragStart: (category: CategoryType) => void;
  onDragOver: (e: React.DragEvent, category: CategoryType) => void;
  onDrop: (category: CategoryType) => void;
  onDragEnd: () => void;
  isDragOver: boolean;
  dragPosition: 'before' | 'after' | null;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  category,
  level,
  onView,
  onEdit,
  onDelete,
  enableDragDrop,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragOver,
  dragPosition,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  const typeColors = {
    MASTER: "bg-purple-100 text-purple-700 border-purple-200",
    SUPER: "bg-blue-100 text-blue-700 border-blue-200",
    CATEGORY: "bg-green-100 text-green-700 border-green-200",
    SUBCATEGORY: "bg-orange-100 text-orange-700 border-orange-200",
    LEVEL_5: "bg-orange-100 text-orange-700 border-orange-200",
    LEVEL_6: "bg-orange-100 text-orange-700 border-orange-200",
    LEVEL_7: "bg-orange-100 text-orange-700 border-orange-200",
  };

  return (
    <div className="select-none">
      {/* Drop indicator - BEFORE */}
      {isDragOver && dragPosition === 'before' && (
        <div className="h-1 bg-blue-500 rounded-full mx-3 my-1" 
             style={{ marginLeft: `${level * 24 + 12}px` }} />
      )}

      <div
        draggable={enableDragDrop}
        onDragStart={(e) => {
          if (enableDragDrop) {
            e.stopPropagation();
            onDragStart(category);
          }
        }}
        onDragOver={(e) => {
          if (enableDragDrop) {
            e.preventDefault();
            e.stopPropagation();
            onDragOver(e, category);
          }
        }}
        onDrop={(e) => {
          if (enableDragDrop) {
            e.preventDefault();
            e.stopPropagation();
            onDrop(category);
          }
        }}
        onDragEnd={onDragEnd}
        className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all group ${
          enableDragDrop ? "cursor-move" : ""
        } hover:bg-gray-50`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {/* Drag Handle */}
        {enableDragDrop && (
          <div className="cursor-grab active:cursor-grabbing opacity-100 transition-opacity">
            <GripVertical size={16} className="text-gray-400" />
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
          disabled={!hasChildren}
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown size={16} className="text-gray-600" />
            ) : (
              <ChevronRight size={16} className="text-gray-600" />
            )
          ) : (
            <span className="w-4" />
          )}
        </button>

        {/* Order Number */}
        <span className="text-xs text-gray-500 font-mono w-8 text-center flex-shrink-0">
          {category.order}
        </span>

        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {category.thumbnail ? (
            <Image
              src={category.thumbnail}
              alt={category.name}
              width={32}
              height={32}
              className="object-cover rounded"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs text-gray-400">📁</span>
            </div>
          )}
        </div>

        {/* Category Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {category.name}
            </span>
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded border ${
                typeColors[category.type]
              }`}
            >
              {category.type}
            </span>
          </div>
          <div className="text-xs text-gray-500 truncate">{category.slug}</div>
        </div>

        {/* Status Badge */}
        <div className="flex-shrink-0">
          {category.isActive ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Active
            </span>
          ) : (
            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
              Inactive
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {onView && (
            <button
              onClick={() => onView(category)}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors"
              title="View Details"
            >
              <Eye size={14} className="text-gray-600" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 hover:bg-blue-100 rounded transition-colors"
              title="Edit"
            >
              <Edit size={14} className="text-blue-600" />
            </button>
          )}
          {onDelete && !category.isDeleted && (
            <button
              onClick={() => onDelete(category)}
              className="p-1.5 hover:bg-red-100 rounded transition-colors"
              title="Delete"
            >
              <Trash2 size={14} className="text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Drop indicator - AFTER */}
      {isDragOver && dragPosition === 'after' && (
        <div className="h-1 bg-blue-500 rounded-full mx-3 my-1" 
             style={{ marginLeft: `${level * 24 + 12}px` }} />
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <TreeNode
              key={child._id}
              category={child}
              level={level + 1}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              enableDragDrop={enableDragDrop}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              isDragOver={false}
              dragPosition={null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTreeView: React.FC<CategoryTreeViewProps> = ({
  categories,
  onView,
  onEdit,
  onDelete,
  enableDragDrop = false,
  onMove,
}) => {
  const [sortByOriginalOrder, setSortByOriginalOrder] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<CategoryType | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | null>(null);

  const handleDragStart = (category: CategoryType) => {
    setDraggedCategory(category);
  };

  const handleDragOver = (e: React.DragEvent, category: CategoryType) => {
    e.preventDefault();
    
    if (!draggedCategory || draggedCategory._id === category._id) return;

    // Check if same parent (same level)
    const draggedParent = draggedCategory.parent?._id?.toString() || null;
    const targetParent = category.parent?._id?.toString() || null;
    
    if (draggedParent !== targetParent) return;

    // Determine position based on mouse Y position
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const midPoint = rect.top + rect.height / 2;
    const position = e.clientY < midPoint ? 'before' : 'after';

    setDragOverCategory(category._id);
    setDragPosition(position);
  };

  const handleDrop = async (targetCategory: CategoryType) => {
    if (!draggedCategory || draggedCategory._id === targetCategory._id) {
      resetDragState();
      return;
    }

    // Verify same parent
    const draggedParent = draggedCategory.parent?._id?.toString() || null;
    const targetParent = targetCategory.parent?._id?.toString() || null;

    if (draggedParent !== targetParent) {
      alert("❌ Can only reorder within the same level!");
      resetDragState();
      return;
    }

    console.log("=== REORDERING ===");
    console.log("Dragged:", draggedCategory.name, "Order:", draggedCategory.order);
    console.log("Target:", targetCategory.name, "Order:", targetCategory.order);
    console.log("Position:", dragPosition);

    // Calculate new order
    let newOrder: number;
    
    if (dragPosition === 'before') {
      // Place before target
      newOrder = targetCategory.order;
    } else {
      // Place after target
      newOrder = targetCategory.order + 1;
    }

    console.log("New Order:", newOrder);

    if (onMove) {
      try {
        await onMove(draggedCategory._id, draggedParent, newOrder);
      } catch (error) {
        console.error("Failed to reorder:", error);
        alert("❌ Failed to reorder category");
      }
    }

    resetDragState();
  };

  const handleDragEnd = () => {
    resetDragState();
  };

  const resetDragState = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
    setDragPosition(null);
  };

  const sortedCategories = sortByOriginalOrder
    ? [...categories].sort((a, b) => a.order - b.order)
    : categories;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Category Tree</h3>
          {enableDragDrop && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              🔄 Drag to Reorder
            </span>
          )}
        </div>
        <button
          onClick={() => setSortByOriginalOrder(!sortByOriginalOrder)}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          {sortByOriginalOrder ? "Current Order" : "Sort by Original Order"}
        </button>
      </div>

      {/* Tree Content */}
      <div className="overflow-y-auto max-h-[calc(100vh-300px)] thin-scrollbar">
        {sortedCategories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="py-2">
            {sortedCategories.map((category) => (
              <TreeNode
                key={category._id}
                category={category}
                level={0}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                enableDragDrop={enableDragDrop}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                isDragOver={dragOverCategory === category._id}
                dragPosition={dragOverCategory === category._id ? dragPosition : null}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Total:{" "}
            {categories.reduce((acc, cat) => {
              const countChildren = (c: CategoryType): number => {
                return (
                  1 +
                  (c.children?.reduce(
                    (sum, child) => sum + countChildren(child),
                    0
                  ) || 0)
                );
              };
              return acc + countChildren(cat);
            }, 0)}{" "}
            categories
          </span>
          <span>Root level: {categories.length}</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryTreeView;