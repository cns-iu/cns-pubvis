const fs = require('fs');

import gexf from 'gexf';
import { parse } from 'papaparse';
import { chain, Operator, access, map } from '@ngx-dino/core';

export function readFile(inputFile: string): string {
  return fs.readFileSync(inputFile, 'utf8');
}
export function writeJSON(outputFile: string, obj: any) {
  fs.writeFileSync(outputFile, JSON.stringify(obj, null, 2), 'utf8');
}
export function readGexfFile(gexfFile: string): any {
  return gexf.parse(readFile(gexfFile));
}
export function readCSVFile(csvFile: string): any[] {
  return parse(readFile(csvFile), {header: true, skipEmptyLines: true}).data;
}

export function a(field: string): Operator<any, any> {
  return chain(access<any>(field, '-'), map<any, any>((val) => val === '-' ? undefined : val));
}
export function NumberOrUndefined(value: string): number {
  const numberValue = Number(value);
  return isNaN(numberValue) ? undefined : numberValue;
}
export function n(field: string): Operator<any, number> {
  return chain(a(field), map(NumberOrUndefined));
}

export const toString = map((x) => x === undefined || x === '' ? undefined : '' + x);

export const normalizeAuthor = map<string, string>(author => {
  const a1 = (author || '').split(',');
  if (a1.length > 1) {
    return a1.slice(0, -1).join(',') + ',' + a1[a1.length - 1].toUpperCase();
  } else {
    return author;
  }
});
