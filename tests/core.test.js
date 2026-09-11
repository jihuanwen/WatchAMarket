'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../core.js');

function quoteFixture() {
  const fields = Array(40).fill('');
  fields[3] = '66.64';
  fields[4] = '67.32';
  fields[5] = '66.36';
  fields[30] = '20260911161421';
  fields[31] = '-0.68';
  fields[32] = '-1.01';
  fields[33] = '67.12';
  fields[34] = '64.56';
  fields[37] = '106940';
  fields[38] = '2.18';
  fields[39] = '67.78';
  return fields.join('~');
}

test('腾讯行情核心字段按固定索引解析', () => {
  const q = core.parseTencentQuote(quoteFixture(), { code: 'sz300054', name: '鼎龙股份' });
  assert.equal(q.time, '20260911161421');
  assert.equal(q.high, 67.12);
  assert.equal(q.low, 64.56);
  assert.equal(q.amount, 10.694);
  assert.equal(q.turnover, 2.18);
});

test('关键位忽略 MA 周期和仓位比例', () => {
  const levels = core.parseKeyLevels('反弹 70(MA10) 减仓\n跌破 65.5 离场');
  assert.deepEqual(levels.reduce, { min: 70, max: 70, trigger: 'above' });
  assert.deepEqual(levels.exit, { min: 65.5, max: 65.5, trigger: 'below' });

  const ranged = core.parseKeyLevels('反弹 100-104 减 1/3\n跌破 92 离场');
  assert.deepEqual(ranged.reduce, { min: 100, max: 104, trigger: 'above' });
  assert.equal(core.levelAnchor(ranged.reduce, 'reduce'), 100);
});

test('回踩加仓只在参考区间内触发', () => {
  const levels = core.parseKeyLevels('回踩 258-260 加\n275-278 减 1/3\n破 255 离场');
  assert.equal(core.isLevelTriggered(levels.add, 'add', 261), false);
  assert.equal(core.isLevelTriggered(levels.add, 'add', 259), true);
  assert.equal(core.isLevelTriggered(levels.reduce, 'reduce', 276), true);
  assert.equal(core.isLevelTriggered(levels.exit, 'exit', 254.9), true);
});
