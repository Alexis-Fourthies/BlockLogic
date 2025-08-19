import React, { useState, useRef } from "react";

const SIZE = 9;
const CELL_SIZE = 36; // Augmenté de 32 à 36 pour un plateau plus grand

export default function BoardMobile({
  grid,
  setGrid,
  pieces,
  setPieces,
  score,
  setScore,
  bestScore,
  setBestScore,
  globalBest,
  setGlobalBest,
  isGameOver,
  handleRestart,
  canPlace,
  clearFull,
  getRandomPieces,
  isClient,
}) {
  const [dragPiece, setDragPiece] = useState(null); // { shape, index, offsetX, offsetY }
  const [dragPos, setDragPos] = useState(null); // { x, y } en px
  const [previewCell, setPreviewCell] = useState(null); // { row, col }
  const boardRef = useRef();
  const dragPieceRef = useRef(null);
  const dragPosRef = useRef(null);
  const startTouchRef = useRef(null);
  const hasMovedRef = useRef(false);
  const [tick, setTick] = useState(0); // pour forcer le re-render

  // Démarre le drag
  function handleTouchStartPiece(e, index) {
    if (!pieces[index]) return;
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    const piece = {
      shape: pieces[index],
      index,
      offsetX: touch.clientX - rect.left,
      offsetY: touch.clientY - rect.top,
    };
    dragPieceRef.current = piece;
    dragPosRef.current = { x: touch.clientX, y: touch.clientY };
    startTouchRef.current = { x: touch.clientX, y: touch.clientY };
    hasMovedRef.current = false;
    setPreviewCell(null);
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    setTick((t) => t + 1); // force le rendu pour afficher le drag visuel dès le début
    handleTouchMove(e); // simule le premier mouvement pour afficher la forme sous le doigt
    setTick((t) => t + 1); // force un second rendu pour garantir l'affichage
  }

  // Suit le doigt
  function handleTouchMove(e) {
    if (!dragPieceRef.current) return;
    const touch = e.touches[0];
    dragPosRef.current = { x: touch.clientX, y: touch.clientY };
    // Détecte si le doigt a bougé d'au moins 3px
    if (startTouchRef.current) {
      const dx = touch.clientX - startTouchRef.current.x;
      const dy = touch.clientY - startTouchRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedRef.current = true;
      }
    }
    setTick((t) => t + 1); // force le rendu à chaque move
    // Calculer la case survolée
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      const cellSize = rect.width / SIZE; // Calculer la taille réelle des cellules
      const x = Math.floor(
        (touch.clientX -
          rect.left -
          dragPieceRef.current.offsetX +
          cellSize / 2) /
          cellSize
      );
      const y = Math.floor(
        (touch.clientY -
          rect.top -
          dragPieceRef.current.offsetY -
          dragPieceRef.current.shape.length * cellSize +
          cellSize / 2) /
          cellSize
      );
      if (
        x >= 0 &&
        y >= 0 &&
        y + dragPieceRef.current.shape.length <= SIZE &&
        x + dragPieceRef.current.shape[0].length <= SIZE
      ) {
        setPreviewCell({ y, x });
      } else {
        setPreviewCell(null);
      }
    }
  }

  // Fin du drag
  function handleTouchEnd(e) {
    if (!dragPieceRef.current) return;
    // Si le doigt n'a pas bougé, ce n'est pas un drag effectif : on nettoie tout
    if (!hasMovedRef.current) {
      dragPieceRef.current = null;
      dragPosRef.current = null;
      setPreviewCell(null);
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      window.removeEventListener("touchmove", handleTouchMove, false);
      window.removeEventListener("touchend", handleTouchEnd, false);
      window.removeEventListener("touchcancel", handleTouchEnd, false);
      setTick((t) => t + 1);
      return;
    }
    if (
      previewCell &&
      canPlace(grid, dragPieceRef.current.shape, previewCell.y, previewCell.x)
    ) {
      // Place la forme
      let newGrid = grid.map((r) => r.slice());
      for (let sy = 0; sy < dragPieceRef.current.shape.length; sy++) {
        for (let sx = 0; sx < dragPieceRef.current.shape[0].length; sx++) {
          if (dragPieceRef.current.shape[sy][sx]) {
            newGrid[previewCell.y + sy][previewCell.x + sx] = 1;
          }
        }
      }
      const { newGrid: clearedGrid, cleared } = clearFull(newGrid);
      setGrid(clearedGrid);
      if (cleared > 0) setScore((s) => s + cleared);
      const newPieces = pieces.slice();
      newPieces[dragPieceRef.current.index] = null;
      setPieces(newPieces);
      if (newPieces.every((p) => p === null)) {
        setTimeout(() => setPieces(getRandomPieces()), 300);
      }
    }
    dragPieceRef.current = null;
    dragPosRef.current = null;
    setTick((t) => t + 1); // force le re-render pour masquer le drag visuel
    setPreviewCell(null);
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    window.removeEventListener("touchmove", handleTouchMove, false);
    window.removeEventListener("touchend", handleTouchEnd, false);
    window.removeEventListener("touchcancel", handleTouchEnd, false);
    setTick((t) => t + 1); // force le rendu pour cacher le drag visuel
  }

  // Calcul de la prévisualisation
  let canDrop = false;
  const pieceForPreview = dragPieceRef.current;
  if (
    pieceForPreview &&
    previewCell &&
    previewCell.y >= 0 &&
    previewCell.x >= 0 &&
    previewCell.y + pieceForPreview.shape.length <= SIZE &&
    previewCell.x + pieceForPreview.shape[0].length <= SIZE
  ) {
    canDrop = canPlace(
      grid,
      pieceForPreview.shape,
      previewCell.y,
      previewCell.x
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: CELL_SIZE * SIZE,
        margin: "0 auto",
        touchAction: "none",
        userSelect: "none",
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <div
        ref={boardRef}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${SIZE}, 1fr)`,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 16px #0002",
          margin: "8px auto",
          width: "100%",
          aspectRatio: "1",
          position: "relative",
          touchAction: "none",
          userSelect: "none",
          filter: isGameOver ? "blur(3px)" : "none",
          transition: "filter 0.3s ease",
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => {
            // Bordures sudoku
            let style = {
              width: "100%",
              height: "100%",
              background: cell ? "#4a90e2" : "#fff",
              borderTop: y % 3 === 0 ? "3px solid #000" : "0.5px solid #bbb",
              borderLeft: x % 3 === 0 ? "3px solid #000" : "0.5px solid #bbb",
              borderRight:
                x === SIZE - 1 ? "3px solid #000" : "0.5px solid #bbb",
              borderBottom:
                y === SIZE - 1 ? "3px solid #000" : "0.5px solid #bbb",
              boxSizing: "border-box",
              transition: "background 0.1s",
            };
            // Prévisualisation
            if (
              pieceForPreview &&
              previewCell &&
              y >= previewCell.y &&
              y < previewCell.y + pieceForPreview.shape.length &&
              x >= previewCell.x &&
              x < previewCell.x + pieceForPreview.shape[0].length
            ) {
              const sy = y - previewCell.y;
              const sx = x - previewCell.x;
              if (pieceForPreview.shape[sy] && pieceForPreview.shape[sy][sx]) {
                style.background = canDrop ? "#b3e5fc" : "#ffcdd2";
                style.opacity = 0.8;
                style.boxShadow = canDrop
                  ? "0 0 0 2px #4a90e2"
                  : "0 0 0 2px #e57373";
              }
            }
            return <div key={x + "-" + y} style={style} />;
          })
        )}
      </div>
      {/* Pièces à placer */}
      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 6,
          justifyContent: "center",
          userSelect: "none",
          height: 80,
        }}
      >
        {pieces.map((shape, i) =>
          shape ? (
            <div
              key={i}
              style={{
                display: "inline-grid",
                gridTemplateColumns: `repeat(${shape[0].length}, 24px)`,
                gridTemplateRows: `repeat(${shape.length}, 24px)`,
                gap: 2,
                margin: 4,
                background: "none",
                border: "none",
                touchAction: "none",
                userSelect: "none",
              }}
              onTouchStart={(e) => handleTouchStartPiece(e, i)}
            >
              {shape.map((row, y) =>
                row.map((cell, x) =>
                  cell ? (
                    <div
                      key={x + "-" + y}
                      style={{
                        width: 24,
                        height: 24,
                        background: "#4a90e2",
                        borderRadius: 3,
                      }}
                    />
                  ) : (
                    <div
                      key={x + "-" + y}
                      style={{
                        width: 24,
                        height: 24,
                        background: "none",
                      }}
                    />
                  )
                )
              )}
            </div>
          ) : (
            <div
              key={i}
              style={{
                width: 32,
                height: 32,
                opacity: 0.2,
                background: "#eee",
                borderRadius: 6,
              }}
            />
          )
        )}
      </div>
      {/* Drag visuel flottant */}
      {pieceForPreview && dragPosRef.current && (
        <div
          style={{
            position: "fixed",
            left: dragPosRef.current.x - pieceForPreview.offsetX,
            top:
              dragPosRef.current.y -
              pieceForPreview.offsetY -
              pieceForPreview.shape.length * 24,
            pointerEvents: "none",
            zIndex: 1000,
            opacity: 0.9,
            display: "inline-grid",
            gridTemplateColumns: `repeat(${pieceForPreview.shape[0].length}, 20px)`,
            gridTemplateRows: `repeat(${pieceForPreview.shape.length}, 20px)`,
            gap: 2,
            // plus de fond ni de bordure
            background: "none",
            border: "none",
          }}
        >
          {pieceForPreview.shape.map((row, y) =>
            row.map((cell, x) =>
              cell ? (
                <div
                  key={x + "-" + y}
                  style={{
                    width: 20,
                    height: 20,
                    background: "#4a90e2",
                    borderRadius: 3,
                  }}
                />
              ) : (
                <div
                  key={x + "-" + y}
                  style={{
                    width: 20,
                    height: 20,
                    background: "none",
                  }}
                />
              )
            )
          )}
        </div>
      )}
      {isGameOver && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 255, 255, 0.95)",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
            zIndex: 1000,
            minWidth: "240px",
          }}
        >
          <div
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#e53935",
              marginBottom: "16px",
              letterSpacing: "-0.02em",
            }}
          >
            Perdu !
          </div>
          {isClient && (
            <div
              style={{
                fontSize: "1rem",
                color: "#666",
                marginBottom: "20px",
                lineHeight: "1.4",
              }}
            >
              <div style={{ marginBottom: "4px" }}>
                Score :{" "}
                <span style={{ color: "#4a90e2", fontWeight: "600" }}>
                  {score}
                </span>
              </div>
              <div style={{ marginBottom: "4px" }}>
                Record local :{" "}
                <span style={{ color: "#1a1a1a", fontWeight: "600" }}>
                  {bestScore}
                </span>
              </div>
              <div>
                Record global :{" "}
                <span style={{ color: "#1a1a1a", fontWeight: "600" }}>
                  {globalBest ?? "..."}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={handleRestart}
            style={{
              fontSize: "1rem",
              fontWeight: "600",
              padding: "14px 28px",
              borderRadius: "12px",
              border: "none",
              background: "#4a90e2",
              color: "#fff",
              cursor: "pointer",
              minHeight: "48px",
              transition: "all 0.2s ease",
              boxShadow: "0 4px 12px rgba(74, 144, 226, 0.3)",
            }}
          >
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}
