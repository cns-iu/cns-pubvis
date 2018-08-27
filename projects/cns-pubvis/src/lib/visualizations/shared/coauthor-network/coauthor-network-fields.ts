import { Field, access, constant, map, simpleField } from '@ngx-dino/core';

export const nodeSizeField: Field<number> = simpleField<number>({
  bfieldId: 'size',
  label: 'Node Size',

  operator: access('paperCount')
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

export const nodeLabelField: Field<string> = simpleField<string>({
  bfieldId: 'label',
  label: 'Node Label',

  operator: access('id')
});

export const nodeFixedXField: Field<number> = simpleField<number>({
  bfieldId: 'fixedX',
  label: 'Node Fixed X',

  // operator: map((n) => (n.xpos || 0) + 100)
  operator: constant(undefined)
});

export const nodeFixedYField: Field<number> = simpleField<number>({
  bfieldId: 'fixedY',
  label: 'Node Fixed Y',

  // operator: map((n) => (n.ypos || 0) + 100)
  operator: constant(undefined)
});

export const edgeIdField: Field<string> = simpleField<string>({
  bfieldId: 'id',
  label: 'Edge ID',

  operator: access('id')
});

export const edgeSourceField: Field<string> = simpleField<string>({
  bfieldId: 'source',
  label: 'Edge Source',

  operator: access('source')
});

export const edgeTargetField: Field<string> = simpleField<string>({
  bfieldId: 'target',
  label: 'Edge Target',

  operator: access('target')
});

export const edgeSizeField: Field<number> = simpleField<number>({
  bfieldId: 'edgeSize',
  label: 'Edge size',

  operator: access('count')
});
