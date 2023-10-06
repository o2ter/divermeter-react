//
//  filter.tsx
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
import { MenuButton } from './base';
import { View } from '@o2ter/react-ui';

type FilterButtonProps = {
  filter: any[];
  setFilter: React.Dispatch<React.SetStateAction<any[]>>;
};

const comparisonKeys = [
  '$eq',
  '$gt',
  '$gte',
  '$lt',
  '$lte',
  '$ne',
] as const;

const conditionalKeys = [
  '$and',
  '$nor',
  '$or',
] as const;

type DecodedFilter = {
  op: string;
  field?: string;
  value?: any;
  exprs?: DecodedFilter[];
};

const decodeFilter = (selectors: any[]) => {
  const decoded: DecodedFilter[] = [];
  for (const selector of selectors) {
    for (const [key, query] of _.toPairs(selector)) {
      if (_.includes(conditionalKeys, key) && _.isArray(query)) {
        decoded.push({ op: key, exprs: decodeFilter(query) });
      } else if (!key.startsWith('$') && !_.isArray(query)) {

      }
    }
  }
  return decoded;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
  filter,
  setFilter,
}) => {


  return (
    <MenuButton
      title='Filter'
      menu={(
        <View classes='text-white' style={{ width: 100, height: 100 }}>

        </View>
      )}
    />
  );
}