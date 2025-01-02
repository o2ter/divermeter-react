//
//  filter.tsx
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
import { MenuButton } from './base';
import { Button, JSCode } from '@o2ter/react-ui';
import { Col, Row } from '@o2ter/wireframe';
import { TDataType } from '../../../proto';
import { encodeObject, verifyObject } from '../../../components/datasheet/encode';
import { Decimal } from 'proto.io/dist/client';

const Resizable: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties; }>> = ({
  style,
  children,
}) => (
  <div style={{
    resize: 'both',
    overflow: 'auto',
    backgroundColor: 'white',
    ...style,
  }}>{children}</div>
);

type FilterButtonProps = {
  fields: Record<string, TDataType>;
  filter: any[];
  setFilter: React.Dispatch<React.SetStateAction<any[]>>;
};

export const FilterButton: React.FC<FilterButtonProps> = ({
  fields,
  filter,
  setFilter,
}) => {

  const [store, setStore] = React.useState(filter);

  console.log(store)

  return (
    <MenuButton
      title='Filter'
      extraData={store}
      menu={({ hide }) => (
        <Col classes='gap-2'>
          <Resizable
            style={{
              paddingRight: 12,
              minWidth: 300,
              minHeight: 200,
            }}>
            <JSCode
              classes='w-100 h-100'
              style={{ outline: 'none' } as any}
              initialValue={_.isNil(store) ? '' : encodeObject(store)}
              onChangeValue={(code) => {
                try {
                  const func = new Function('Decimal', `return (${code})`);
                  const value = func(Decimal);
                  verifyObject(value);
                  setStore(value);
                } catch { };
              }}
            />
          </Resizable>
          <Row classes='gap-1'>
            <Button title='Cancel' variant='outline' color='danger' onPress={() => {
              hide();
            }} />
            <Button title='Submit' variant='outline' color='light' onPress={() => {
              setFilter(store);
              hide();
            }} />
          </Row>
        </Col>
      )}
    />
  );
}