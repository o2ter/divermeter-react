//
//  editCell.tsx
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
import { TextInput, Switch, View } from '@o2ter/react-ui';
import { Decimal } from 'proto.io/dist/client';
import { TDataType } from '../proto';
import { typeOf } from './type';

export type DataSheetEditCellProps = {
  value?: any;
  type?: TDataType;
};

export const DataSheetEditCell = React.forwardRef<{ value?: any }, DataSheetEditCellProps>(({
  value,
  type,
}, forwardRef) => {

  const [_value, setValue] = React.useState(value);
  React.useImperativeHandle(forwardRef, () => ({ value: _value }), [_value]);

  switch (typeOf(type)) {
    case 'boolean':
      return (
        <View classes='p-1 align-items-end'>
          <Switch
            selected={_value ?? false}
            onPress={() => setValue((v: any) => !v)}
          />
        </View>
      );
    case 'number':
      return (
        <TextInput
          classes='border-0 rounded-0'
          value={_value?.toString() ?? ''}
          onChangeText={(text) => {
            const number = parseFloat(text);
            if (_.isFinite(number)) setValue(number);
          }}
        />
      );
    case 'decimal':
      return (
        <TextInput
          classes='border-0 rounded-0'
          value={_value?.toString() ?? ''}
          onChangeText={(text) => {
            const number = new Decimal(text);
            if (number.isFinite()) setValue(number);
          }}
        />
      );
    case 'string':
      return (
        <div className='position-relative w-100 h-100'>
          <div className='position-absolute' style={{
            resize: 'both',
            overflow: 'auto',
            width: 0,
            height: 0,
            minWidth: '100%',
            minHeight: '100%',
            backgroundColor: 'white',
            left: -1,
            top: -1,
            border: 1,
            borderStyle: 'solid',
            borderColor: '#DDD',
            paddingTop: 6,
            paddingBottom: 6,
            paddingLeft: 12,
            paddingRight: 12,
          }}>
            <TextInput
              classes='border-0 rounded-0 p-0 w-100 h-100'
              value={_value ?? ''}
              onChangeText={(text) => setValue(text)}
              multiline
            />
          </div>
        </div>
      );
    case 'date':
    case 'object':
    case 'array':
    case 'pointer':
    case 'relation':
    default: return;
  }
});
