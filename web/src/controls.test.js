import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import fs from 'fs';
import path from 'path';
import vm from 'vm';
import App from './App';
import NativeWorkflowStudio from './NativeWorkflowStudio';
import config from './nativeWorkflowConfig.json';
import NativeAIReport from './components/NativeAIReport';

const seed = fs.readFileSync(path.join(__dirname, '../../backend/seed.js'), 'utf8');
function seedRows(variable) {
  const start = seed.indexOf(`const ${variable} = [`);
  const end = seed.indexOf('\n    ];', start);
  if (start < 0 || end < 0) throw new Error(`Missing project seed ${variable}`);
  return vm.runInNewContext(seed.slice(start, end + 7) + `\n${variable}`, {});
}
const inventory = seedRows('inventoryItems').map((row, index) => ({ id: index + 1, name: row[0] }));
const tasting = seedRows('tastingNotes').map((row, index) => ({ id: index + 1, wine_name: row[1], ai_generated: row[10], ai_tasting_note: row[11] }));
const pairings = seedRows('foodPairings').map((row, index) => ({ id: index + 1, wine_name: row[1], ai_generated: row[8], ai_suggestions: row[9] }));
let root, host;
beforeEach(() => { host = document.createElement('div'); document.body.appendChild(host); root = createRoot(host); window.localStorage.clear(); global.IS_REACT_ACT_ENVIRONMENT = true; });
afterEach(async () => { await act(async () => root.unmount()); host.remove(); jest.restoreAllMocks(); });
const click = async node => { await act(async () => node.click()); };
const flush = async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 0)); }); };
const request = async endpoint => {
  if (endpoint === '/api/inventory') return { data: inventory, pagination: { total: inventory.length } };
  if (endpoint === '/api/tasting-notes') return { rows: tasting };
  if (endpoint === '/api/food-pairings') return { items: pairings };
  throw new Error(`Unexpected request ${endpoint}`);
};

test('seed-backed record tables render 15+ rows with paginated and nested API shapes', async () => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  await act(async () => root.render(<NativeWorkflowStudio config={config} request={request} />));
  await flush();
  const counts = [...host.querySelectorAll('.native-workflow-records article')].map(article => article.querySelectorAll('tbody tr').length);
  expect(counts).toEqual([18, 16, 16]);
  expect(errors.mock.calls.filter(args => !String(args[0]).includes('ReactDOMTestUtils.act'))).toHaveLength(0);
});

test('invalid record payload reports a data error without a render exception', async () => {
  const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  const malformed = async endpoint => endpoint === '/api/inventory' ? { data: { unexpected: true } } : request(endpoint);
  await act(async () => root.render(<NativeWorkflowStudio config={config} request={malformed} />));
  await flush();
  expect(host.querySelector('.native-workflow-records [role="status"]').textContent).toContain('invalid list response');
  expect(errors.mock.calls.filter(args => !String(args[0]).includes('ReactDOMTestUtils.act'))).toHaveLength(0);
});

test('all native form presets fill editable fields without submitting', async () => {
  const spy = jest.fn(request);
  await act(async () => root.render(<NativeWorkflowStudio config={config} request={spy} />));
  await flush();
  const baseline = spy.mock.calls.length;
  for (const feature of config.features) {
    const nav = [...host.querySelectorAll('nav[aria-label="AI tools"] button')].find(node => node.textContent === feature.title);
    await click(nav);
    for (const button of host.querySelectorAll('.native-ai-control-buttons button')) {
      await click(button);
      const controls = [...host.querySelectorAll('main form textarea, main form input:not([type="file"]), main form select')];
      expect(controls).toHaveLength(feature.fields.filter(field => field.type !== 'file').length);
      for (const control of controls) expect(control.value).not.toBe('');
    }
  }
  expect(spy.mock.calls.length).toBe(baseline);
});

test('saved structured facts retain false, zero, empty string, and a table', async () => {
  const result = { summary: { reviewed: false, score: 0, note: '' }, options: [{ name: 'Pinot Noir', value: 0 }] };
  const data = async endpoint => endpoint === '/api/tasting-notes' ? { data: [{ ...tasting[0], ai_generated: true, ai_tasting_note: JSON.stringify(result) }] } : request(endpoint);
  await act(async () => root.render(<NativeWorkflowStudio config={config} request={data} />));
  await flush();
  await click([...host.querySelectorAll('.native-workflow-records article')][1].querySelector('button'));
  const dialog = host.querySelector('[role="dialog"]');
  expect(dialog.querySelector('.ai-report')).not.toBeNull();
  expect(dialog.textContent).toMatch(/Reviewed.*No/);
  expect(dialog.textContent).toMatch(/Score.*0/);
  expect(dialog.textContent).toContain('Empty string');
  expect(dialog.querySelector('table')).not.toBeNull();
});

test('returned structured response renders labeled facts and a table', async () => {
  await act(async () => root.render(<NativeAIReport response={{ output: { summary: { reviewed: false, score: 0, note: '' }, options: [{ name: 'Pinot Noir', value: 0 }] } }} title="Returned review" />));
  expect(host.textContent).toMatch(/Reviewed.*No/);
  expect(host.textContent).toMatch(/Score.*0/);
  expect(host.textContent).toContain('Empty string');
  expect(host.querySelector('table')).not.toBeNull();
});

test('demo credentials button fills without login and reports missing configuration', async () => {
  const calls = [];
  global.fetch = jest.fn(async url => {
    calls.push(url);
    if (url.endsWith('/api/health')) return { ok: true, json: async () => ({ status: 'ok' }) };
    if (url.endsWith('/api/auth/demo-credentials')) return { ok: true, json: async () => ({ email: 'demo@example.test', password: 'fixture-only' }) };
    throw new Error(`Unexpected fetch ${url}`);
  });
  await act(async () => root.render(<App />));
  await click([...host.querySelectorAll('button')].find(node => node.textContent === 'Fill demo credentials'));
  await flush();
  expect(host.querySelector('input[type="email"]').value).toBe('demo@example.test');
  expect(host.querySelector('input[type="password"]').value).toBe('fixture-only');
  expect(calls.filter(url => url.endsWith('/api/auth/login'))).toHaveLength(0);
  global.fetch = jest.fn(async url => url.endsWith('/api/health') ? { ok: true, json: async () => ({}) } : { ok: false, status: 503, json: async () => ({ error: 'Demo credentials are not configured' }) });
  await click([...host.querySelectorAll('button')].find(node => node.textContent === 'Fill demo credentials'));
  await flush();
  expect(host.querySelector('[role="alert"]').textContent).toContain('not configured');
});
