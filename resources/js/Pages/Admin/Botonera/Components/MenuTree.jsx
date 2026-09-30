import React from 'react';

import MenuItemCard from './MenuItemCard';

export default function MenuTree({
    items,
    level,
    openItems,
    toggleItem,
    toggleStatus,
    toggleQuickLink,
    quickLinksLimitReached,
    draggedItem,
    onDragStart,
    onDrop,
    onAddChild,
    onEdit,
    onDelete,
}) {
    return (
        <div
            className={
                level === 0
                    ? 'menu-tree'
                    : 'menu-tree-children'
            }
        >

            {items.map((item) => (

                <MenuItemCard
                    key={item.id}
                    item={item}
                    level={level}

                    isOpen={Boolean(
                        openItems[item.id]
                    )}

                    onToggle={() =>
                        toggleItem(item.id)
                    }

                    onToggleStatus={() =>
                        toggleStatus(item)
                    }

                    onToggleQuickLink={() =>
                        toggleQuickLink(item)
                    }

                    quickLinksLimitReached={
                        quickLinksLimitReached
                    }

                    draggedItem={draggedItem}

                    onDragStart={onDragStart}

                    onDrop={onDrop}

                    onAddChild={onAddChild}

                    onEdit={onEdit}

                    onDelete={onDelete}

                    openItems={openItems}
                    toggleItem={toggleItem}
                    toggleStatus={toggleStatus}
                    toggleQuickLink={toggleQuickLink}
                />

            ))}

        </div>
    );
}