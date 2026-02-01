import { SudokuGrid, Difficulty } from './types';

/**
 * Generate a complete valid Sudoku solution
 */
export function generateSolution(): SudokuGrid {
  const grid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(null));
  fillGrid(grid);
  return grid;
}

/**
 * Generate a Sudoku puzzle with a given difficulty
 */
export function generatePuzzle(difficulty: Difficulty): { puzzle: SudokuGrid; solution: SudokuGrid } {
  const solution = generateSolution();
  const puzzle = JSON.parse(JSON.stringify(solution)) as SudokuGrid;
  
  const cellsToRemove = getCellsToRemove(difficulty);
  removeCells(puzzle, cellsToRemove);
  
  return { puzzle, solution };
}

function getCellsToRemove(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 35;
    case 'medium': return 45;
    case 'hard': return 52;
    case 'expert': return 58;
  }
}

function fillGrid(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (const num of numbers) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (fillGrid(grid)) {
              return true;
            }
            
            grid[row][col] = null;
          }
        }
        
        return false;
      }
    }
  }
  return true;
}

function removeCells(grid: SudokuGrid, count: number): void {
  let removed = 0;
  const cells = Array.from({ length: 81 }, (_, i) => ({
    row: Math.floor(i / 9),
    col: i % 9
  }));
  
  shuffleArray(cells);
  
  for (const cell of cells) {
    if (removed >= count) break;
    
    const backup = grid[cell.row][cell.col];
    grid[cell.row][cell.col] = null;
    
    // Ensure puzzle has unique solution (simplified check)
    const solutions = countSolutions(grid);
    if (solutions === 1) {
      removed++;
    } else {
      grid[cell.row][cell.col] = backup;
    }
  }
}

function countSolutions(grid: SudokuGrid, maxSolutions: number = 2): number {
  let count = 0;
  const gridCopy = JSON.parse(JSON.stringify(grid)) as SudokuGrid;
  
  function solve(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (gridCopy[row][col] === null) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(gridCopy, row, col, num)) {
              gridCopy[row][col] = num;
              
              if (solve()) {
                count++;
                if (count >= maxSolutions) return true;
                gridCopy[row][col] = null;
              } else {
                gridCopy[row][col] = null;
              }
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  
  solve();
  return count;
}

export function isValidPlacement(
  grid: SudokuGrid,
  row: number,
  col: number,
  value: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) return false;
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) {
        return false;
      }
    }
  }
  
  return true;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if the puzzle is complete and correct
 */
export function isPuzzleComplete(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) return false;
      if (!isValidPlacement(grid, row, col, grid[row][col]!)) return false;
    }
  }
  return true;
}
