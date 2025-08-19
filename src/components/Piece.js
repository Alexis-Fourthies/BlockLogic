import React, { useRef, useEffect } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export default function Piece({
  shape,
  index,
  isSelected,
  hide,
  setDraggedPieceIndex,
}) {
  const dragOffset = useRef({ x: 0, y: 0 });

  const [{ isDragging }, drag, preview] = useDrag({
    type: "PIECE",
    item: () => {
      setDraggedPieceIndex && setDraggedPieceIndex(index);
      return { index, shape, dragOffset: dragOffset.current };
    },
    end: () => {
      setDraggedPieceIndex && setDraggedPieceIndex(null);
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  function handleMouseDown(e, x, y) {
    dragOffset.current = { x, y };
  }

  if (hide && isDragging) return null;
  if (hide)
    return (
      <div
        style={{
          width: shape[0].length * 32 + 16,
          height: shape.length * 32 + 16,
          margin: 8,
        }}
      />
    );

  return (
    <div
      ref={drag}
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${shape[0].length}, 32px)`,
        gridTemplateRows: `repeat(${shape.length}, 32px)`,
        gap: 4,
        margin: 8,
        cursor: isDragging ? "grabbing" : "grab",
        border: isSelected ? "3px solid #4a90e2" : "3px solid transparent",
        background: "transparent",
        opacity: isDragging ? 0.5 : 1,
        borderRadius: "8px",
      }}
    >
      {shape.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={x + "-" + y}
            style={{
              width: 32,
              height: 32,
              background: cell ? "#4a90e2" : "transparent",
              borderRadius: 4,
            }}
            onMouseDown={cell ? (e) => handleMouseDown(e, x, y) : undefined}
          />
        ))
      )}
    </div>
  );
}
