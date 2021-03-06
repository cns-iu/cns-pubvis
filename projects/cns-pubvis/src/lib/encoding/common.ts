import { access, chain, combine, map, Operator } from '@ngx-dino/core';
import { lowerCase, startCase } from 'lodash';

import { ColorScale } from './color-scale';
import { SizeScale } from './size-scale';

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

export function norm1to100(field: string, maxField: string, minField?: string): Operator<any, number> {
  if (!minField) {
    return chain(
      combine([access(field, 0), access(maxField, 1)]),
      map(([val, maxVal]) => 1 + val / maxVal * 99)
    );
  } else {
    return chain(
      combine([access(field, 0), access(maxField, 1), access(minField, 0)]),
      map(([val, maxVal, minVal]) => 1 + (val - minVal) / (maxVal - minVal) * 99)
    );
  }
}

export const formatNumber = map<number, string>(x => x.toLocaleString());
export const formatYear = map<number, string>(x => '' + x);
export const formatFullname = map<string, string>(s => {
  const parts = s.split(',');
  // Check if its lastname, firstname. If so, change it to firstname lastname.
  if (parts.length === 2) {
    s = [parts[1].trim(), parts[0].trim()].join(' ');
  }
  s = s.split(/\s+/).map(i => i.length > 2 ? startCase(lowerCase(i)) : i).join(' ');
  return s;
});

export const colorRange = ['#ffc500', '#c21500'];
export const colorScale = new ColorScale(colorRange[0], colorRange[1], '#b3b3b3', -51);
export const colorScaleNormQuantitative = colorScale.quantitative([1.01, 100]);
export const colorLogScaleNormQuantitative = chain(
  new SizeScale(1, 100, 0, 'log').quantitative([1.01, 100]),
  colorScaleNormQuantitative
);
export const colorScaleNormQuantitativeStroke = colorScale.quantitativeStrokeColor([1.01, 100]);
export const colorLogScaleNormQuantitativeStroke = chain(
  new SizeScale(1, 100, 0, 'log').quantitative([1.01, 100]),
  colorScaleNormQuantitativeStroke
);

export const greyRange = ['#bdbdbd', '#000000'];
export const greyScale = new ColorScale(greyRange[0], greyRange[1], '#bdbdbd', -51);
export const greyScaleNormQuantitative = greyScale.quantitative([1, 100]);
export const greyScaleNormQuantitativeStroke = greyScale.quantitativeStrokeColor([1, 100]);

export const areaSizeRange = [5, 500];
export const radiusSizeRange = areaSizeRange.map(a => Math.ceil(Math.sqrt(a) / 2));
export const areaSizeScale = new SizeScale(areaSizeRange[0], areaSizeRange[1], 3, 'linear');
export const areaSizeLogScale = new SizeScale(areaSizeRange[0], areaSizeRange[1], 3, 'log');
export const areaSizeScaleNormQuantitative = areaSizeScale.quantitative([1.01, 100]);
export const areaSizeLogScaleNormQuantitative = chain(
  new SizeScale(1, 100, 0, 'log').quantitative([1.01, 100]),
  areaSizeScaleNormQuantitative
);

export const strokeSizeRange = [0.5, 12];
export const strokeSizeScale = new SizeScale(strokeSizeRange[0], strokeSizeRange[1], 0.5, 'linear');
export const strokeSizeScaleNormQuantitative = strokeSizeScale.quantitative([1, 100]);

export const fontSizeRange = [6, 20];
export const fontSizeScale = new SizeScale(fontSizeRange[0], fontSizeRange[1], 5, 'linear');
export const fontSizeScaleNormQuantitative = fontSizeScale.quantitative([1, 100]);
