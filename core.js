(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MarketCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function finiteNumber(v) {
    var n = parseFloat(v);
    return isFinite(n) ? n : NaN;
  }

  /* 腾讯 qt 接口的公共字段布局，股票和指数使用同一组核心索引。 */
  function parseTencentQuote(raw, item) {
    if (!raw || !item) return null;
    var a = String(raw).split('~');
    var price = finiteNumber(a[3]);
    var prev = finiteNumber(a[4]);
    var open = finiteNumber(a[5]);
    if (!(price > 0) || !(prev > 0)) return null;
    return {
      name: item.name,
      code: item.code,
      tag: item.tag || '',
      price: price,
      prev: prev,
      open: open,
      chg: price - prev,
      pct: (price - prev) / prev * 100,
      vsOpen: open > 0 ? (price - open) / open * 100 : null,
      high: finiteNumber(a[33]),
      low: finiteNumber(a[34]),
      amount: finiteNumber(a[37]) === null ? null : finiteNumber(a[37]) / 10000,
      turnover: finiteNumber(a[38]),
      time: a[30] || ''
    };
  }

  function cleanLevelText(line) {
    return line
      .replace(/\([^)]*\)|（[^）]*）/g, ' ')
      .replace(/\b\d+\s*\/\s*\d+\b/g, ' ');
  }

  function levelFromLine(line, kind) {
    var nums = cleanLevelText(line).match(/\d+(?:\.\d+)?/g);
    if (!nums || !nums.length) return null;
    var values = nums.map(Number).filter(function (n) { return isFinite(n) && n > 0; });
    if (!values.length) return null;
    return {
      min: Math.min.apply(Math, values),
      max: Math.max.apply(Math, values),
      trigger: kind === 'add' && /回踩|回撤|回落/.test(line) ? 'range' : (kind === 'exit' ? 'below' : 'above')
    };
  }

  /* 忽略 MA10、1/3 等非价格数字，把用户文案转换成可验证的价格区间。 */
  function parseKeyLevels(text) {
    var out = {};
    if (!text) return out;
    String(text).split('\n').forEach(function (raw) {
      var line = String(raw).trim();
      if (!line) return;
      var kind = null;
      if (line.indexOf('加') >= 0) kind = 'add';
      else if (line.indexOf('减') >= 0) kind = 'reduce';
      else if (/离场|清仓|止损|跌破|破位|破/.test(line)) kind = 'exit';
      if (!kind || out[kind]) return;
      var level = levelFromLine(line, kind);
      if (level) out[kind] = level;
    });
    return out;
  }

  function levelLabel(level) {
    if (!level) return '';
    return level.min === level.max ? String(level.min) : level.min + '-' + level.max;
  }

  function levelAnchor(level, kind) {
    if (!level) return null;
    return kind === 'exit' ? level.max : level.min;
  }

  function isLevelTriggered(level, kind, price) {
    if (!level || !isFinite(price)) return false;
    if (level.trigger === 'range') return price >= level.min && price <= level.max;
    if (kind === 'exit' || level.trigger === 'below') return price <= level.max;
    return price >= level.min;
  }

  return {
    parseTencentQuote: parseTencentQuote,
    parseKeyLevels: parseKeyLevels,
    levelLabel: levelLabel,
    levelAnchor: levelAnchor,
    isLevelTriggered: isLevelTriggered
  };
});
