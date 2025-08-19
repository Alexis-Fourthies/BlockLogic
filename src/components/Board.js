import React from "react";
import { useDrop } from "react-dnd";
import styles from "./Board.module.css";

const SIZE = 9;
const CELL_SIZE = 55; // Taille des cellules pour desktop

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
    width: "100%",
    height: "100%",
    background: value ? "#4a90e2" : "#fff",
    borderTop: y % 3 === 0 ? "3px solid #000" : "1px solid #bbb",
    borderLeft: x % 3 === 0 ? "3px solid #000" : "1px solid #bbb",
    borderRight: x === SIZE - 1 ? "3px solid #000" : "1px solid #bbb",
    borderBottom: y === SIZE - 1 ? "3px solid #000" : "1px solid #bbb",
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
    style.opacity = 0.8;
    style.boxShadow = "0 0 0 2px #4a90e2";
  } else if (isPreview && !canDropPreview) {
    style.background = "#ffcdd2";
    style.opacity = 0.8;
    style.boxShadow = "0 0 0 2px #e57373";
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
  isGameOver,
  handleRestart,
  score,
  bestScore,
  globalBest,
  isClient,
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
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${SIZE}, 1fr)`,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 16px #0002",
          margin: "24px auto",
          width: CELL_SIZE * 9,
          height: CELL_SIZE * 9,
          position: "relative",
          filter: isGameOver ? "blur(3px)" : "none",
          transition: "filter 0.3s ease",
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
      {isGameOver && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.95)",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              fontWeight: "700",
              color: "#e53935",
              marginBottom: "28px",
              letterSpacing: "-0.02em",
            }}
          >
            Perdu !
          </div>
          <button
            onClick={handleRestart}
            style={{
              fontSize: "1.3rem",
              fontWeight: "600",
              padding: "16px 40px",
              borderRadius: "12px",
              border: "none",
              background: "#4a90e2",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#357abd";
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 16px rgba(74, 144, 226, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#4a90e2";
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(74, 144, 226, 0.3)";
            }}
          >
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}
