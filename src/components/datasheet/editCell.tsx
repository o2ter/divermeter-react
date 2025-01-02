//
//  editCell.tsx
//
//  The MIT License
//  Copyright (c) 2021 - 2025 O2ter Limited. All rights reserved.
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
import { TextInput, Switch, View, Text, UploadInput, JSCode } from '@o2ter/react-ui';
import { Decimal } from 'proto.io/dist/client';
import { TDataType, useProto } from '../../proto';
import { typeOf } from './type';
import { encodeObject, verifyObject } from './encode';

export type DataSheetEditCellProps = {
  value?: any;
  type?: TDataType;
};

const paddingStyle = {
  paddingTop: 6,
  paddingBottom: 6,
  paddingLeft: 12,
  paddingRight: 12,
} as const;

const borderStyle = {
  top: -1,
  left: -1,
  borderWidth: 1,
  borderColor: '#DDD',
  borderStyle: 'solid',
  backgroundColor: 'white',
  minWidth: 'calc(100% + 2px)' as any,
  minHeight: 'calc(100% + 2px)' as any,
} as const;

const Resizable: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties; }>> = ({
  style,
  children,
}) => (
  <div className='position-relative w-100 h-100'>
    <div className='position-absolute' style={{
      resize: 'both',
      overflow: 'auto',
      width: 0,
      height: 0,
      ...borderStyle,
      ...style,
    }}>{children}</div>
  </div>
);

export const DataSheetEditCell = React.forwardRef<{ value?: any }, DataSheetEditCellProps>(({
  value,
  type,
}, forwardRef) => {

  const [_value, setValue] = React.useState(value);
  const [str, setStr] = React.useState<string>();
  React.useImperativeHandle(forwardRef, () => ({ value: _value }), [_value]);

  const Proto = useProto();

  switch (typeOf(type)) {
    case 'boolean':
      return (
        <View classes='p-1 align-items-end' style={borderStyle}>
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
          style={{ outline: 'none' } as any}
          value={str ?? _value?.toString() ?? ''}
          onChangeText={(text) => {
            setStr(text);
            const number = parseFloat(text);
            if (_.isFinite(number)) setValue(number);
          }}
          autoFocus
        />
      );
    case 'decimal':
      return (
        <TextInput
          classes='border-0 rounded-0'
          style={{ outline: 'none' } as any}
          value={str ?? _value?.toString() ?? ''}
          onChangeText={(text) => {
            setStr(text);
            const number = new Decimal(text);
            if (number.isFinite()) setValue(number);
          }}
          autoFocus
        />
      );
    case 'string':
      return (
        <Resizable style={paddingStyle}>
          <TextInput
            classes='border-0 rounded-0 p-0 w-100 h-100'
            style={{ outline: 'none' } as any}
            value={_value ?? ''}
            onChangeText={(text) => setValue(text)}
            multiline
            autoFocus
          />
        </Resizable>
      );
    case 'date': return <></>;
    case 'object':
    case 'array':
      return (
        <Resizable style={{ paddingRight: 12, width: 300, height: 200 }}>
          <JSCode
            classes='w-100 h-100'
            style={{ outline: 'none' } as any}
            initialValue={_.isNil(_value) ? '' : encodeObject(_value)}
            onChangeValue={(code) => {
              try {
                const func = new Function('Decimal', `return (${code})`);
                const value = func(Decimal);
                verifyObject(value);
                setValue(value);
              } catch { };
            }}
          />
        </Resizable>
      );
    case 'file':
      return (
        <View
          classes='gap-1 bg-white'
          style={{
            ...paddingStyle,
            ...borderStyle,
          }}
        >
          <UploadInput onChange={(e) => {
            const [file] = e.target.files ?? [];
            if (file) setValue(Proto.File(file.name, file, file.type));
          }}>
            {(input) => (
              <Text
                classes='text-white text-center rounded'
                style={{ backgroundColor: 'mediumblue' }}
                onPress={() => { input.current?.click(); }}
              >Upload</Text>
            )}
          </UploadInput>
          {value?.url && <Text
            classes='text-white text-center rounded'
            style={{ backgroundColor: 'mediumblue' }}
            onPress={() => { window.open(value.url, '_blank'); }}
          >Download</Text>}
        </View>
      );
    case 'pointer':
      return (
        <TextInput
          classes='border-0 rounded-0'
          style={{ outline: 'none' } as any}
          value={_value?.objectId ?? ''}
          onChangeText={(text) => {
            if (_.isString(type) || type?.type !== 'pointer') return <></>;
            setValue(_.isEmpty(text) ? null : Proto.Object(type.target, text));
          }}
          autoFocus
        />
      );
    case 'relation': return <></>;
    default: return <></>;
  }
});
