//
//  limit.tsx
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
import { Text, UncontrolledTextInput } from '@o2ter/react-ui';
import { MenuButton } from './base';
import { Row } from '@o2ter/wireframe';

type LimitButtonProps = {
  limit: number;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
};

export const LimitButton: React.FC<LimitButtonProps> = ({
  limit,
  setLimit,
}) => (
  <MenuButton
    title='Limit'
    menu={(
      <Row classes='text-white g-2'>
        <Text>Limit</Text>
        <UncontrolledTextInput
          classes='p-0 border-0 rounded-0'
          style={{
            outline: 'none',
            color: 'white',
            backgroundColor: 'transparent',
          } as any}
          value={`${limit}`}
          onChangeText={(text) => {
            const number = parseFloat(text);
            if (_.isFinite(number)) setLimit(number);
          }}
        />
      </Row>
    )}
  />
);