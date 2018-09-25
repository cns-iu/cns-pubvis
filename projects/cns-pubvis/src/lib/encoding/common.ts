import { Operator, access, chain, combine, map } from '@ngx-dino/core';

import { SizeScale } from './size-scale';
import { ColorScale } from './color-scale';

export function norm0to100(field: string, maxField: string, minField?: string): Operator<any, number> {
  if (!minField) {
    return chain(
      combine([access(field, 0), access(maxField, 1)]),
      map(([val, maxVal]) => val / maxVal * 100)
    );
  } else {
    return chain(
      combine([access(field, 0), access(maxField, 1), access(minField, 0)]),
      map(([val, maxVal, minVal]) => (val - minVal) / (maxVal - minVal) * 100)
    );
  }
}

export const formatNumber = map<number, string>(x => x.toLocaleString());
export const formatYear = map<number, string>(x => '' + x);

export const colorRange = ['#ee1c1c', '#b71c1c']; // ['#b71c1c', '#ee1c1c'];
export const colorScale = new ColorScale(colorRange[0], colorRange[1], '#b3b3b3', -51);
export const colorScaleNormQuantitative = colorScale.quantitative([1, 100]);
export const colorScaleNormQuantitativeStroke = colorScale.quantitativeStrokeColor([1, 100]);

export const greyRange = ['#bdbdbd', '#000000'];
export const greyScale = new ColorScale(greyRange[0], greyRange[1], '#ffffff', -51);
export const greyScaleNormQuantitative = greyScale.quantitative([1, 7]);
export const greyScaleNormQuantitativeStroke = greyScale.quantitativeStrokeColor([1, 100]);

export const areaSizeRange = [8, 550];
export const areaSizeScale = new SizeScale(areaSizeRange[0], areaSizeRange[1], 3, 'linear'); // TBD TODO
export const areaSizeScaleNormQuantitative = areaSizeScale.quantitative([1, 100]);

export const strokeSizeRange = [0.5, 8];
export const strokeSizeScale = new SizeScale(strokeSizeRange[0], strokeSizeRange[1], 0.5, 'linear'); // TBD TODO
export const strokeSizeScaleNormQuantitative = strokeSizeScale.quantitative([1, 100]);

export const fontSizeRange = [6, 20];
export const fontSizeScale = new SizeScale(fontSizeRange[0], fontSizeRange[1], 5, 'linear'); // TBD TODO
export const fontSizeScaleNormQuantitative = fontSizeScale.quantitative([1, 100]);
