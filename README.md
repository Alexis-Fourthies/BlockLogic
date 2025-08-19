# 🎮 Blockudoku

Un jeu de puzzle inspiré du Sudoku et du Tetris, développé avec Next.js et React.

## 🎯 Description du Jeu

Blockudoku combine la logique du Sudoku avec le gameplay du Tetris. Placez des formes géométriques sur une grille 9x9 et remplissez les lignes, colonnes ou carrés 3x3 pour marquer des points et progresser dans le jeu.

### 🎲 Mécaniques de Jeu

- **Grille 9x9** : Plateau de jeu divisé en carrés 3x3 (style Sudoku)
- **Formes Géométriques** : 3 pièces disponibles à la fois (carrés, barres, L, T, croix, etc.)
- **Placement** : Drag & drop des pièces sur la grille
- **Score** : Points pour chaque case remplie + bonus pour les lignes/colonnes/carrés complets
- **Game Over** : Quand aucune pièce ne peut plus être placée

### 🏆 Système de Scores

- **Score Local** : Sauvegardé dans le navigateur
- **Score Global** : Classement mondial via Supabase
- **Bonus** : +9 points pour chaque ligne, colonne ou carré 3x3 complété

## 🚀 Fonctionnalités

### ✨ Interface Utilisateur

- **Design Responsive** : Optimisé desktop et mobile
- **Drag & Drop** : Interface intuitive avec react-dnd
- **Prévisualisation** : Aperçu en temps réel des placements
- **Animations** : Transitions fluides et effets visuels
- **Bordures Sudoku** : Style authentique avec carrés 3x3

### 📱 Expérience Mobile

- **Interface Tactile** : Optimisée pour les écrans tactiles
- **Layout Adaptatif** : Grille et pièces redimensionnées
- **Gestes Intuitifs** : Interactions naturelles sur mobile

### 🎨 Design System

- **Couleurs** : Palette moderne (bleu #4a90e2, gris #f7f7f7)
- **Typographie** : Inter font family pour une lecture optimale
- **Animations** : Transitions CSS fluides
- **Feedback Visuel** : États clairs pour chaque interaction

## 🛠️ Architecture Technique

### 📁 Structure du Projet

```
src/
├── app/
│   ├── layout.js          # Layout principal avec DnD Provider
│   ├── page.js            # Page principale du jeu
│   ├── globals.css        # Styles globaux
│   └── page.module.css    # Styles spécifiques
├── components/
│   ├── Board.js           # Grille de jeu (desktop)
│   ├── BoardMobile.js     # Grille de jeu (mobile)
│   ├── Piece.js           # Composant pièce draggable
│   └── Pieces.js          # Définitions des formes
└── utils/
    └── supabase.js        # Configuration Supabase
```

### 🔧 Technologies Utilisées

#### Frontend

- **Next.js 15** : Framework React avec App Router
- **React 18** : Bibliothèque UI avec hooks modernes
- **react-dnd** : Système de drag & drop
- **CSS Modules** : Styles modulaires et encapsulés

#### Backend & Données

- **Supabase** : Base de données pour les scores globaux
- **localStorage** : Stockage local des scores personnels

#### Déploiement

- **Vercel** : Plateforme de déploiement optimisée Next.js

### 🎯 Logique de Jeu

#### Gestion de l'État

```javascript
// États principaux
const [grid, setGrid] = useState(createEmptyGrid()); // Grille 9x9
const [pieces, setPieces] = useState([]); // Pièces disponibles
const [score, setScore] = useState(0); // Score actuel
const [bestScore, setBestScore] = useState(0); // Meilleur local
const [globalBest, setGlobalBest] = useState(null); // Meilleur global
```

#### Algorithmes Clés

- **Validation de Placement** : Vérification des collisions et limites
- **Détection de Complétion** : Lignes, colonnes et carrés 3x3
- **Génération de Pièces** : Sélection aléatoire équilibrée
- **Détection de Game Over** : Vérification de la possibilité de placement

## 🎮 Comment Jouer

1. **Démarrage** : Une grille vide 9x9 s'affiche avec 3 pièces disponibles
2. **Placement** : Glissez-déposez une pièce sur la grille
3. **Validation** : La pièce ne peut être placée que si elle ne chevauche pas d'autres pièces
4. **Score** : Chaque case remplie rapporte 1 point
5. **Bonus** : Complétez une ligne, colonne ou carré 3x3 pour +9 points
6. **Nouvelles Pièces** : Après placement, 3 nouvelles pièces apparaissent
7. **Game Over** : Le jeu se termine quand aucune pièce ne peut être placée

## 🏗️ Développement

### Structure des Composants

#### `Board.js` - Grille de Jeu Desktop

- Gestion du drag & drop avec react-dnd
- Prévisualisation des placements
- Animations de disparition
- Bordures Sudoku stylisées

#### `BoardMobile.js` - Grille de Jeu Mobile

- Interface tactile optimisée
- Gestes de sélection et placement
- Layout adaptatif pour petits écrans

#### `Piece.js` - Composant Pièce

- Rendu dynamique des formes
- Gestion du drag & drop
- États visuels (normal, sélectionné, drag)

#### `Pieces.js` - Définitions des Formes

- Bibliothèque de 20+ formes géométriques
- Matrices 2D pour chaque forme
- Variété équilibrée pour le gameplay

---

**Développé avec ❤️ en utilisant Next.js et React**
