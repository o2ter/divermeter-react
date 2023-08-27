//
//  index.js
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
import { View, Text, useParams, TextStyleProvider } from '@o2ter/react-ui';
import { useAsyncResource } from 'sugax';
import { useProto } from '../proto';

export const Browser = ({ schema }) => {

  const Proto = useProto();
  const { class: _class } = useParams();

  const { resource: objCount } = useAsyncResource(() => {
    return Proto.Query(_class, { master: true }).count();
  }, null, [_class]);

  return (
    <View classes='flex-fill'>
      <View classes='py-3 px-4 flex-row bg-secondary-600'>
        <View>
          <Text classes='text-secondary-200 font-monospace' style={{ fontSize: 10 }}>CLASS</Text>
          <Text>
            <Text classes='h1 text-white'>{_class}</Text>
            {!_.isNil(objCount) && <Text
              classes='fs-small ml-3 text-secondary-200 font-monospace'
            >{objCount} objects</Text>}
          </Text>
        </View>
        <View>
        </View>
      </View>
      <View classes='flex-fill py-3 px-4 bg-secondary-100'>
      </View>
    </View>
  );
};
