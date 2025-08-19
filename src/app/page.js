"use client";

import React from "react";
import Board from "../components/Board";
import Piece from "../components/Piece";
import { PIECES } from "../components/Pieces";

import { supabase } from "../utils/supabase";
import BoardMobile from "../components/BoardMobile";

function createEmptyGrid() {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function getRandomPieces() {
  return Array.from(
    { length: 3 },
    () => PIECES[Math.floor(Math.random() * PIECES.length)]
  );
}

function canPlace(grid, shape, startY, startX) {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[0].length; x++) {
      if (shape[y][x]) {
        const gy = startY + y;
        const gx = startX + x;
        if (gy < 0 || gy >= 9 || gx < 0 || gx >= 9) return false;
        if (grid[gy][gx]) return false;
      }
    }
  }
  return true;
}

function clearFull(grid) {
  let cleared = 0;
  let toClear = Array.from({ length: 9 }, () => Array(9).fill(false));
  // Lignes
  for (let y = 0; y < 9; y++) {
    if (grid[y].every((cell) => cell)) {
      for (let x = 0; x < 9; x++) toClear[y][x] = true;
      cleared++;
    }
  }
  // Colonnes
  for (let x = 0; x < 9; x++) {
    if (grid.every((row) => row[x])) {
      for (let y = 0; y < 9; y++) toClear[y][x] = true;
      cleared++;
    }
  }
  // Carrés 3x3
  for (let by = 0; by < 9; by += 3) {
    for (let bx = 0; bx < 9; bx += 3) {
      let full = true;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (!grid[by + y][bx + x]) full = false;
        }
      }
      if (full) {
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            toClear[by + y][bx + x] = true;
          }
        }
        cleared++;
      }
    }
  }
  // Appliquer la suppression en une seule passe
  let newGrid = grid.map((row, y) =>
    row.map((cell, x) => (toClear[y][x] ? null : cell))
  );
  return { newGrid, cleared };
}

function canPlaceAny(grid, pieces) {
  for (let i = 0; i < pieces.length; i++) {
    const shape = pieces[i];
    if (!shape) continue;
    for (let y = 0; y <= 9 - shape.length; y++) {
      for (let x = 0; x <= 9 - shape[0].length; x++) {
        if (canPlace(grid, shape, y, x)) return true;
      }
    }
  }
  return false;
}

