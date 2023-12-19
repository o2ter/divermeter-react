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
import { Button, Picker } from '@o2ter/react-ui';
import { Col, Row } from '@o2ter/wireframe';
import { TDataType } from '../../../proto';

const conditionalKeys = {
  '$and': 'and',
  '$nor': 'nor',
  '$or': 'or',
};

type ConditionalFilterType = {
  op: keyof typeof conditionalKeys;
  exprs: FilterType[];
};

const isConditionalFilter = (x: FilterType): x is ConditionalFilterType => _.includes(_.keys(conditionalKeys), x.op);

const comparisonKeys = {
  '$eq': 'equal',
  '$gt': 'greater',
  '$gte': 'greater or equal',
  '$lt': 'less',
  '$lte': 'less or equal',
  '$ne': 'not equal',
};

type ComparisonFilterType = {
  op: keyof typeof comparisonKeys;
  field: string;
  value: any;
};

const isComparisonFilter = (x: FilterType): x is ComparisonFilterType => _.includes(_.keys(comparisonKeys), x.op);

export type FilterType = ConditionalFilterType | ComparisonFilterType;

export const encodeFilter = (filter: FilterType): any => {
  if (isConditionalFilter(filter)) {
    return { [filter.op]: _.map(filter.exprs, v => encodeFilter(v)) };
  }
  if (isComparisonFilter(filter)) {
    return { [filter.field]: { [filter.op]: filter.value } };
  }
  throw Error();
}

type FilterSectionProps = {
  fields: Record<string, TDataType>;
  filter: FilterType;
  setFilter: React.Dispatch<React.SetStateAction<FilterType>>;
};

const FilterSection: React.FC<FilterSectionProps> = ({
  fields,
  filter,
  setFilter,
}) => (
  <Row>
    <Picker
      value={filter.op ?? ''}
      items={[
        { label: '', value: '' },
        ..._.map(_.toPairs(conditionalKeys), ([op, v]) => ({ label: v, value: op })),
        ..._.map(_.toPairs(comparisonKeys), ([op, v]) => ({ label: v, value: op })),
      ]}
      onValueChange={(op) => {
        if (_.includes(conditionalKeys, op)) {
          setFilter((v) => ({ ..._.pick(v, 'exprs'), op }) as any)
        } else if (_.includes(conditionalKeys, op)) {
          setFilter((v) => ({ ..._.pick(v, 'field', 'value'), op }) as any)
        }
      }}
    />
    {isConditionalFilter(filter) && <Col>
      {_.map(filter.exprs, (f, i) => (
        <FilterSection
          key={i}
          fields={fields}
          filter={f}
          setFilter={(x) => setFilter((v) => ({ ...v, exprs: _.set([...filter.exprs], i, _.isFunction(x) ? x(filter.exprs[i]) : x) }))}
        />
      ))}
    </Col>}
    {isComparisonFilter(filter) && <>
      <Picker
        value={filter.field ?? ''}
        items={[
          { label: '', value: '' },
          ..._.map(_.keys(fields), (f) => ({ label: f, value: f }))
        ]}
        onValueChange={(f) => setFilter((v) => ({ ...v, field: f }))}
      />
    </>}
  </Row>
);

type FilterButtonProps = {
  fields: Record<string, TDataType>;
  filter: FilterType[];
  setFilter: React.Dispatch<React.SetStateAction<FilterType[]>>;
};

export const FilterButton: React.FC<FilterButtonProps> = ({
  fields,
  filter,
  setFilter,
}) => {

  const [store, setStore] = React.useState(filter);

  return (
    <MenuButton
      title='Filter'
      menu={({ hide }) => (
        <Col classes='text-white'>
          {_.map(store, (filter, i) => (
            <FilterSection
              key={i}
              fields={fields}
              filter={filter}
              setFilter={(x) => setStore(v => _.set([...v], i, _.isFunction(x) ? x(v[i]) : x))}
            />
          ))}
          <Row classes='gap-1'>
            <Button title='Cancel' outline color='danger' onPress={() => {
              hide();
            }} />
            <Button title='Submit' outline color='light' onPress={() => {
              setFilter(store);
              hide();
            }} />
          </Row>
        </Col>
      )}
    />
  );
}