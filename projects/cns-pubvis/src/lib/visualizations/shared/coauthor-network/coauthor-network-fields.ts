import { Field, access, constant, combine, map, simpleField, chain } from '@ngx-dino/core';

export const nodeSizeField: Field<number> = simpleField<number>({
  bfieldId: 'size',
  label: 'Node Size',

  operator: chain(
    access('paperCount'),
    map((s: number) => 5 * s)
  )
});

export const nodeIdField: Field<string> = simpleField<string>({
  bfieldId: 'id',
  label: 'Node ID',

  operator: access('id')
});

export const nodeColorField: Field<number> = simpleField<number>({
  bfieldId: 'color',
  label: 'Node Color',

  operator: access('coauthorCount')
});

export const nodePositionField: Field<[number, number]> = simpleField<[number, number]>({
  bfieldId: 'position',
  label: 'Node Position',

  operator: combine([
    access('xpos'),
    access('ypos')
  ])
});

export const nodeSymbolField: Field<string> = simpleField<string>({
  bfieldId: 'symbol',
  label: 'Node Symbol',

  operator: constant('circle')
});

export const edgeIdField: Field<string> = simpleField<string>({
  bfieldId: 'id',
  label: 'Edge ID',

  operator: access('id')
});

export const edgeSourceField: Field<[number, number]> = simpleField<[number, number]>({
  bfieldId: 'source',
  label: 'Edge Source',

  operator: chain(
    access('author1'),
    combine([
      access('xpos'),
      access('ypos')
    ])
  )
});

export const edgeTargetField: Field<[number, number]> = simpleField<[number, number]>({
  bfieldId: 'target',
  label: 'Edge Target',

  operator: chain(
    access('author2'),
    combine([
      access('xpos'),
      access('ypos')
    ])
  )
});

export const edgeSizeField: Field<number> = simpleField<number>({
  bfieldId: 'edgeSize',
  label: 'Edge size',

  operator: access('count')
});

export const edgeStroke: Field<string> = simpleField<string>({
  bfieldId: 'stroke',
  label: 'Edge Stroke Color',

  operator: constant('black')
});

export const edgeStrokeWidth: Field<number> = simpleField<number>({
  bfieldId: 'stroke-width',
  label: 'Edge Stroke Width',

  operator: access('count')
});
