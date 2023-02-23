
declare module 'react-qr-scanner' {
  export interface ResultPoint {
    x: number;
    y: number;
    estimatedModuleSize: number;
    count: number;
  }

  export interface ScanResult {
    canvas: HTMLCanvasElement;
    format: number;
    numBits: number;
    rawBytes: Uint8Array;
    resultMetadata: Map;
    resultPoints: ResultPoint[];
    text: string;
    timestamp: number;
  }

  export interface QrReaderProps {
    delay: number;
    style: any;
    onScan: (data: ScanResult | null) => void;
    onError: (err: string | null) => void;
  }

  declare class QrReader extends React.Component<QrReaderProps> {}

  export = QrReader;
}
