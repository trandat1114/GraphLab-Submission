export type Algorithm = "BFS" | "DFS" | "Dijkstra" | "A*";
export type NodeId = string;
export interface GraphNode { id: NodeId; x: number; y: number }
export interface GraphEdge { id: string; from: NodeId; to: NodeId; weight: number }
export interface GraphData { nodes: GraphNode[]; edges: GraphEdge[]; directed: boolean }
export interface Step {
  title: string;
  detail: string;
  current?: NodeId;
  visited: NodeId[];
  frontier: NodeId[];
  distances: Record<NodeId, number>;
  previous: Record<NodeId, NodeId | null>;
  scores?: Record<NodeId, number>;
  heuristics?: Record<NodeId, number>;
  activeEdge?: string;
  edgeCount: number;
  status: "ready" | "running" | "found" | "unreachable";
}
export interface RunResult { steps: Step[]; path: NodeId[]; totalCost: number | null; visitedCount: number; edgeChecks: number }

const INF = Number.POSITIVE_INFINITY;
const snapshot = (
  title: string, detail: string, current: NodeId | undefined, visited: NodeId[],
  frontier: NodeId[], distances: Record<NodeId, number>, previous: Record<NodeId, NodeId | null>,
  edgeCount: number, status: Step["status"], activeEdge?: string,
  scores?: Record<NodeId, number>, heuristics?: Record<NodeId, number>
): Step => ({ title, detail, current, visited: [...visited], frontier: [...frontier],
  distances: { ...distances }, previous: { ...previous }, edgeCount, status, activeEdge,
  ...(scores ? { scores: { ...scores } } : {}), ...(heuristics ? { heuristics: { ...heuristics } } : {}) });

function buildAdjacency(graph: GraphData) {
  const adjacency = new Map<NodeId, { node: NodeId; edge: GraphEdge }[]>();
  for (const node of graph.nodes) adjacency.set(node.id, []);
  for (const edge of graph.edges) {
    adjacency.get(edge.from)?.push({ node: edge.to, edge });
    if (!graph.directed) adjacency.get(edge.to)?.push({ node: edge.from, edge });
  }
  return adjacency;
}
function reconstructPath(previous: Record<NodeId, NodeId | null>, start: NodeId, goal: NodeId) {
  if (start !== goal && previous[goal] == null) return [];
  const path: NodeId[] = [];
  let current: NodeId | null = goal;
  const guard = new Set<NodeId>();
  while (current !== null && !guard.has(current)) {
    guard.add(current); path.unshift(current);
    if (current === start) break;
    current = previous[current] ?? null;
  }
  return path[0] === start ? path : [];
}

/** A* heuristic: scaled Euclidean distance. The scale is min(w(u,v)/euclidean(u,v))
 * over non-zero-length edges, so h is consistent for the supplied coordinates/weights. */
function buildAStarHeuristic(graph: GraphData, goal: NodeId): Record<NodeId, number> {
  const nodes = new Map(graph.nodes.map(n => [n.id, n]));
  let scale = INF;
  for (const edge of graph.edges) {
    const from = nodes.get(edge.from), to = nodes.get(edge.to);
    if (!from || !to) continue;
    const length = Math.hypot(from.x - to.x, from.y - to.y);
    if (length > 0) scale = Math.min(scale, edge.weight / length);
  }
  if (!Number.isFinite(scale) || scale < 0) scale = 0;
  const target = nodes.get(goal)!;
  return Object.fromEntries(graph.nodes.map(node => [node.id, scale * Math.hypot(node.x - target.x, node.y - target.y)]));
}

