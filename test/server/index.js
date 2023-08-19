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
import { ProtoService } from 'proto.io';
import { DatabaseFileStorage } from 'proto.io/dist/adapters/file/database';
import { PostgresStorage } from 'proto.io/dist/adapters/storage/progres';

const {
  SERVER_URL, DATABASE_URI, JWT_KEY, DASHBOARD_USER, DASHBOARD_PASS,
} = process.env;

const database = new PostgresStorage(DATABASE_URI);
const masterUsers = [];
if (!_.isEmpty(DASHBOARD_USER) && !_.isEmpty(DASHBOARD_PASS)) {
  masterUsers.push({
    user: DASHBOARD_USER,
    pass: DASHBOARD_PASS
  });
}

const Proto = new ProtoService({
  endpoint: SERVER_URL || 'http://localhost:8080/proto',
  masterUsers: masterUsers,
  jwtToken: JWT_KEY,
  storage: database,
  fileStorage: new DatabaseFileStorage(),
  schema: {},
});

export default async (app, env) => {

  env.PROTO_SERVER_URL = SERVER_URL || 'http://localhost:8080/proto';

  app.use('/proto', await ProtoRoute({
    proto: Proto,
  }));
}
