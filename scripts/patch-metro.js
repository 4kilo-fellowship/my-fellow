const fs = require('fs');
const path = require('path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-css-interop',
  'dist',
  'metro',
  'index.js'
);

if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (!content.includes('removedFiles: new Map()')) {
    content = content.replace(
      'eventsQueue: [\n                    {\n                        filePath,\n                        metadata: {\n                            modifiedTime: Date.now(),\n                            size: 1,\n                            type: "virtual",\n                        },\n                        type: "change",\n                    },\n                ],',
      'eventsQueue: [\n                    {\n                        filePath,\n                        metadata: {\n                            modifiedTime: Date.now(),\n                            size: 1,\n                            type: "virtual",\n                        },\n                        type: "change",\n                    },\n                ],\n                changes: {\n                    addedFiles: new Map(),\n                    modifiedFiles: new Map(),\n                    removedFiles: new Map(),\n                },\n                addedFiles: new Map(),\n                modifiedFiles: new Map(),\n                deletedFiles: new Map(),\n                removedFiles: new Map(),'
    );
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log('[patch-metro] Successfully patched react-native-css-interop for Metro watcher compatibility.');
  }
}
