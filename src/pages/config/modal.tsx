//
//  modal.tsx
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
import { Modal } from '../../components/modal';
import { JSCode, Text, TextInput, View, useAlert } from '@o2ter/react-ui';
import { Row } from '@o2ter/wireframe';
import { encodeObject, verifyObject } from '../../components/datasheet/encode';
import { Decimal } from 'proto.io/dist/client';

type ParameterModalProps = {
  title: string;
  name?: string;
  initialValue?: any;
  onCancel: VoidFunction;
  onSubmit?: (name: string, value: any) => void;
};

const Resizable: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties; }>> = ({
  style,
  children,
}) => (
  <div style={{
    resize: 'vertical',
    overflow: 'auto',
    height: 0,
    paddingRight: 12,
    minHeight: 'calc(100%)' as any,
    ...style,
  }}>{children}</div>
);

export const ParameterModal: React.FC<ParameterModalProps> = ({
  title,
  name,
  initialValue,
  onCancel,
  onSubmit,
}) => {

  const [_name, setName] = React.useState(name ?? '');
  const [value, setValue] = React.useState(initialValue);
  const [error, setError] = React.useState(null);

  const { showError } = useAlert();

  return (
    <Modal
      title={title}
      onCancel={onCancel}
      onSubmit={() => {
        if (error) showError(error);
        else if (onSubmit) onSubmit(_name, value);
      }}
    >
      <View classes='bg-body'>
        <Row>
          <View classes='border-right-1 w-25 p-3'>
            <Text>Parameter name</Text>
          </View>
          <TextInput
            classes='border-0 rounded-0 flex-fill'
            value={_name}
            editable={_.isNil(name)}
            onChangeText={setName}
          />
        </Row>
        <Row classes='border-top-1'>
          <View classes='border-right-1 w-25 p-3'>
            <Text>Value</Text>
          </View>
          <View classes='flex-fill'>
            <Resizable style={{
              minHeight: 200,
            }}>
              <JSCode
                classes='w-100 h-100'
                style={{ outline: 'none' } as any}
                initialValue={_.isNil(initialValue) ? '' : encodeObject(initialValue)}
                onChangeValue={(code) => {
                  try {
                    const func = new Function('Decimal', `return (${code})`);
                    const value = func(Decimal);
                    verifyObject(value);
                    setValue(value);
                    setError(null);
                  } catch (e: any) {
                    setError(e);
                  };
                }}
              />
            </Resizable>
          </View>
        </Row>
      </View>
    </Modal>
  );
};
