//
//  encode.tsx
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
import { Decimal } from 'proto.io/client';

const normalName = /^[a-z_][a-z\d_]\w*$/gi;

const _encodeObject = (value: any, space: number, padding: number): string => {
  const newline = space ? '\n' : '';
  if (_.isNil(value)) return 'null';
  if (_.isBoolean(value)) return value ? 'true' : 'false';
  if (_.isNumber(value)) return value.toString();
  if (_.isString(value)) return JSON.stringify(value);
  if (_.isDate(value)) return `new Date('${value.toISOString()}')`;
  if (value instanceof Decimal) return `new Decimal('${value.toString()}')`;
  if (_.isArray(value)) return _.isEmpty(value) ? '[]' : `[${newline}${_.map(value, v => (
    `${_.padStart('', padding, ' ')}${_encodeObject(v, space, padding + space)}`
  )).join(`,${newline}`)}${newline}${_.padStart('', padding - space, ' ')}]`;
  return _.isEmpty(value) ? '{}' : `{${newline}${_.map(value, (v, k) => (
    `${_.padStart('', padding, ' ')}${k.match(normalName) ? k : `"${k.replace(/[\\"]/g, '\\$&')}"`}: ${_encodeObject(v, space, padding + space)}`
  )).join(`,${newline}`)}${newline}${_.padStart('', padding - space, ' ')}}`;
};

export const encodeObject = (value: any, space = 2) => _encodeObject(value, space, space);

export const verifyObject = (value: any) => {
  if (_.isNil(value) || _.isBoolean(value) || _.isNumber(value) || _.isString(value) || _.isDate(value)) return;
  if (value instanceof Decimal) return;
  if (_.isArray(value)) {
    for (const item of value) {
      verifyObject(item);
    }
    return;
  }
  if (_.isPlainObject(value)) {
    for (const v of _.values(value)) {
      verifyObject(v);
    }
    return;
  }
  throw Error('Invalid Object');
};
