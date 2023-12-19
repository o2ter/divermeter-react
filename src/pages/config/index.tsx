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
import { View, Text, Button, useModal, useActivity, useAlert } from '@o2ter/react-ui';
import { useProto } from '../../proto';
import { useAsyncResource } from 'sugax';
import { Decimal, serialize } from 'proto.io/dist/client';
import { ParameterModal } from './modal';
import { Row } from '@o2ter/wireframe';

const valueToType = (value: any) => {
  if (_.isNil(value)) return 'null';
  if (_.isBoolean(value)) return 'boolean';
  if (_.isNumber(value)) return 'number';
  if (_.isString(value)) return 'string';
  if (_.isDate(value)) return 'date';
  if (value instanceof Decimal) return 'decimal';
  if (_.isArray(value)) return 'array';
  return 'object';
}

const valueToString = (value: any) => {
  if (_.isNil(value)) return 'null';
  if (_.isBoolean(value)) return value ? 'true' : 'false';
  if (_.isNumber(value)) return value.toString();
  if (_.isString(value)) return value;
  if (_.isDate(value)) return value.toLocaleString();
  if (value instanceof Decimal) return value.toString();
  return serialize(value);
}

export const Config: React.FC<{}> = () => {
  const Proto = useProto();
  const { resource: config, refresh } = useAsyncResource(() => Proto.config());

  const setModal = useModal();
  const startActivity = useActivity();

  const { showError } = useAlert();

  return (
    <>
      <Row classes='py-3 px-4 justify-content-between bg-secondary-600 text-secondary-200 font-monospace'>
        <View>
          <Text style={{ fontSize: 10 }}>SYSTEM</Text>
          <Text classes='h1 text-white'>Config</Text>
        </View>
        <View classes='justify-content-end'>
          <Row classes='text-white'>
            <Button
              outline
              color='light'
              title='Create a parameter'
              onPress={() => setModal(
                <ParameterModal
                  title='Create a parameter'
                  onCancel={() => setModal()}
                  onSubmit={(name, value) => startActivity(async () => {
                    if (_.isEmpty(name)) {
                      return showError('Empty parameter name is not allowed.');
                    }
                    await Proto.setConfig({ [name]: value }, { master: true });
                    await refresh();
                    setModal();
                  })}
                />
              )}
            />
          </Row>
        </View>
      </Row>
      <View classes='flex-fill bg-secondary-100'>
        <div className='flex-fill overflow-auto'>
          <table className='table-striped'>
            <thead className='bg-secondary-400 text-white'>
              <tr>
                <th>name</th>
                <th>type</th>
                <th>value</th>
              </tr>
            </thead>
            <tbody>
              {_.map(config, (value, key) => (
                <tr onClick={() => {
                  setModal(
                    <ParameterModal
                      title='Update parameter'
                      name={key}
                      initialValue={value}
                      onCancel={() => setModal()}
                      onSubmit={(name, value) => startActivity(async () => {
                        await Proto.setConfig({ [name]: value }, { master: true });
                        await refresh();
                        setModal();
                      })}
                    />
                  )
                }}>
                  <td>{key}</td>
                  <td>{valueToType(value)}</td>
                  <td>{valueToString(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </View>
    </>
  );
}