import { Operator, prePostMultiField } from '@ngx-dino/core';
import '@ngx-dino/core/src/operators/add/static/access';
import '@ngx-dino/core/src/operators/add/static/constant';
import '@ngx-dino/core/src/operators/add/static/map';
import '@ngx-dino/core/src/operators/add/method/map';


// Utility
const textDataOp = Operator.map((text) => ({type: 'text', content: text}));
const textDataOp2 = textDataOp.map((data) => {
  data.content = data.content.toLocaleString();
  return data;
});

// Common fields
const commonYearField = prePostMultiField({
  id: 'year',
  label: 'Year',

  pre: Operator.access('year'),
  mapping: {default: textDataOp}
});


export namespace AuthorsByYearFields {
  export const yearField = commonYearField;
  export const authorCountField = prePostMultiField({
    id: 'acount',
    label: '# Authors',

    pre: Operator.access('count'),
    mapping: {default: textDataOp2}
  });
}

export namespace PublicationsByYearFields {
  export const yearField = commonYearField;
  export const publicationCountField = prePostMultiField({
    id: 'pcount',
    label: '# Publications',

    pre: Operator.access('count'),
    mapping: {default: textDataOp2}
  });
}
