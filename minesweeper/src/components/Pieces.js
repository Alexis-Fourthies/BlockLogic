// Liste des formes (matrices 2D), chaque 1 représente un bloc
export const PIECES = [
  // Carré 1x1
  [[1]],
  // Barre 1x2
  [[1, 1]],
  // Barre 1x3
  [[1, 1, 1]],
  // Barre 2x1
  [[1], [1]],
  // Barre 3x1
  [[1], [1], [1]],
  // Carré 2x2
  [
    [1, 1],
    [1, 1],
  ],

  // Petit L dans tous les sens (3 cases)
  [
    [1, 0],
    [1, 1],
  ], // L classique
  [
    [1, 1],
    [0, 1],
  ], // L tourné à droite
  [
    [0, 1],
    [1, 1],
  ], // L tourné à gauche
  [
    [1, 1],
    [1, 0],
  ], // L inversé

  // Croix + (5 cases)
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],

  // T classique dans tous les sens (4 cases)
  [
    [1, 1, 1],
    [0, 1, 0],
  ], // T haut
  [
    [1, 0],
    [1, 1],
    [1, 0],
  ], // T droite
  [
    [0, 1, 0],
    [1, 1, 1],
  ], // T bas
  [
    [0, 1],
    [1, 1],
    [0, 1],
  ], // T gauche

  // S et Z (pour la variété)
  [
    [0, 1, 1],
    [1, 1, 0],
  ], // S
  [
    [1, 1, 0],
    [0, 1, 1],
  ], // Z
];