export function runAlgorithm(graph: GraphData, algorithm: Algorithm, start: NodeId, goal: NodeId): RunResult {
  const ids = graph.nodes.map(n => n.id);
  const distances: Record<NodeId, number> = Object.fromEntries(ids.map(id => [id, INF]));
  const previous: Record<NodeId, NodeId | null> = Object.fromEntries(ids.map(id => [id, null]));
  const steps: Step[] = [];
  const visited: NodeId[] = [];
  let edgeChecks = 0;
  const valid = ids.includes(start) && ids.includes(goal) && new Set(ids).size === ids.length;
  if (!valid) {
    steps.push(snapshot("Dữ liệu chưa hợp lệ", "Nguồn/đích phải tồn tại và mã đỉnh phải duy nhất.", undefined, [], [], distances, previous, 0, "unreachable"));
    return { steps, path: [], totalCost: null, visitedCount: 0, edgeChecks: 0 };
  }
  if (graph.edges.some(e => !ids.includes(e.from) || !ids.includes(e.to) || !Number.isFinite(e.weight))) {
    steps.push(snapshot("Cạnh không hợp lệ", "Mọi cạnh phải nối các đỉnh đã khai báo và có trọng số hữu hạn.", undefined, [], [], distances, previous, 0, "unreachable"));
    return { steps, path: [], totalCost: null, visitedCount: 0, edgeChecks: 0 };
  }
  if ((algorithm === "Dijkstra" || algorithm === "A*") && graph.edges.some(e => e.weight < 0)) {
    steps.push(snapshot("Trọng số không hợp lệ", `${algorithm} chỉ áp dụng cho cạnh có trọng số không âm.`, undefined, [], [], distances, previous, 0, "unreachable"));
    return { steps, path: [], totalCost: null, visitedCount: 0, edgeChecks: 0 };
  }
  const adjacency = buildAdjacency(graph);
  distances[start] = 0;
  steps.push(snapshot("Khởi tạo", `Đặt khoảng cách từ ${start} đến chính nó bằng 0.`, start, [], [start], distances, previous, 0, "running"));

  if (algorithm === "BFS" || algorithm === "DFS") {
    const frontier: NodeId[] = [start];
    const seen = new Set<NodeId>([start]);
    let found = false;
    while (frontier.length) {
      const current = algorithm === "BFS" ? frontier.shift()! : frontier.pop()!;
      if (!visited.includes(current)) visited.push(current);
      steps.push(snapshot(`${algorithm}: lấy đỉnh ${current}`, algorithm === "BFS"
        ? "Lấy phần tử đầu hàng đợi (FIFO)." : "Lấy phần tử trên cùng của ngăn xếp (LIFO).",
        current, visited, frontier, distances, previous, edgeChecks, "running"));
      if (current === goal) {
        found = true;
        steps.push(snapshot("Đã gặp đích", `Đã tìm thấy đỉnh đích ${goal}.`, current, visited, frontier, distances, previous, edgeChecks, "found"));
        break;
      }
      for (const { node, edge } of adjacency.get(current) ?? []) {
        edgeChecks++;
        steps.push(snapshot(`Xét cạnh ${current} → ${node}`, `Kiểm tra đỉnh ${node}; cạnh ${edge.id} có trọng số ${edge.weight}.`,
          current, visited, frontier, distances, previous, edgeChecks, "running", edge.id));
        if (!seen.has(node)) {
          seen.add(node); previous[node] = current;
          distances[node] = distances[current] + 1;
          frontier.push(node);
          steps.push(snapshot(`Thêm ${node} vào cấu trúc chờ`, `${node} chưa được phát hiện nên ghi nhận cha là ${current} và đưa vào ${algorithm === "BFS" ? "cuối hàng đợi" : "ngăn xếp"}.`,
            current, visited, frontier, distances, previous, edgeChecks, "running", edge.id));
        }
      }
    }
    const path = found ? reconstructPath(previous, start, goal) : [];
    if (!found) steps.push(snapshot("Không tìm thấy đường đi", `Không thể đến ${goal} từ ${start}.`, undefined, visited, [], distances, previous, edgeChecks, "unreachable"));
    return { steps, path, totalCost: path.length ? path.length - 1 : null, visitedCount: visited.length, edgeChecks };
  }

  if (algorithm === "Dijkstra") {
    const unvisited = new Set<NodeId>(ids);
    while (unvisited.size) {
      let current: NodeId | undefined;
      for (const id of unvisited) if (current === undefined || distances[id] < distances[current]) current = id;
      if (current === undefined || distances[current] === INF) break;
      unvisited.delete(current); visited.push(current);
      steps.push(snapshot(`Chọn đỉnh ${current}`, `Đỉnh chưa cố định có khoảng cách tạm thời nhỏ nhất là ${current} (${distances[current]}).`,
        current, visited, [...unvisited].filter(id => distances[id] !== INF), distances, previous, edgeChecks, "running"));
      if (current === goal) {
        steps.push(snapshot("Đã cố định đỉnh đích", `Khoảng cách ngắn nhất đến ${goal} là ${distances[goal]}.`,
          current, visited, [...unvisited], distances, previous, edgeChecks, "found"));
        break;
      }
      for (const { node, edge } of adjacency.get(current) ?? []) {
        edgeChecks++;
        steps.push(snapshot(`Nới lỏng cạnh ${current} → ${node}`, `So sánh ${distances[current]} + ${edge.weight} với khoảng cách hiện tại của ${node}.`,
          current, visited, [...unvisited], distances, previous, edgeChecks, "running", edge.id));
        const candidate = distances[current] + edge.weight;
        if (candidate < distances[node] && unvisited.has(node)) {
          distances[node] = candidate; previous[node] = current;
          steps.push(snapshot(`Cập nhật khoảng cách ${node}`, `Cập nhật dist[${node}] = ${candidate}; cha của ${node} là ${current}.`,
            current, visited, [...unvisited], distances, previous, edgeChecks, "running", edge.id));
        }
      }
    }
  } else {
    const heuristics = buildAStarHeuristic(graph, goal);
    const scores: Record<NodeId, number> = Object.fromEntries(ids.map(id => [id, INF]));
    scores[start] = heuristics[start];
    const open = new Set<NodeId>([start]);
    const closed = new Set<NodeId>();
    const bestOpen = () => {
      let best: NodeId | undefined;
      for (const id of open) if (best === undefined || scores[id] < scores[best] || (scores[id] === scores[best] && id.localeCompare(best) < 0)) best = id;
      return best;
    };
    while (open.size) {
      const current = bestOpen()!;
      open.delete(current);
      if (!closed.has(current)) { closed.add(current); visited.push(current); }
      steps.push(snapshot(`Chọn ${current} theo f = g + h`, `g(${current}) = ${distances[current].toFixed(2)}, h(${current}) = ${heuristics[current].toFixed(2)}, f = ${scores[current].toFixed(2)}.`,
        current, visited, [...open], distances, previous, edgeChecks, "running", undefined, scores, heuristics));
      if (current === goal) {
        steps.push(snapshot("Đã tới đích", `A* lấy đích ra khỏi frontier; đường đi có chi phí g(${goal}) = ${distances[goal]}.`,
          current, visited, [...open], distances, previous, edgeChecks, "found", undefined, scores, heuristics));
        break;
      }
      for (const { node, edge } of adjacency.get(current) ?? []) {
        edgeChecks++;
        steps.push(snapshot(`Xét cạnh ${current} → ${node}`, `Kiểm tra cạnh trọng số ${edge.weight}; g(${current}) = ${distances[current]}.`,
          current, visited, [...open], distances, previous, edgeChecks, "running", edge.id, scores, heuristics));
        const candidate = distances[current] + edge.weight;
        if (candidate < distances[node]) {
          distances[node] = candidate; previous[node] = current;
          scores[node] = candidate + heuristics[node];
          closed.delete(node); open.add(node);
          steps.push(snapshot(`Cập nhật ${node}`, `g(${node}) = ${candidate.toFixed(2)}; h(${node}) = ${heuristics[node].toFixed(2)}; f(${node}) = ${scores[node].toFixed(2)}.`,
            current, visited, [...open], distances, previous, edgeChecks, "running", edge.id, scores, heuristics));
        }
      }
    }
  }
  const path = reconstructPath(previous, start, goal);
  const status = path.length ? "found" : "unreachable";
  const finalHeuristics = algorithm === "A*" ? buildAStarHeuristic(graph, goal) : undefined;
  const finalScores = finalHeuristics ? Object.fromEntries(ids.map(id => [id, distances[id] + finalHeuristics[id]])) : undefined;
  steps.push(snapshot(path.length ? "Hoàn tất" : "Không tìm thấy đường đi",
    path.length ? `Đường đi ${path.join(" → ")} có tổng trọng số ${distances[goal]}.` : `Không có đường đi từ ${start} đến ${goal}.`,
    (path.length ? path[path.length - 1] : undefined), visited, [], distances, previous, edgeChecks, status,
    undefined, finalScores, finalHeuristics));
  return { steps, path, totalCost: path.length ? distances[goal] : null, visitedCount: visited.length, edgeChecks };
}

export const sampleGraph: GraphData = {
  directed: false,
  nodes: [
    { id: "A", x: 90, y: 160 }, { id: "B", x: 240, y: 70 }, { id: "C", x: 240, y: 250 },
    { id: "D", x: 430, y: 70 }, { id: "E", x: 430, y: 250 }, { id: "F", x: 600, y: 160 }
  ],
  edges: [
    { id: "e1", from: "A", to: "B", weight: 4 }, { id: "e2", from: "A", to: "C", weight: 2 },
    { id: "e3", from: "B", to: "C", weight: 1 }, { id: "e4", from: "B", to: "D", weight: 5 },
    { id: "e5", from: "C", to: "D", weight: 8 }, { id: "e6", from: "C", to: "E", weight: 10 },
    { id: "e7", from: "D", to: "E", weight: 2 }, { id: "e8", from: "D", to: "F", weight: 6 },
    { id: "e9", from: "E", to: "F", weight: 3 }
  ]
};
