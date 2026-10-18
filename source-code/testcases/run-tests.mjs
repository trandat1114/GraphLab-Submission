import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runAlgorithm, sampleGraph } from '../.test-build/graph.js';

const cases = JSON.parse(fs.readFileSync(new URL('./testcases.json', import.meta.url), 'utf8'));
function toGraph(tc) {
  const nodes = tc.nodes.map((id, i) => ({ id, x: 60 + (i % 4) * 130, y: 55 + Math.floor(i / 4) * 100 + (i % 2) * 20 }));
  return { directed: tc.directed, nodes, edges: tc.edges.map((e, i) => ({ id: `e${i + 1}`, from: e[0], to: e[1], weight: e[2] })) };
}
function edgeCost(graph, path) {
  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const matches = graph.edges.filter(e => (e.from === path[i] && e.to === path[i + 1]) || (!graph.directed && e.to === path[i] && e.from === path[i + 1]));
    assert.ok(matches.length, `missing edge ${path[i]} -> ${path[i + 1]}`);
    cost += Math.min(...matches.map(e => e.weight));
  }
  return cost;
}
function bellmanFord(graph, start, goal) {
  const d = Object.fromEntries(graph.nodes.map(n => [n.id, Infinity])); d[start] = 0;
  for (let i = 0; i < graph.nodes.length - 1; i++) {
    let changed = false;
    for (const e of graph.edges) {
      if (d[e.from] + e.weight < d[e.to]) { d[e.to] = d[e.from] + e.weight; changed = true; }
      if (!graph.directed && d[e.to] + e.weight < d[e.from]) { d[e.from] = d[e.to] + e.weight; changed = true; }
    }
    if (!changed) break;
  }
  return Number.isFinite(d[goal]) ? d[goal] : null;
}
let passed = 0;
const results = [];
for (const tc of cases) {
  const graph = toGraph(tc);
  const result = runAlgorithm(graph, tc.algorithm, tc.start, tc.goal);
  if (tc.expected === 'no_path') assert.equal(result.path.length, 0, `${tc.id}: should have no path`);
  if (tc.expected === 'reject_negative') {
    assert.equal(result.path.length, 0, `${tc.id}: negative edge should be rejected`);
    assert.match(result.steps[0]?.title ?? '', /Trọng số không hợp lệ/, `${tc.id}: rejection must be explicit`);
  }
  if (tc.expected === 'invalid_input') {
    assert.equal(result.path.length, 0, `${tc.id}: invalid input should not produce a path`);
    assert.match(result.steps[0]?.title ?? '', /Dữ liệu chưa hợp lệ/, `${tc.id}: input validation should be explicit`);
  }
  if (tc.expected === 'invalid_edge') {
    assert.equal(result.path.length, 0, `${tc.id}: invalid edge should not produce a path`);
    assert.match(result.steps[0]?.title ?? '', /Cạnh không hợp lệ/, `${tc.id}: edge validation should be explicit`);
  }
  if (tc.expected_path) assert.deepEqual(result.path, tc.expected_path, `${tc.id}: path mismatch`);
  if (tc.acceptable_paths) assert.ok(tc.acceptable_paths.some(p => JSON.stringify(p) === JSON.stringify(result.path)), `${tc.id}: returned path not in acceptable set: ${result.path}`);
  if (tc.expected_cost !== undefined) assert.ok(Math.abs(result.totalCost - tc.expected_cost) < 1e-8, `${tc.id}: cost ${result.totalCost}, expected ${tc.expected_cost}`);
  if (result.path.length) {
    assert.equal(result.path[0], tc.start, `${tc.id}: wrong path source`);
    assert.equal(result.path[result.path.length - 1], tc.goal, `${tc.id}: wrong path target`);
    const actualPathCost = edgeCost(graph, result.path);
    if (tc.algorithm === 'Dijkstra' || tc.algorithm === 'A*') assert.ok(Math.abs(actualPathCost - result.totalCost) < 1e-8, `${tc.id}: displayed cost differs from reconstructed path`);
    if (tc.algorithm === 'Dijkstra' || tc.algorithm === 'A*') assert.ok(Math.abs(result.totalCost - bellmanFord(graph, tc.start, tc.goal)) < 1e-8, `${tc.id}: not optimal by independent Bellman-Ford oracle`);
    if (tc.algorithm === 'BFS') {
      const reference = runAlgorithm(graph, 'BFS', tc.start, tc.goal);
      assert.equal(result.path.length, reference.path.length, `${tc.id}: BFS path is not minimum-hop`);
    }
  } else assert.equal(result.totalCost, null, `${tc.id}: unreachable/invalid must use null totalCost`);
  assert.ok(result.steps.length >= 1, `${tc.id}: must provide trace`);
  for (const step of result.steps) {
    assert.ok(Array.isArray(step.visited) && Array.isArray(step.frontier), `${tc.id}: snapshot missing visited/frontier`);
    assert.ok(step.distances && step.previous, `${tc.id}: snapshot missing distance/parent state`);
  }
  passed++;
  results.push({ id: tc.id, category: tc.category, algorithm: tc.algorithm, status: 'PASS', path: result.path.join(' -> ') || null, cost: result.totalCost, visited: result.visitedCount, edgeChecks: result.edgeChecks, traceSteps: result.steps.length });
}

