//
//  cell.tsx
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
import { Icon, Text, useNavigate, useParams } from '@o2ter/react-ui';
import { Decimal, isFile, serialize } from 'proto.io/client';
import { TDataType } from '../../proto';
import { typeOf } from '../../utils';

export type DataSheetCellProps = {
  id?: string;
  column?: string;
  value?: any;
  type?: TDataType;
  hidden?: boolean;
};

const _DataSheetCell: React.FC<DataSheetCellProps> = ({ id, column, value, type, hidden }) => {

  const navigate = useNavigate();
  const { class: className } = useParams();

  if (hidden) {
    return (
      <Text classes='font-monospace text-right' style={{ color: 'lightgray' }} numberOfLines={1}>(hidden)</Text>
    );
  }

  if (_.isNil(value)) {
    return (
      <Text classes='font-monospace text-right' style={{ color: 'lightgray' }} numberOfLines={1}>null</Text>
    );
  }
  if (_.isBoolean(value)) {
    return (
      <Text classes='font-monospace text-right' style={{ color: 'darkblue' }} numberOfLines={1}>{value ? 'true' : 'false'}</Text>
    );
  }
  if (_.isNumber(value)) {
    return (
      <Text classes='font-monospace text-right' style={{ color: 'mediumblue' }} numberOfLines={1}>{value.toString()}</Text>
    );
  }
  if (_.isString(value)) {
    return (
      <Text classes='font-monospace text-right' style={{ color: 'darkred' }} numberOfLines={1}>{value}</Text>
    );
  }
  if (_.isDate(value)) {
    return (
      <Text classes='font-monospace text-right' style={{ color: 'darkslateblue' }} numberOfLines={1}>{value.toLocaleString()}</Text>
    );
  }
  if (value instanceof Decimal) {
    return (
      <Text classes='font-monospace text-right' style={{ color: 'mediumblue' }} numberOfLines={1}>{value.toString()}</Text>
    );
  }

  switch (typeOf(type)) {
    case 'object':
    case 'array':
    case 'string[]':
      return (
        <Text classes='font-monospace text-right' numberOfLines={1}>{serialize(value)}</Text>
      );
    case 'file':
      return (
        <Text
          classes='font-monospace text-white text-center rounded'
          style={{ backgroundColor: 'mediumblue' }}
          onPress={() => { window.open(value.url, '_blank'); }}
        >{value.filename}</Text>
      );
    case 'pointer':
      return (
        <Text classes='font-monospace text-right' style={{ color: 'rebeccapurple' }} numberOfLines={1}>
          {value.id}
          <Icon
            classes='ml-1'
            icon='Ionicons'
            name='arrow-redo-circle'
            onPress={() => {
              if (value?.className) {
                navigate(`/browser/${value.className}`, {
                  state: {
                    filter: [{
                      _id: {
                        $eq: value.id,
                      },
                    }]
                  }
                });
              }
            }}
          />
        </Text>
      );
    case 'relation':
      return (
        <Text classes='font-monospace text-right' style={{ color: 'gray' }} numberOfLines={1}>
          {_.castArray(value).length} objects
          <Icon
            classes='ml-1'
            icon='Ionicons'
            name='arrow-redo-circle'
            onPress={() => {
              if (id && column && className) {
                navigate(`/browser/${(type as any).target}`, {
                  state: {
                    relatedBy: {
                      className,
                      id,
                      key: column,
                      editable: !(type as any).foreignField,
                    },
                  }
                });
              }
            }}
          />
        </Text>
      );
    default: return <></>;
  }
};

export const DataSheetCell = React.memo(_DataSheetCell);
