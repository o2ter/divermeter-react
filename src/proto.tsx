//
//  proto.tsx
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
import ProtoClient from 'proto.io/dist/client';
import { env } from '@o2ter/react-booster/src/route/client/env';

export const createProto = (
  auth?: { user: string; pass: string; },
) => new ProtoClient({ endpoint: env.PROTO_SERVER_URL, masterUser: auth });

const ProtoContext = React.createContext(createProto());

export const ProtoProvider = (props: React.PropsWithChildren<{
  auth?: { user: string; pass: string; };
}>) => {
  const proto = React.useMemo(() => createProto(props.auth), [props.auth?.user, props.auth?.pass]);
  return (
    <ProtoContext.Provider value={proto}>{props.children}</ProtoContext.Provider>
  );
};

export const useProto = () => React.useContext(ProtoContext);

