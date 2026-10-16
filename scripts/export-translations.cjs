// Read the existing dictionaries without executing browser code.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const context = {window: {}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'assets/funnel-copy.js'), 'utf8'), context);
const source = fs.readFileSync(path.join(root, 'assets/i18n.js'), 'utf8');
const stop = source.indexOf('  const t = value =>');
if (stop < 0) throw Error('Translation dictionary boundary changed');
vm.runInContext(source.slice(0, stop) + '\nwindow.dictionary = ar;})();', context);
process.stdout.write(JSON.stringify(context.window.dictionary));
