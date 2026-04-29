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

// Win target: an atom of the given color must be at the given world-space slot position on this ring
export interface WinTarget {
  ringIndex: number;
  color: string;
  wPos: number; // 0=top 1=right 2=bottom 3=left (world-space)
}
