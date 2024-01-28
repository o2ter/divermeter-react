//
//  index.js
//
//  The MIT License
//  Copyright (c) 2021 - 2024 O2ter Limited. All rights reserved.
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
import { View, Form, Text, useActivity, useAlert } from '@o2ter/react-ui';
import { Row } from '@o2ter/wireframe';

import Localization from '../../i18n/login';
import { string } from '@o2ter/valid.js';
import { createProto } from '../../proto';
import { useAuth } from '../../config';

export const Login = () => {
  const [, setAuth] = useAuth();
  const startActivity = useActivity();
  const { showError } = useAlert();
  const { string: t } = Localization.useLocalize();
  return (
    <View classes='flex-fill bg-primary-900 align-items-center justify-content-center'>
      <View classes='bg-white px-3 py-2 rounded-1'>
        <Form
          schema={{
            user: string().required().label(t('username')),
            pass: string().required().label(t('password')),
          }}
          onSubmit={async (values) => {
            try {
              await startActivity(async () => {
                const proto = createProto(values);
                await proto.schema({ master: true });
                setAuth(values);
                window.location.reload();
              });
            } catch {
              showError(t('invalid_user'));
            }
          }}
        >
          <View classes='py-1'>
            <Row classes='justify-content-between'>
              <Text>{t('username')}</Text>
              <Form.ErrorMessage name='user' />
            </Row>
            <Form.TextField name='user' />
          </View>
          <View classes='py-1'>
            <Row classes='justify-content-between'>
              <Text>{t('password')}</Text>
              <Form.ErrorMessage name='pass' />
            </Row>
            <Form.TextField secureTextEntry name='pass' />
          </View>
          <View classes='py-1'>
            <Form.Button title={t('login')} color='primary' action='submit' />
          </View>
        </Form>
      </View>
    </View>
  );
};

export default Login;