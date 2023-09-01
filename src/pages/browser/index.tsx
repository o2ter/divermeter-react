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
import { View, Text, useParams, useToast } from '@o2ter/react-ui';
import { useAsyncResource } from 'sugax';
import { TObject, TSchema, useProto } from '../../proto';
import { DataSheet } from '../../datasheet';
import { useConfig } from '../../config';

const BrowserBody: React.FC<{ schema: TSchema; className: string; }> = ({ schema, className }) => {

  const Proto = useProto();
  const _schema = schema?.[className];
  const _fields = _schema?.fields ?? {};
  const _columns = _.keys(_fields);

  const [config, setConfig] = useConfig() as any;
  const _columnWidths = config['column-widths']?.[className] ?? {};

  const { showError } = useToast();

  const [filter, setFilter] = React.useState<any[]>([]);
  const [sort, setSort] = React.useState<Record<string, 1 | -1>>({ _id: 1 });
  const [limit, setLimit] = React.useState(100);

  const query = React.useMemo(() => {
    const query = Proto.Query(className, { master: true });
    for (const f of filter) query.filter(f);
    query.includes(
      '*',
      ..._.toPairs(_fields)
        .filter(([, type]) => !_.isString(type) && (type.type === 'pointer' || type.type === 'relation'))
        .map(([key]) => `${key}._id`)
    );
    return query;
  }, [className, filter]);

  const { resource: objCount } = useAsyncResource(() => query.count(), undefined, [className, query]);
  const { resource: objs } = useAsyncResource(async () => {
    try {
      return await query.clone().sort(sort).limit(limit).find();
    } catch (e: any) {
      console.error(e);
      showError(e);
    }
  }, undefined, [query, sort, limit]);

  const [updatedObjs, setUpdatedObjs] = React.useState<Record<string, TObject>>({});
  React.useEffect(() => setUpdatedObjs({}), [objs]);

  const _objs = React.useMemo(() => _.map(objs, obj => updatedObjs[obj.objectId!] ?? obj), [objs, updatedObjs]);

  return (
    <View classes='flex-fill'>
      <View classes='py-3 px-4 flex-row bg-secondary-600'>
        <View>
          <Text classes='text-secondary-200 font-monospace' style={{ fontSize: 10 }}>CLASS</Text>
          <Text>
            <Text classes='h1 text-white'>{className}</Text>
            {!_.isNil(objCount) && <Text
              classes='fs-small ml-3 text-secondary-200 font-monospace'
            >{objCount} objects</Text>}
          </Text>
        </View>
        <View>
        </View>
      </View>
      <View classes='flex-fill p-1 bg-secondary-100'>
        {_schema && <div className='overflow-auto h-100'>
          <DataSheet
            data={_objs}
            schema={_schema}
            columns={_columns}
            columnWidth={_columns.map(c => _columnWidths[c])}
            onColumnPressed={(e: any, column) => {
              setSort(sort => ({
                ...e.shiftKey ? _.omit(sort, column) : {},
                [column]: sort[column] === 1 ? -1 : 1,
              }));
            }}
            onColumnWidthChange={(col, width) => setConfig((c: any) => ({
              ...c,
              'column-widths': {
                ...c['column-widths'],
                [className]: {
                  ...c['column-widths']?.[className] ?? {},
                  [_columns[col]]: width,
                }
              }
            }))}
          />
        </div>}
      </View>
    </View>
  );
};

export const Browser: React.FC<{ schema: TSchema; }> = ({ schema }) => {
  const { class: className = '' } = useParams();
  return (
    <BrowserBody key={className} className={className} schema={schema} />
  );
};