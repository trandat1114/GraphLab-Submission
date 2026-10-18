import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Play, Route, Shuffle } from "lucide-react";
import { runKnightBFS, squareToCell, cellToSquare, files, ranks, BOARD_SIZE } from "./knight";
import type { Square } from "./knight";
import { playbackInterval, nextSpeed, type Speed } from "./playback";

const CELL = 38;
const BOARD_PX = CELL * BOARD_SIZE;
const center = (sq: Square) => { const [row, col] = squareToCell(sq); return { x: col * CELL + CELL / 2, y: row * CELL + CELL / 2 }; };
const randomSquare = () => cellToSquare(Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE));

export default function KnightPanel() {
  const [start, setStart] = useState<Square>("a1");
  const [goal, setGoal] = useState<Square>("h8");
  const [runKey, setRunKey] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const result = useMemo(() => runKnightBFS(start, goal), [start, goal, runKey]);
  const step = result.steps[Math.min(stepIndex, result.steps.length - 1)];
  const reset = () => { setStepIndex(0); setIsPlaying(false); setRunKey(k => k + 1); };
  const next = () => setStepIndex(i => Math.min(i + 1, result.steps.length - 1));
  const prev = () => setStepIndex(i => Math.max(0, i - 1));
  const randomize = () => { setStart(randomSquare()); setGoal(randomSquare()); reset(); };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setStepIndex(i => {
        if (i >= result.steps.length - 1) { window.clearInterval(timer); setIsPlaying(false); return i; }
        return i + 1;
      });
    }, playbackInterval(result.steps.length, speed));
    return () => window.clearInterval(timer);
  }, [isPlaying, result.steps.length, speed]);

  const current = step?.current;
  const visited = new Set(step?.visited ?? []);
  const frontier = new Set(step?.frontier ?? []);
  const showResult = stepIndex === result.steps.length - 1;
  const shownPath = showResult && result.path.length > 0;
  const pathIndex = new Map(shownPath ? result.path.map((sq, i) => [sq, i] as const) : []);

  const squareSelect = (label: string, value: Square, onChange: (sq: Square) => void) => {
    const [row, col] = squareToCell(value);
    return <div className="knight-coord-field">
      <span className="field-label" style={{ margin: "0 0 7px 2px" }}>{label}</span>
      <div className="knight-coord-row">
        <select className="control" value={files[col]} onChange={e => onChange(cellToSquare(row, files.indexOf(e.target.value)))}>{files.map(f => <option key={f}>{f}</option>)}</select>
        <select className="control" value={ranks[row]} onChange={e => onChange(cellToSquare(ranks.indexOf(e.target.value), col))}>{ranks.map(r => <option key={r}>{r}</option>)}</select>
      </div>
    </div>;
  };

  return <>
    <div className="page-heading" id="tour-knight-goal"><div><div className="eyebrow">GRAPH THEORY / KNIGHT'S SHORTEST PATH</div><h1>Knight on a chessboard</h1><p>BFS over legal knight moves finds the fewest moves between two squares.</p></div><div className="run-status"><span className="live-dot" />{isPlaying ? "PLAYING" : "READY"}</div></div>

    <div className="stats-grid">
      <div className="stat-card"><div className="stat-top"><span>SQUARES</span></div><div className="stat-value">{BOARD_SIZE * BOARD_SIZE}</div><div className="stat-foot">8 × 8 board</div></div>
      <div className="stat-card"><div className="stat-top"><span>VISITED</span></div><div className="stat-value">{(step?.visited.length ?? 0).toString().padStart(2, "0")}</div><div className="stat-foot">Squares explored</div></div>
      <div className="stat-card accent-stat"><div className="stat-top"><span>MOVES</span><Route size={16} /></div><div className="stat-value">{showResult ? (result.moveCount ?? "—") : "—"}</div><div className="stat-foot">Shortest knight path</div></div>
      <div className="stat-card"><div className="stat-top"><span>QUEUE</span></div><div className="stat-value">{(step?.frontier.length ?? 0).toString().padStart(2, "0")}</div><div className="stat-foot">Pending squares</div></div>
    </div>

    <div className="content-grid">
      <section className="panel graph-panel">
        <div className="panel-heading"><div><h2>Chessboard</h2><p>Knight position · BFS frontier</p></div><span className="mini-badge"><span className="live-dot" /> INTERACTIVE</span></div>
        <div className="graph-canvas" id="tour-knight-board">
          <svg viewBox={`0 0 ${BOARD_PX} ${BOARD_PX}`} role="img" aria-label="Chessboard with knight shortest path">
            {Array.from({ length: BOARD_SIZE }).map((_, row) => Array.from({ length: BOARD_SIZE }).map((_, col) => {
              const sq = cellToSquare(row, col);
              const isCurrent = current === sq, isVisited = visited.has(sq), isFrontier = frontier.has(sq), isPath = pathIndex.has(sq);
              const light = (row + col) % 2 === 0;
              return <rect key={sq} x={col * CELL} y={row * CELL} width={CELL} height={CELL}
                className={`chess-square ${light ? "light" : "dark"} ${isVisited ? "square-visited" : ""} ${isFrontier ? "square-frontier" : ""} ${isCurrent ? "square-current" : ""} ${isPath ? "square-path" : ""}`} />;
            }))}
            {shownPath && result.path.slice(0, -1).map((sq, i) => { const a = center(sq), b = center(result.path[i + 1]); return <line key={`seg-${sq}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="knight-move" />; })}
            {[start, goal].map(sq => { const p = center(sq); return <text key={`marker-${sq}`} x={p.x} y={p.y - CELL / 2 + 11} textAnchor="middle" className={`marker-label ${sq === start ? "start-marker" : "goal-marker"}`}>{sq === start ? "START" : "GOAL"}</text>; })}
            {shownPath && result.path.map((sq, i) => { if (sq === current || i === 0 || i === result.path.length - 1) return null; const p = center(sq); return <g key={`order-${sq}`}><circle cx={p.x} cy={p.y - 13} r="7" className="knight-order-bg" /><text x={p.x} y={p.y - 10} textAnchor="middle" className="knight-order">{i}</text></g>; })}
            {current && <text x={center(current).x} y={center(current).y + 7} textAnchor="middle" className="knight-piece">♞</text>}
          </svg>
        </div>
        <div className="legend" id="tour-knight-legend"><span><i className="legend-dot current" />Current</span><span><i className="legend-dot visited" />Visited</span><span><i className="legend-dot frontier" />In queue</span><span><i className="legend-dot path" />Shortest path</span></div>
        <div className="edge-editor">
          <div className="editor-title">Start and target squares</div>
          <div className="knight-coords" id="tour-knight-squares">
            {squareSelect("Start", start, sq => { setStart(sq); reset(); })}
            {squareSelect("Target", goal, sq => { setGoal(sq); reset(); })}
            <button className="secondary-button" onClick={randomize}><Shuffle size={15} /> Random squares</button>
          </div>
        </div>
      </section>

      <section className="panel execution-panel">
        <div className="panel-heading"><div><h2>Execution trace</h2><p>Step-by-step BFS state</p></div><span className="step-count">{String(Math.min(stepIndex + 1, result.steps.length)).padStart(2, "0")} <span>/ {String(result.steps.length).padStart(2, "0")}</span></span></div>
        <div className="progress-track"><div className="progress-value" style={{ width: `${result.steps.length <= 1 ? 100 : stepIndex / (result.steps.length - 1) * 100}%` }} /></div>
        <div className="step-card" id="tour-knight-stepcard"><div className="step-label">CURRENT OPERATION</div><h3>{step?.title ?? "Ready"}</h3><p>{step?.detail ?? "Run the search to see its trace."}</p><div className="step-meta"><span className="status-chip">{step?.status === "found" ? "✓ Completed" : step?.status === "unreachable" ? "No path" : "● Processing"}</span></div></div>
        <div className="trace-controls" id="tour-knight-controls"><button className="icon-button" onClick={prev} disabled={stepIndex === 0} aria-label="Previous step"><ArrowLeft size={17} /></button><button className="play-button" onClick={() => { if (stepIndex >= result.steps.length - 1) setStepIndex(0); setIsPlaying(p => !p); }}><Play size={15} />{isPlaying ? "Pause" : "Play trace"}</button><button className="icon-button" onClick={next} disabled={stepIndex >= result.steps.length - 1} aria-label="Next step"><ArrowRight size={17} /></button><button className="icon-button speed-button" onClick={() => setSpeed(nextSpeed)} aria-label="Playback speed">{speed}×</button><button className="icon-button" onClick={reset} aria-label="Reset"><RotateCcw size={16} /></button></div>
        <div className="data-block" id="tour-knight-queue"><div className="data-title"><span>QUEUE</span><span className="data-count">{step?.frontier.length ?? 0} squares</span></div><div className="chips">{(step?.frontier ?? []).length ? step.frontier.map((sq, i) => <span className="data-chip" key={`${sq}-${i}`}>{sq}</span>) : <span className="empty-text">Empty</span>}</div></div>
        <div className="data-block" id="tour-knight-visited"><div className="data-title"><span>VISITED SQUARES</span><span className="data-count">{step?.visited.length ?? 0} squares</span></div><div className="chips">{(step?.visited ?? []).length ? step.visited.map(sq => <span className="data-chip visited-chip" key={sq}>{sq}</span>) : <span className="empty-text">No squares visited yet</span>}</div></div>
      </section>
    </div>

    <div className="bottom-grid">
      <section className="panel result-panel" id="tour-knight-result"><div className="panel-heading"><div><h2>Path result</h2><p>Shortest knight path for the selected squares</p></div><Route size={17} /></div><div className="path-display">{showResult && result.path.length ? result.path.map((sq, i) => <span className="path-part" key={`${sq}-${i}`}>{i > 0 && <ArrowRight size={14} />}<b>{sq}</b></span>) : <span className="empty-text">{showResult ? "No path found." : "Path will appear here after the search finishes."}</span>}</div><div className="result-footer"><span>Moves</span><strong>{showResult ? (result.moveCount ?? "—") : "—"}</strong><span className="result-separator" /><span>Squares visited</span><strong>{showResult ? result.steps[result.steps.length - 1].visited.length : "—"}</strong></div></section>
      <section className="panel complexity-panel" id="tour-knight-summary"><div className="panel-heading"><div><h2>Why BFS</h2><p>Knight moves are unweighted</p></div></div><div className="complexity-row"><span>Knight BFS</span><code>O(64)</code><small>8×8 board</small></div><p className="complexity-note">Every knight move costs the same, so the first time BFS reaches the target square, it has reached it in the fewest possible moves — the same guarantee BFS gives on the graph slide, applied to an 8×8 grid where edges connect squares a knight's move apart.</p></section>
    </div>
  </>;
}