export default function Home() {
  const [grid, setGrid] = React.useState(createEmptyGrid());
  const [pieces, setPieces] = React.useState([]);
  const [score, setScore] = React.useState(0);
  const [bestScore, setBestScore] = React.useState(() => {
    if (typeof window !== "undefined") {
      return Number(localStorage.getItem("blocklogic_best")) || 0;
    }
    return 0;
  });
  const [globalBest, setGlobalBest] = React.useState(null);
  const [dragOverBoard, setDragOverBoard] = React.useState(false);
  const [draggedPieceIndex, setDraggedPieceIndex] = React.useState(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setPieces(getRandomPieces());

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 800 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const hasPiece = pieces.some(Boolean);
  const isGameOver = hasPiece && !canPlaceAny(grid, pieces);

  // Récupérer le meilleur score global au chargement
  React.useEffect(() => {
    async function fetchBest() {
      try {
        const { data, error } = await supabase
          .from("highscore")
          .select("score")
          .order("score", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Erreur lors de la récupération du score:", error);
          return;
        }

        if (data && data.score !== undefined) {
          setGlobalBest(data.score);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du score:", error);
      }
    }
    fetchBest();
  }, []);

  // Mettre à jour le meilleur score local
  React.useEffect(() => {
    if (isGameOver && score > bestScore) {
      setBestScore(score);
      localStorage.setItem("blocklogic_best", score);
    }
  }, [isGameOver, score, bestScore]);

  // Mettre à jour le meilleur score global si battu
  React.useEffect(() => {
    if (isGameOver && score > (globalBest ?? 0)) {
      async function updateBest() {
        try {
          // Vérifier s'il y a déjà un score dans la base
          const { data: existingData, error: selectError } = await supabase
            .from("highscore")
            .select("*")
            .order("score", { ascending: false })
            .limit(1)
            .single();

          if (existingData) {
            // Mettre à jour le score existant
            await supabase
              .from("highscore")
              .update({ score })
              .eq("id", existingData.id);
          } else {
            // Créer un nouveau score
            await supabase.from("highscore").insert({ score });
          }
          setGlobalBest(score);
        } catch (error) {
          console.error("Erreur lors de la mise à jour du score:", error);
        }
      }
      updateBest();
    }
  }, [isGameOver, score, globalBest]);

  function handleDrop(pieceIndex, y, x) {
    if (pieceIndex === null || pieces[pieceIndex] === null) return;
    const shape = pieces[pieceIndex];
    if (!canPlace(grid, shape, y, x)) return;
    let newGrid = grid.map((row) => row.slice());
    for (let sy = 0; sy < shape.length; sy++) {
      for (let sx = 0; sx < shape[0].length; sx++) {
        if (shape[sy][sx]) {
          newGrid[y + sy][x + sx] = 1;
        }
      }
    }
    const { newGrid: clearedGrid, cleared } = clearFull(newGrid);
    setGrid(clearedGrid);
    if (cleared > 0) setScore((s) => s + cleared);
    const newPieces = pieces.slice();
    newPieces[pieceIndex] = null;
    setPieces(newPieces);
    setDraggedPieceIndex(null);
    if (newPieces.every((p) => p === null)) {
      setTimeout(() => setPieces(getRandomPieces()), 300);
    }
  }

  function handleRestart() {
    setGrid(createEmptyGrid());
    setPieces(getRandomPieces());
    setScore(0);
    setDraggedPieceIndex(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        color: "#222",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: isMobile ? "16px 20px" : "20px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          fontWeight: "700",
          margin: "0 0 16px 0",
          color: "#1a1a1a",
          letterSpacing: "-0.02em",
        }}
      >
        BlockLogic
      </h1>
      <p
        style={{
          fontSize: isMobile ? "1rem" : "1.1rem",
          color: "#666",
          margin: isMobile ? "0 0 12px 0" : "0 0 32px 0",
          maxWidth: "500px",
          lineHeight: "1.5",
        }}
      >
        Placez les formes et remplissez les lignes, colonnes ou carrés pour
        marquer des points.
      </p>
      {isMobile && isClient && (
        <div
          style={{
            fontSize: "1.1rem",
            marginBottom: "12px",
            fontWeight: "600",
            color: "#1a1a1a",
          }}
        >
          Score : <span style={{ color: "#4a90e2" }}>{score}</span>
        </div>
      )}
      {!isMobile && isClient && (
        <div
          style={{
            fontSize: "1.4rem",
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{ fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}
          >
            Score :{" "}
            <span style={{ color: "#4a90e2", fontSize: "1.6rem" }}>
              {score}
            </span>
          </div>
          <div style={{ fontSize: "1rem", color: "#666", lineHeight: "1.4" }}>
            <div>
              Meilleur local : <b style={{ color: "#1a1a1a" }}>{bestScore}</b>
            </div>
            <div>
              Meilleur global :{" "}
              <b style={{ color: "#1a1a1a" }}>{globalBest ?? "..."}</b>
            </div>
          </div>
        </div>
      )}
      {isMobile ? (
        <BoardMobile
          grid={grid}
          setGrid={setGrid}
          pieces={pieces}
          setPieces={setPieces}
          score={score}
          setScore={setScore}
          bestScore={bestScore}
          setBestScore={setBestScore}
          globalBest={globalBest}
          setGlobalBest={setGlobalBest}
          isGameOver={isGameOver}
          handleRestart={handleRestart}
          canPlace={canPlace}
          clearFull={clearFull}
          getRandomPieces={getRandomPieces}
          isClient={isClient}
        />
      ) : (
        <Board
          grid={grid}
          onDrop={isGameOver ? undefined : handleDrop}
          canPlacePiece={(shape, y, x) => canPlace(grid, shape, y, x)}
          setDragOverBoard={setDragOverBoard}
          draggedPieceIndex={draggedPieceIndex}
          setDraggedPieceIndex={setDraggedPieceIndex}
          isGameOver={isGameOver}
          handleRestart={handleRestart}
          score={score}
          bestScore={bestScore}
          globalBest={globalBest}
          isClient={isClient}
        />
      )}
      {!isMobile && isClient && (
        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
          {pieces.map((shape, i) =>
            shape ? (
              <Piece
                key={i}
                shape={shape}
                index={i}
                isSelected={false}
                hide={dragOverBoard && draggedPieceIndex === i}
                setDraggedPieceIndex={setDraggedPieceIndex}
              />
            ) : (
              <div
                key={i}
                style={{
                  width: 48,
                  height: 48,
                  opacity: 0.2,
                  background: "#eee",
                  borderRadius: 6,
                }}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
