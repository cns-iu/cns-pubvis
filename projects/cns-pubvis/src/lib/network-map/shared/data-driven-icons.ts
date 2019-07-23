import { Map } from 'mapbox-gl';
import {
  SymbolType, symbolCircle, symbolCross, symbolDiamond,
  symbolSquare, symbolStar, symbolTriangle, symbolWye
} from 'd3-shape';


// Symbols
export type BuiltinSymbolTypes =
  'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';

const symbolLookup: {[P in BuiltinSymbolTypes]: SymbolType} = {
  'circle': symbolCircle, 'cross': symbolCross, 'diamond': symbolDiamond,
  'square': symbolSquare, 'star': symbolStar, 'triangle': symbolTriangle,
  'wye': symbolWye
};

export type CanvasCreator = (width: number, height: number) => HTMLCanvasElement;

export const defaultCanvasCreator: CanvasCreator = function(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export interface IconConfig {
  shape: BuiltinSymbolTypes;

  areaSize: number;

  color: string;
  transparency: number;

  strokeColor: string;
  strokeWidth: number;
  strokeTransparency: number;

  pulse: boolean;
}

export class DataDrivenIcons {
  readonly prefix = 'ddi:';
  private map: Map;

  constructor(private createCanvas = defaultCanvasCreator) {}

  addTo(map: Map): Map {
    this.map = map;
    map.on('styleimagemissing', (e) => {
      const id = e.id; // id of the missing image
      if (id.indexOf(this.prefix) !== 0) { return; }

      const config = JSON.parse(id.slice(this.prefix.length));
      const icon = this.createIcon(config);
      map.addImage(id, icon);
    });

    return map;
  }

  createIcon(config: IconConfig): ImageData {
    const symbolDiameter = Math.sqrt(config.areaSize / Math.PI) * 2;
    const canvasWidth = symbolDiameter * 1.5;
    const canvas = this.createCanvas(canvasWidth, canvasWidth);
    const context = canvas.getContext('2d');

    context.translate(canvas.width / 2, canvas.height / 2);
    context.beginPath();
    symbolLookup[config.shape].draw(context, config.areaSize);

    if (config.color) {
      context.fillStyle = config.color;
      context.globalAlpha = 1 - config.transparency;
      context.fill();
    }
    if (config.strokeColor) {
      context.strokeStyle = config.strokeColor;
      context.lineWidth = config.strokeWidth;
      context.globalAlpha = 1 - config.strokeTransparency;
      context.stroke();
    }

    return context.getImageData(0, 0, canvas.width, canvas.height);
  }
}
