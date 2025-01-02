//
//  config.ts
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
import { TSerializable, deserialize, serialize } from 'proto.io/dist/client';
import { useSessionStorage } from 'sugax';

export const useConfig = () => {
  const [config, setConfig] = useSessionStorage('X-PROTO-CONFIG');
  const _setConfig = React.useCallback((
    v: React.SetStateAction<Record<string, TSerializable | undefined>>
  ) => setConfig((x) => {
    const _x = x ? deserialize(x) as any : {};
    return serialize(_.pickBy({ ..._x, ..._.isFunction(v) ? v(_x) : v }, x => !_.isNil(x)));
  }), []);
  return [
    config ? deserialize(config) as Record<string, TSerializable> : {},
    _setConfig,
  ] as const;
}

export const useAuth = () => {
  const [config, setConfig] = useConfig();
  const auth = config.user && config.pass ? _.pick(config, ['user', 'pass']) as {
    user: string;
    pass: string;
  } : undefined;
  const setAuth = React.useCallback((auth?: { user: string; pass: string; }) => {
    setConfig({ user: auth?.user, pass: auth?.pass });
  }, []);
  return [auth, setAuth] as const;
}
