import React from "react";
import { useDrop } from "react-dnd";
import styles from "./Board.module.css";

const SIZE = 9;

function Cell({
  x,
  y,
  value,
  onDrop,
  canPlacePiece,
  previewShape,
  previewOrigin,
  canDropPreview,
  setDragOverBoard,
  handleDragOver,
  disappearing,
}) {
  // Bordures sudoku : fines par défaut, épaisses autour des blocs 3x3
  let style = {
    width: 36,
    height: 36,
    background: value ? "#4a90e2" : "#fff",
    borderTop: y % 3 === 0 ? "3px solid #000" : "1px solid #bbb",
    borderLeft: x % 3 === 0 ? "3px solid #000" : "1px solid #bbb",
    borderRight: x === 8 ? "3px solid #000" : undefined,
    borderBottom: y === 8 ? "3px solid #000" : undefined,
    boxSizing: "border-box",
    cursor: "pointer",
    transition: "background 0.1s",
  };

  // Prévisualisation de la forme entière
  let isPreview = false;
  if (previewShape && previewOrigin) {
    const [ox, oy] = previewOrigin;
    for (let sy = 0; sy < previewShape.length; sy++) {
      for (let sx = 0; sx < previewShape[0].length; sx++) {
        if (previewShape[sy][sx] && x === ox + sx && y === oy + sy) {
          isPreview = true;
        }
      }
    }
  }
  if (isPreview && canDropPreview) {
    style.background = "#b3e5fc";
    style.opacity = 0.7;
  } else if (isPreview && !canDropPreview) {
    style.background = "#ffcdd2";
    style.opacity = 0.7;
  }

  // Animation disparition
  let className = "";
  if (disappearing && disappearing[y] && disappearing[y][x]) {
    className = styles.disappear;
  }

  // Drop target react-dnd
  const [{ isOver }, drop] = useDrop({
    accept: "PIECE",
    drop: (item) => {
      if (canPlacePiece) {
        const originX = x - (item.dragOffset ? item.dragOffset.x : 0);
        const originY = y - (item.dragOffset ? item.dragOffset.y : 0);
        if (canPlacePiece(item.shape, originY, originX)) {
          onDrop(item.index, originY, originX);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover: (item, monitor) => {
      setDragOverBoard && setDragOverBoard(true);
      handleDragOver && handleDragOver(item, x, y);
    },
  });

  return (
    <div
      ref={drop}
      style={style}
      className={className}
      onMouseLeave={() => setDragOverBoard && setDragOverBoard(false)}
    />
  );
}

export default function Board({
  grid,
  onDrop,
  canPlacePiece,
  setDragOverBoard,
  draggedPieceIndex,
  setDraggedPieceIndex,
  disappearing,
}) {
  const [preview, setPreview] = React.useState(null);
  const [canDropPreview, setCanDropPreview] = React.useState(false);
  const [currentDragIndex, setCurrentDragIndex] = React.useState(null);

  // Gestion du drag sur la grille
  const handleDragOver = React.useCallback(
    (item, x, y) => {
      if (!item) {
        setPreview(null);
        setCanDropPreview(false);
        setCurrentDragIndex(null);
        return;
      }
      const originX = x - (item.dragOffset ? item.dragOffset.x : 0);
      const originY = y - (item.dragOffset ? item.dragOffset.y : 0);
      setPreview({ shape: item.shape, origin: [originX, originY] });
      setCanDropPreview(canPlacePiece(item.shape, originY, originX));
      setCurrentDragIndex(item.index);
    },
    [canPlacePiece]
  );

  React.useEffect(() => {
    const handleUp = () => {
      setPreview(null);
      setCanDropPreview(false);
      setDragOverBoard && setDragOverBoard(false);
      setCurrentDragIndex(null);
    };
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, [setDragOverBoard]);

  // On ne prévisualise la forme que si c'est la bonne pièce
  const previewShape =
    draggedPieceIndex === currentDragIndex
      ? preview
        ? preview.shape
        : null
      : null;
  const previewOrigin =
    draggedPieceIndex === currentDragIndex
      ? preview
        ? preview.origin
        : null
      : null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${SIZE}, 36px)`,
        gridTemplateRows: `repeat(${SIZE}, 36px)`,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px #0002",
        border: "3px solid #000",
        margin: 24,
        width: 36 * 9,
        height: 36 * 9,
      }}
    >
      {grid.map((row, y) =>
        row.map((cell, x) => (
          <Cell
            key={x + "-" + y}
            x={x}
            y={y}
            value={cell}
            onDrop={onDrop}
            canPlacePiece={canPlacePiece}
            previewShape={previewShape}
            previewOrigin={previewOrigin}
            canDropPreview={canDropPreview}
            setDragOverBoard={setDragOverBoard}
            handleDragOver={handleDragOver}
            disappearing={disappearing}
          />
        ))
      )}
    </div>
  );
}
