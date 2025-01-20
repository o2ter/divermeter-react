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
import { Button, JSCode, View } from '@o2ter/react-ui';
import { Row } from '@o2ter/wireframe';
import { encodeObject, verifyObject } from '../../../components/datasheet/encode';
import { Decimal } from 'proto.io/dist/client';

type FilterButtonProps = {
  filter: any[];
  setFilter: React.Dispatch<React.SetStateAction<any[]>>;
};

export const FilterControl: React.FC<FilterButtonProps> = ({
  filter,
  setFilter,
}) => {
  const [store, setStore] = React.useState(filter);
  const initialValue = React.useMemo(() => {
    if (_.isNil(store)) return '';
    const str = encodeObject(store, 0);
    return str.length < 60 ? str : encodeObject(store);
  }, [store]);
  return (
    <Row classes='align-items-start gap-2'>
      <View classes='flex-fill bg-white rounded overflow-hidden'>
        <View
          classes='flex-fill'
          style={{
            minHeight: 32,
            maxHeight: 200,
            overflow: 'scroll',
          }}
        >
          <JSCode
            classes='w-100 h-100'
            style={{ outline: 'none' } as any}
            initialValue={initialValue}
            onChangeValue={(code) => {
              try {
                const func = new Function('Decimal', `return (${code})`);
                const value = func(Decimal);
                verifyObject(value);
                setStore(value);
              } catch { };
            }}
          />
        </View>
      </View>
      <Button title='Submit' color='success' onPress={() => {
        setFilter(store);
      }} />
      <Button title='Reset' color='gray-600' onPress={() => {
        setStore(filter);
      }} />
    </Row>
  );
}