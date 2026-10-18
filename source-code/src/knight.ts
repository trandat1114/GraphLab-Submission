export type Square = string; // chess notation, e.g. "a1".."h8"
export interface KnightStep {
  title: string;
  detail: string;
  current?: Square;
  visited: Square[];
  frontier: Square[];
  distances: Record<Square, number>;
  previous: Record<Square, Square | null>;
  status: "ready" | "running" | "found" | "unreachable";
}
export interface KnightResult { steps: KnightStep[]; path: Square[]; moveCount: number | null }

export const BOARD_SIZE = 8;
const MOVES: [number, number][] = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const INF = Number.POSITIVE_INFINITY;

export function squareToCell(square: Square): [number, number] {
  const col = square.charCodeAt(0) - 97;
  const row = BOARD_SIZE - Number(square[1]);
  return [row, col];
}
export function cellToSquare(row: number, col: number): Square {
  return String.fromCharCode(97 + col) + String(BOARD_SIZE - row);
}
export const files = Array.from({ length: BOARD_SIZE }, (_, i) => String.fromCharCode(97 + i));
export const ranks = Array.from({ length: BOARD_SIZE }, (_, i) => String(BOARD_SIZE - i));
export const allSquares: Square[] = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, i) => cellToSquare(Math.floor(i / BOARD_SIZE), i % BOARD_SIZE));

/** Shortest path for a knight between two squares, found with BFS (unweighted moves). */
export function runKnightBFS(start: Square, goal: Square): KnightResult {
  const distances: Record<Square, number> = {};
  const previous: Record<Square, Square | null> = {};
  for (const sq of allSquares) { distances[sq] = INF; previous[sq] = null; }
  distances[start] = 0;

  const steps: KnightStep[] = [];
  const visited: Square[] = [];
  const queue: Square[] = [start];
  const seen = new Set<Square>([start]);
  const snap = (title: string, detail: string, current: Square | undefined, status: KnightStep["status"]) =>
    steps.push({ title, detail, current, visited: [...visited], frontier: [...queue], distances: { ...distances }, previous: { ...previous }, status });

  snap("Khởi tạo", `Đặt quân mã tại ${start}; số bước = 0.`, start, "running");
  let found = start === goal;
  if (found) { visited.push(start); snap("Đã ở ô đích", `${start} chính là ô xuất phát và cũng là ô đích.`, start, "found"); }

  while (queue.length && !found) {
    const current = queue.shift()!;
    if (!visited.includes(current)) visited.push(current);
    snap(`Lấy ${current} ra khỏi hàng đợi`, "Lấy phần tử đầu hàng đợi (FIFO).", current, "running");
    if (current === goal) { found = true; snap("Đã tới ô đích", `Quân mã đến ${goal} sau ${distances[goal]} bước.`, current, "found"); break; }
    const [row, col] = squareToCell(current);
    for (const [dr, dc] of MOVES) {
      const nr = row + dr, nc = col + dc;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
      const next = cellToSquare(nr, nc);
      snap(`Xét nước đi ${current} → ${next}`, `Kiểm tra ô ${next} theo nước đi hình chữ L của quân mã.`, current, "running");
      if (!seen.has(next)) {
        seen.add(next); previous[next] = current; distances[next] = distances[current] + 1; queue.push(next);
        snap(`Thêm ${next} vào hàng đợi`, `${next} chưa được phát hiện; cha là ${current}, số bước = ${distances[next]}.`, current, "running");
      }
    }
  }

  const path: Square[] = [];
  if (distances[goal] !== INF) {
    let cur: Square | null = goal;
    const guard = new Set<Square>();
    while (cur && !guard.has(cur)) { guard.add(cur); path.unshift(cur); if (cur === start) break; cur = previous[cur]; }
  }
  if (!found && path.length === 0) snap("Không tìm thấy đường đi", `Không thể đến ${goal} từ ${start}.`, undefined, "unreachable");
  return { steps, path, moveCount: path.length ? path.length - 1 : null };
}
