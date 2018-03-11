import json2csv = require('json-2-csv');
import { remote } from 'electron';
import { writeFile } from 'fs';

export default items =>
  json2csv.json2csvPromisified(items, { emptyFieldValue: '' }).then(
    (csv: string) =>
      new Promise((resolve, reject) => {
        remote.dialog.showSaveDialog({ showsTagField: false, defaultPath: 'export.csv' }, async (fileName: string) => {
          if (!fileName) return reject(new Error('Empty filename'));
          writeFile(fileName, csv, err => (err ? reject(err) : resolve()));
        });
      })
  );
