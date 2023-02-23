
export type Color = "RGB" | "BW";

export interface Document {
  idnumber: string;
  filename: string;
  copies: number;
  email: string;
  color: Color;
  npps: number;
  pages: number;
  printed: number;
}
