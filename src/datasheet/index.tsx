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
import { DataSheet as _DataSheet, Text } from '@o2ter/react-ui';
import { TObject, TSchema } from '../proto';
import { DataSheetCellProps, typeOf, DataSheetCell } from './cell';
import { GestureResponderEvent, Pressable } from 'react-native';

type DataSheetProps = Omit<React.ComponentPropsWithoutRef<typeof _DataSheet<Record<string, DataSheetCellProps>>>, 'data' | 'columns' | 'renderItem'> & {
  data: TObject[];
  columns: string[];
  schema: TSchema[string];
  onColumnPressed: (e: GestureResponderEvent, column: string) => void;
}

export const DataSheet: React.FC<DataSheetProps> = ({
  data,
  columns,
  schema,
  showEmptyLastRow = true,
  onColumnPressed,
  ...props
}) => {

  const _data = React.useMemo(() => _.map(data, x => _.fromPairs(_.map(columns, c => [c, {
    value: x.get(c),
    type: schema.fields[c],
  }]))), [data]);

  return (
    <_DataSheet
      data={_data}
      columns={_.map(columns, c => ({
        key: c, label: (
          <Pressable
            onPress={(e) => onColumnPressed(e, c)}
            style={{ cursor: 'default' } as any}
          >
            <Text
              style={[{ flex: 1, padding: 4 }]}
              numberOfLines={1}
            >{c}<Text
              classes='font-monospace fs-small ml-1'
              style={{ color: 'gray' }}
            >({typeOf(schema.fields[c])})</Text></Text>
          </Pressable>
        )
      }))}
      showEmptyLastRow={showEmptyLastRow}
      renderItem={({ item, rowIdx, columnIdx, isEditing }) => (
        <DataSheetCell {...item} />
      )}
      {...props}
    />
  );
};
