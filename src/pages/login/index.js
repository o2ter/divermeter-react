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
import { View, Form, Text, useActivity, useToast } from '@o2ter/react-ui';

import Localization from '../../i18n/pages/login';
import { shiftColor, useTheme } from '@o2ter/react-ui/dist/index.web';
import { string } from '@o2ter/valid.js';
import { createProto } from '../../proto';

export const Login = ({ setAuth }) => {
  const theme = useTheme();
  const startActivity = useActivity();
  const { showError } = useToast();
  const localization = Localization.useLocalize();
  return (
    <View style={{
      flex: 1,
      backgroundColor: shiftColor(theme.themeColors.primary, theme.colorWeights['900']),
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <View style={{
        backgroundColor: 'white',
        paddingHorizontal: theme.spacers['3'],
        paddingVertical: theme.spacers['2'],
        borderRadius: theme.borderRadius['sm'],
      }}>
        <Form
          schema={{
            user: string().required().label(localization.string('username')),
            pass: string().required().label(localization.string('password')),
          }}
          onSubmit={async (values) => {
            try {
              await startActivity(async () => {
                const proto = createProto(values);
                await proto.schema({ master: true });
                setAuth(values);
              });
            } catch {
              showError(localization.string('invalid_user'));
            }
          }}
        >
          <View style={{ paddingVertical: theme.spacers['1'] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{localization.string('username')}</Text>
              <Form.ErrorMessage name='user' />
            </View>
            <Form.TextField name='user' />
          </View>
          <View style={{ paddingVertical: theme.spacers['1'] }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>{localization.string('password')}</Text>
              <Form.ErrorMessage name='pass' />
            </View>
            <Form.TextField secureTextEntry name='pass' />
          </View>
          <View style={{ paddingVertical: theme.spacers['1'] }}>
            <Form.Button title={localization.string('login')} variant='primary' action='submit' />
          </View>
        </Form>
      </View>
    </View>
  );
};

export default Login;