// Deterministic fuzz check: compare Dijkstra and A* against an independent Bellman-Ford oracle.
let seed = 112031;
const rand = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
let fuzzChecks = 0;
for (let caseIndex = 0; caseIndex < 100; caseIndex++) {
  const count = 3 + Math.floor(rand() * 8);
  const nodes = Array.from({ length: count }, (_, i) => ({ id: `N${i}`, x: i * 37, y: ((i * 19) % 7) * 23 }));
  const directed = rand() < .35;
  const edges = [];
  let edgeNo = 0;
  for (let i = 0; i < count; i++) for (let j = directed ? 0 : i + 1; j < count; j++) {
    if (i === j || (!directed && j <= i) || rand() > .26) continue;
    edges.push({ id: `f${++edgeNo}`, from: nodes[i].id, to: nodes[j].id, weight: Math.floor(rand() * 10) });
  }
  const graph = { nodes, edges, directed };
  const start = nodes[Math.floor(rand() * count)].id, goal = nodes[Math.floor(rand() * count)].id;
  const expected = bellmanFord(graph, start, goal);
  for (const algorithm of ['Dijkstra', 'A*']) {
    const result = runAlgorithm(graph, algorithm, start, goal);
    assert.equal(result.totalCost, expected, `fuzz-${caseIndex}/${algorithm}: got ${result.totalCost}, expected ${expected}`);
    if (expected === null) assert.equal(result.path.length, 0, `fuzz-${caseIndex}/${algorithm}: unreachable path expected`);
    else assert.ok(Math.abs(edgeCost(graph, result.path) - expected) < 1e-8, `fuzz-${caseIndex}/${algorithm}: invalid reconstructed path`);
    fuzzChecks++;
  }
}

// Sample graph: Dijkstra and A* must agree on the optimal route cost.
for (const algorithm of ['Dijkstra', 'A*']) {
  const result = runAlgorithm(sampleGraph, algorithm, 'A', 'F');
  assert.equal(result.totalCost, 13, `${algorithm} sample graph cost`);
}

const report = {
  generatedAt: new Date().toISOString(),
  environment: { node: process.version, mode: 'algorithm-engine unit/integration tests; not a browser UI test' },
  fixtureCases: cases.length,
  fixturePassed: passed,
  fixtureFailed: cases.length - passed,
  deterministicRandomGraphChecks: fuzzChecks,
  totalChecks: passed + fuzzChecks + 2,
  passed: true,
  results
};
fs.writeFileSync(new URL('./last-run-results.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(`PASS: ${passed}/${cases.length} fixture cases; ${fuzzChecks} deterministic randomized Dijkstra/A* checks; sample graph cross-check passed.`);
console.log('Detailed fixture results: testcases/last-run-results.json');
