//
//  index.tsx
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
import { DataSheet as _DataSheet, Icon, Text } from '@o2ter/react-ui';
import { TObject, TSchema, useProto } from '../proto';
import { DataSheetCellProps, DataSheetCell } from './cell';
import { GestureResponderEvent, Pressable } from 'react-native';
import { typeOf } from './type';
import { DataSheetEditCell } from './editCell';
import { tsvFormatRows } from 'd3-dsv';
import { Decimal, serialize } from 'proto.io/dist/client';

type _DataSheetProps = Omit<React.ComponentPropsWithoutRef<typeof _DataSheet<Record<string, DataSheetCellProps>>>, 'data' | 'columns' | 'renderItem'>;
type DataSheetProps = _DataSheetProps & {
  data: TObject[];
  columns: string[];
  schema: TSchema[string];
  sort: Record<string, 1 | -1>;
  onColumnPressed: (e: GestureResponderEvent, column: string) => void;
  onValueChanged: (value: any, row: number, column: string) => void;
}

export const DataSheet = React.forwardRef(({
  data,
  columns,
  schema,
  sort,
  showEmptyLastRow = true,
  onColumnPressed,
  onValueChanged,
  ...props
}: DataSheetProps, forwardRef: React.ForwardedRef<React.ComponentRef<typeof _DataSheet>>) => {

  const Proto = useProto();
  const _data = React.useMemo(() => _.map(data, x => _.fromPairs(_.map(columns, c => [c, {
    column: c,
    value: x.get(c),
    type: schema.fields[c],
  }]))), [data]);

  const editCell = React.useRef<React.ComponentRef<typeof DataSheetEditCell>>({});

  const encodeValue = (x: any) => {
    if (_.isNil(x)) return '';
    if (_.isNumber(x) || _.isBoolean(x) || _.isString(x)) return `${x}`;
    if (x instanceof Decimal) return x.toString();
    if (_.isDate(x)) return x.toISOString();
    if (Proto.isObject(x)) return x.objectId ?? '';
    return serialize(x);
  }

  const encoders = {
    'text/plain': (data: any[][]) => tsvFormatRows(_.map(data, row => _.map(row, val => encodeValue(val?.value)))),
    'application/json': (data: any[][]) => serialize(_.map(data, row => _.fromPairs(_.compact(_.map(row, (
      item => item ? [item.column, item.value] : undefined
    )))))),
  };

  return (
    <_DataSheet
      ref={forwardRef}
      data={_data}
      encoders={encoders}
      columns={_.map(columns, c => ({
        key: c, label: (
          <Pressable
            onPress={(e) => onColumnPressed(e, c)}
            style={{ flexDirection: 'row', alignItems: 'center', cursor: 'default' } as any}
          >
            <Text
              style={[{ flex: 1, padding: 4 }]}
              numberOfLines={1}
            >{c}<Text
              classes='font-monospace fs-small mx-1'
              style={{ color: 'gray' }}
            >({typeOf(schema.fields[c])})</Text>
            </Text>
            {sort[c] === -1 && <Icon classes='mx-1' icon='Octicons' name='triangle-down' />}
            {sort[c] === 1 && <Icon classes='mx-1' icon='Octicons' name='triangle-up' />}
          </Pressable>
        )
      }))}
      showEmptyLastRow={showEmptyLastRow}
      onEndEditing={(row, column) => onValueChanged(editCell.current.value, row, columns[column])}
      renderItem={({ item, columnIdx, isEditing }) => (
        isEditing ? <DataSheetEditCell
          ref={editCell}
          value={item?.value}
          type={schema.fields[columns[columnIdx]]}
        /> : <DataSheetCell {...item} />
      )}
      {...props}
    />
  );
});
