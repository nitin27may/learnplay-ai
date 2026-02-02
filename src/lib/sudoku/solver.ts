import { SudokuGrid } from './types';
import { isValidPlacement } from './generator';

/**
 * Get a hint for the next move
 */
export function getHint(grid: SudokuGrid, solution: SudokuGrid): { row: number; col: number; value: number } | null {
  // Find all empty cells
  const emptyCells: Array<{ row: number; col: number }> = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length === 0) return null;
  
  // Prioritize cells with fewer possibilities (naked singles)
  const cellsWithPossibilities = emptyCells.map(cell => ({
    ...cell,
    possibilities: getPossibleValues(grid, cell.row, cell.col).length
  }));
  
  cellsWithPossibilities.sort((a, b) => a.possibilities - b.possibilities);
  
  const hintCell = cellsWithPossibilities[0];
  return {
    row: hintCell.row,
    col: hintCell.col,
    value: solution[hintCell.row][hintCell.col]!
  };
}

/**
 * Get possible values for a cell
 */
export function getPossibleValues(grid: SudokuGrid, row: number, col: number): number[] {
  if (grid[row][col] !== null) return [];
  
  const possible: number[] = [];
  
  for (let num = 1; num <= 9; num++) {
    if (isValidPlacement(grid, row, col, num)) {
      possible.push(num);
    }
  }
  
  return possible;
}

/**
 * Analyze the current grid for teaching strategies
 */
export interface StrategyAnalysis {
  strategy: string;
  description: string;
  cells: Array<{ row: number; col: number }>;
  value?: number;
}

export function analyzeStrategies(grid: SudokuGrid): StrategyAnalysis[] {
  const strategies: StrategyAnalysis[] = [];
  
  // Find naked singles
  const nakedSingles = findNakedSingles(grid);
  strategies.push(...nakedSingles);
  
  // Find hidden singles
  const hiddenSingles = findHiddenSingles(grid);
  strategies.push(...hiddenSingles);
  
  // Find naked pairs (more advanced)
  const nakedPairs = findNakedPairs(grid);
  strategies.push(...nakedPairs);
  
  return strategies;
}

function findNakedSingles(grid: SudokuGrid): StrategyAnalysis[] {
  const singles: StrategyAnalysis[] = [];
  
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const possible = getPossibleValues(grid, row, col);
        if (possible.length === 1) {
          singles.push({
            strategy: 'naked_single',
            description: `Cell at row ${row + 1}, column ${col + 1} can only be ${possible[0]}`,
            cells: [{ row, col }],
            value: possible[0]
          });
        }
      }
    }
  }
  
  return singles;
}

function findHiddenSingles(grid: SudokuGrid): StrategyAnalysis[] {
  const singles: StrategyAnalysis[] = [];
  
  // Check rows
  for (let row = 0; row < 9; row++) {
    const rowSingles = findHiddenSinglesInUnit(grid, 
      Array.from({ length: 9 }, (_, col) => ({ row, col }))
    );
    singles.push(...rowSingles);
  }
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    const colSingles = findHiddenSinglesInUnit(grid,
      Array.from({ length: 9 }, (_, row) => ({ row, col }))
    );
    singles.push(...colSingles);
  }
  
  // Check boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const cells: Array<{ row: number; col: number }> = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          cells.push({ row: boxRow * 3 + r, col: boxCol * 3 + c });
        }
      }
      const boxSingles = findHiddenSinglesInUnit(grid, cells);
      singles.push(...boxSingles);
    }
  }
  
  return singles;
}

function findHiddenSinglesInUnit(
  grid: SudokuGrid,
  cells: Array<{ row: number; col: number }>
): StrategyAnalysis[] {
  const singles: StrategyAnalysis[] = [];
  
  for (let value = 1; value <= 9; value++) {
    const possibleCells = cells.filter(cell => {
      if (grid[cell.row][cell.col] !== null) return false;
      return getPossibleValues(grid, cell.row, cell.col).includes(value);
    });
    
    if (possibleCells.length === 1) {
      const cell = possibleCells[0];
      singles.push({
        strategy: 'hidden_single',
        description: `In this unit, only row ${cell.row + 1}, column ${cell.col + 1} can be ${value}`,
        cells: [cell],
        value
      });
    }
  }
  
  return singles;
}

function findNakedPairs(grid: SudokuGrid): StrategyAnalysis[] {
  const pairs: StrategyAnalysis[] = [];
  
  // Check rows
  for (let row = 0; row < 9; row++) {
    const rowPairs = findNakedPairsInUnit(grid,
      Array.from({ length: 9 }, (_, col) => ({ row, col }))
    );
    pairs.push(...rowPairs);
  }
  
  return pairs;
}

function findNakedPairsInUnit(
  grid: SudokuGrid,
  cells: Array<{ row: number; col: number }>
): StrategyAnalysis[] {
  const pairs: StrategyAnalysis[] = [];
  
  const cellsWithTwoPossibilities = cells.filter(cell => {
    if (grid[cell.row][cell.col] !== null) return false;
    return getPossibleValues(grid, cell.row, cell.col).length === 2;
  });
  
  for (let i = 0; i < cellsWithTwoPossibilities.length; i++) {
    for (let j = i + 1; j < cellsWithTwoPossibilities.length; j++) {
      const cell1 = cellsWithTwoPossibilities[i];
      const cell2 = cellsWithTwoPossibilities[j];
      
      const poss1 = getPossibleValues(grid, cell1.row, cell1.col);
      const poss2 = getPossibleValues(grid, cell2.row, cell2.col);
      
      if (poss1.length === 2 && poss2.length === 2 &&
          poss1[0] === poss2[0] && poss1[1] === poss2[1]) {
        pairs.push({
          strategy: 'naked_pair',
          description: `Naked pair found with values ${poss1.join(', ')}`,
          cells: [cell1, cell2]
        });
      }
    }
  }
  
  return pairs;
}

/**
 * Conflict information for wrong move analysis
 */
export interface ConflictInfo {
  type: 'row' | 'column' | 'box';
  conflictingCell: { row: number; col: number };
  message: string;
}

/**
 * Find all conflicts for a value placed at a specific cell
 * Used to explain why a user's move is wrong
 */
export function findConflicts(
  grid: SudokuGrid,
  row: number,
  col: number,
  value: number | null
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];

  if (value === null || value === 0) return conflicts;

  // Check row conflicts
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c] === value) {
      conflicts.push({
        type: 'row',
        conflictingCell: { row, col: c },
        message: `The ${value} you placed conflicts with another ${value} in column ${c + 1} of this row`
      });
    }
  }

  // Check column conflicts
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col] === value) {
      conflicts.push({
        type: 'column',
        conflictingCell: { row: r, col },
        message: `The ${value} you placed conflicts with another ${value} in row ${r + 1} of this column`
      });
    }
  }

  // Check 3x3 box conflicts
  const boxStartRow = Math.floor(row / 3) * 3;
  const boxStartCol = Math.floor(col / 3) * 3;
  for (let r = boxStartRow; r < boxStartRow + 3; r++) {
    for (let c = boxStartCol; c < boxStartCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c] === value) {
        conflicts.push({
          type: 'box',
          conflictingCell: { row: r, col: c },
          message: `The ${value} you placed conflicts with another ${value} in the same 3x3 box`
        });
      }
    }
  }

  return conflicts;
}
