/* Laadt de datatabel en de rekenmotor buiten de browser (voor tests en controles).
   Gebruik: const { laadRP } = require('./laad.cjs'); const RP = laadRP(); */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function laadRP(map = __dirname) {
  const ctx = {};
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  const dataMap = path.join(map, 'data');
  const bestanden = ['basis.js'].concat(fs.readdirSync(dataMap).filter((n) => n.endsWith('.js') && n !== 'basis.js').sort());
  for (const naam of bestanden) vm.runInContext(fs.readFileSync(path.join(dataMap, naam), 'utf8'), ctx, { filename: 'data/' + naam });
  vm.runInContext(fs.readFileSync(path.join(map, 'motor.js'), 'utf8'), ctx, { filename: 'motor.js' });
  if (!ctx.RP) throw new Error('motor.js zette RP niet');
  ctx.RP.DATA_BESTANDEN = bestanden;
  return ctx.RP;
}

module.exports = { laadRP };
