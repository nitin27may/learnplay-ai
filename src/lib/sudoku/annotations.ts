export type AnnotationType = 'highlight' | 'circle' | 'arrow' | 'cross';
export type AnnotationColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple';

export interface CellAnnotation {
  row: number;
  col: number;
  type: AnnotationType;
  color: AnnotationColor;
  label?: string;
}

export interface Annotation {
  id: string;
  cells: CellAnnotation[];
  message: string;
  duration?: number; // Auto-clear after ms (optional)
}
