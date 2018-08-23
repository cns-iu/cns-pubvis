import { Field, access, map, simpleField } from '@ngx-dino/core';


export const subdisciplineSizeField: Field<number> = simpleField<number>({
  bfieldId: 'size',
  label: 'Subdiscipline Size',

  operator: access('weight')
});

export const subdisciplineIdField: Field<number|string> = simpleField<number|string>({
  bfieldId: 'id',
  label: 'Subdiscipline Id',

  // operator: access('subd_id')
  operator: map(n => parseInt('' + n.subd_id) || undefined)
});
