export interface Ring {
  id: number;
  x: number;
  y: number;
  radius: number;
  rotation: number;           // accumulating degrees for CSS transform (CW positive, CCW negative)
  direction?: 'cw' | 'ccw';  // defaults to 'cw' when absent
  slots: (string | null)[];  // 4 local slots: 0=top 1=right 2=bottom 3=left
  label: string;
  connectedTo: number[];
}
