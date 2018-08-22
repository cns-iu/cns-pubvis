import { Operator, Field, access, map, chain, prePostMultiField } from '@ngx-dino/core';

// Utility
const textDataOp: Operator<string, {type: string, content: string }> = map((text) => ({type: 'text', content: text}));
const textDataOp2: Operator<string, {type: string, content: string }> = chain(textDataOp, map((data) => {
  data.content = data.content.toLocaleString();
  return data;
}));

// Common fields
const commonYearField: Field<any> = prePostMultiField({
  id: 'year',
  label: 'Year',

  pre: access('year'),
  mapping: {default: textDataOp}
});


export namespace AuthorsByYearFields {
  export const yearField = commonYearField;
  export const authorCountField: Field<any> = prePostMultiField({
    id: 'acount',
    label: '# Authors',

    pre: access('count'),
    mapping: {default: textDataOp2}
  });
}

export namespace PublicationsByYearFields {
  export const yearField = commonYearField;
  export const publicationCountField: Field<any> = prePostMultiField({
    id: 'pcount',
    label: '# Publications',

    pre: access('count'),
    mapping: {default: textDataOp2}
  });
}
