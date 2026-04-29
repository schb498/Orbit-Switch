export interface Ring {
  id: number;
  x: number;
  y: number;
  radius: number;
  rotation: number;          // accumulating CW degrees for CSS transform
  slots: (string | null)[]; // 4 local slots: 0=top 1=right 2=bottom 3=left
  label: string;
  connectedTo: number[];
}
