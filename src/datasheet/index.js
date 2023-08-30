//
//  index.js
//
//  The MIT License
//  Copyright (c) 2021 - 2023 O2ter Limited. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import React from 'react';
import { DataSheet as _DataSheet } from '@o2ter/react-ui';
import { Decimal } from 'proto.io';

const typeOf = (x) => _.isString(x) ? x : x.type;
const DataSheetCell = ({ value, type, isEditing }) => {

  if (_.isNil(value)) {
    return (
      <Text>null</Text>
    );
  }
  if (_.isBoolean(value)) {
    return (
      <Text>{value}</Text>
    );
  }
  if (_.isNumber(value)) {
    return (
      <Text>{value}</Text>
    );
  }
  if (_.isString(value)) {
    return (
      <Text>{value}</Text>
    );
  }
  if (_.isDate(value)) {
    return (
      <Text>{value.toLocaleString()}</Text>
    );
  }
  if (value instanceof Decimal) {
    return (
      <Text>{value.toString()}</Text>
    );
  }

  switch (typeOf(type)) {
    case 'object':
    case 'array':
    case 'pointer':
    case 'relation':
    default: return;
  }
}

export const DataSheet = ({
  data,
  columns,
  schema,
  ...props
}) => {

  const _data = React.useMemo(() => _.map(data, x => _.fromPairs(_.map(columns, c => [c, {
    value: x.get(c),
    type: schema.fields[c],
  }]))), [data]);

  return (
    <_DataSheet
      data={_data}
      columns={columns}
      renderItem={({ item, isEditing }) => (
        <DataSheetCell isEditing={isEditing} {...item} />
      )}
      {...props}
    />
  );
};
