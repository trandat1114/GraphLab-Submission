import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowLeft, ArrowRight, CircleHelp, GitBranch, RotateCcw, Play, Route, Layers3, Plus, Trash2, Network, Compass } from "lucide-react";
import { runAlgorithm, sampleGraph } from "./graph";
import type { Algorithm, GraphData, GraphNode } from "./graph";
import KnightPanel from "./KnightPanel";
import { playbackInterval, nextSpeed, type Speed } from "./playback";
import { runTour } from "./tours/runTour";

const fmt = (n: number | undefined) => n === undefined || !Number.isFinite(n) ? "∞" : String(n);

export default function App() {
  const [mode, setMode] = useState<"graph" | "knight">("graph");
  const [graph, setGraph] = useState<GraphData>(sampleGraph);
  const [algorithm, setAlgorithm] = useState<Algorithm>("Dijkstra");
  const [start, setStart] = useState("A");
  const [goal, setGoal] = useState("F");
  const [runKey, setRunKey] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);
  const [directed, setDirected] = useState(false);
  const [newFrom, setNewFrom] = useState("A");
  const [newTo, setNewTo] = useState("F");
  const [newWeight, setNewWeight] = useState("1");
  const [edgeError, setEdgeError] = useState("");

  const result = useMemo(() => runAlgorithm(graph, algorithm, start, goal), [graph, algorithm, start, goal, runKey]);
  const step = result.steps[Math.min(stepIndex, result.steps.length - 1)];
  const pathEdges = new Set<string>();
  for (let i = 0; i < result.path.length - 1; i++) {
    const a = result.path[i], b = result.path[i + 1];
    const edge = graph.edges.find(e => (e.from === a && e.to === b) || (!graph.directed && e.from === b && e.to === a));
    if (edge) pathEdges.add(edge.id);
  }
  const currentEdge = step?.activeEdge;
  const nodes = graph.nodes;
  const edges = graph.edges;
  const reset = () => { setStepIndex(0); setIsPlaying(false); setRunKey(k => k + 1); };
  const next = () => setStepIndex(i => Math.min(i + 1, result.steps.length - 1));
  const prev = () => setStepIndex(i => Math.max(0, i - 1));
  const addEdge = () => {
    if (newFrom === newTo) { setEdgeError("Choose two different vertices."); return; }
    if (!nodes.some(n => n.id === newFrom) || !nodes.some(n => n.id === newTo)) { setEdgeError("Both endpoints must exist in the graph."); return; }
    if (newWeight.trim() === "") { setEdgeError("Enter a finite edge weight."); return; }
    const weight = Number(newWeight);
    if (!Number.isFinite(weight)) { setEdgeError("Enter a finite edge weight."); return; }
    if ((algorithm === "Dijkstra" || algorithm === "A*") && weight < 0) { setEdgeError(`${algorithm} does not accept negative edge weights.`); return; }
    setEdgeError("");
    setGraph(g => ({ ...g, directed, edges: [...g.edges, { id: `e${Date.now()}`, from: newFrom, to: newTo, weight }] }));
    reset();
  };
  const addNode = () => {
    const id = String.fromCharCode(65 + nodes.length);
    if (nodes.some(n => n.id === id) || nodes.length >= 15) return;
    const angle = (nodes.length / Math.max(nodes.length, 6)) * Math.PI * 2;
    const node: GraphNode = { id, x: 340 + Math.cos(angle) * 210, y: 160 + Math.sin(angle) * 100 };
    setGraph(g => ({ ...g, nodes: [...g.nodes, node] }));
    setGoal(id); reset();
  };
  const removeLastEdge = () => { setGraph(g => ({ ...g, edges: g.edges.slice(0, -1) })); reset(); };
  const loadSample = () => { setGraph(sampleGraph); setStart("A"); setGoal("F"); setDirected(false); reset(); };
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
  const currentNode = step?.current;
  const visited = new Set(step?.visited ?? []);
  const frontier = new Set(step?.frontier ?? []);
  const distance = step?.distances ?? {};
  const activePath = new Set(pathEdges);
  const showResult = stepIndex === result.steps.length - 1;
  const shownPath = showResult && result.path.length > 0;
  const activeNodeSet = shownPath ? new Set(result.path) : new Set<string>();

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><Network size={21}/></div><div><div className="brand-name">GraphLab</div><div className="brand-sub">ALGORITHM STUDIO</div></div></div>
      <div className="topbar-right"><span className="live-dot"/> Interactive learning environment <button className="guide-button" onClick={() => runTour(mode)}><Compass size={14}/> Hướng dẫn</button><span className="version">v1.0</span></div>
    </header>
    <main className="layout">
      <aside className="sidebar">
        <div className="section-kicker">WORKSPACE</div>
        <button type="button" id="tour-mode-graph" className={mode === "graph" ? "side-active" : "side-muted"} onClick={() => setMode("graph")}><GitBranch size={17}/> Graph playground {mode === "graph" && <span className="side-pill">LIVE</span>}</button>
        <button type="button" id="tour-mode-knight" className={mode === "knight" ? "side-active" : "side-muted"} onClick={() => setMode("knight")}><Layers3 size={17}/> Knight's shortest path {mode === "knight" && <span className="side-pill">LIVE</span>}</button>
        <div className="side-muted"><Activity size={17}/> Test scenarios</div>
        {mode === "graph" ? <>
        <div className="sidebar-divider"/>
        <div className="section-kicker">ALGORITHM</div>
        <label className="field-label">Choose algorithm</label>
        <div className="algorithm-list" id="tour-graph-algolist">
          {(["BFS", "DFS", "Dijkstra", "A*"] as Algorithm[]).map(a => <button key={a} className={`algo-option ${algorithm === a ? "selected" : ""}`} onClick={() => { setAlgorithm(a); reset(); }}>
            <span className={`algo-icon ${a === "A*" ? "astar" : a.toLowerCase()}`}>{a === "BFS" ? "Q" : a === "DFS" ? "S" : a === "Dijkstra" ? "D" : "A*"}</span><span><strong>{a}</strong><small>{a === "BFS" ? "Breadth-first search" : a === "DFS" ? "Depth-first search" : a === "Dijkstra" ? "Shortest weighted path" : "Heuristic path search"}</small></span>{algorithm === a && <span className="selected-check">✓</span>}
          </button>)}
        </div>
        <div className="sidebar-divider"/>
        <div className="section-kicker">GRAPH SETTINGS</div>
        <div id="tour-graph-settings">
        <label className="field-label">Start node</label>
        <select className="control" value={start} onChange={e => { setStart(e.target.value); reset(); }}>{nodes.map(n => <option key={n.id}>{n.id}</option>)}</select>
        <label className="field-label">Target node</label>
        <select className="control" value={goal} onChange={e => { setGoal(e.target.value); reset(); }}>{nodes.map(n => <option key={n.id}>{n.id}</option>)}</select>
        <label className="toggle-row"><span>Directed graph</span><input type="checkbox" checked={directed} onChange={e => { setDirected(e.target.checked); setGraph(g => ({ ...g, directed: e.target.checked })); reset(); }}/></label>
        </div>
        <div className="sidebar-divider"/>
        <div className="section-kicker">QUICK ACTIONS</div>
        <button className="secondary-button full" onClick={loadSample}><RotateCcw size={15}/> Restore sample graph</button>
        <button className="secondary-button full" onClick={addNode}><Plus size={15}/> Add node</button>
        <button className="secondary-button full" onClick={removeLastEdge}><Trash2 size={15}/> Remove last edge</button>
        <div className="sidebar-note"><CircleHelp size={16}/><span><b>Learning tip</b><br/>Select an algorithm, then step through its decisions to understand how it explores the graph.</span></div>
        </> : <>
        <div className="sidebar-divider"/>
        <div className="section-kicker">ALGORITHM</div>
        <div className="side-active"><Layers3 size={17}/> Breadth-first search</div>
        <div className="sidebar-note"><CircleHelp size={16}/><span><b>Learning tip</b><br/>Pick a start and target square on the board, then step through the queue to see how BFS finds the shortest knight path.</span></div>
        </>}
      </aside>

      <section className="main-content">
        {mode === "knight" ? <KnightPanel/> : <>
        <div className="page-heading" id="tour-graph-goal"><div><div className="eyebrow">GRAPH THEORY / VISUALIZATION</div><h1>Graph playground</h1><p>Explore how graph algorithms traverse nodes and discover paths.</p></div><div className="run-status"><span className="live-dot"/>{isPlaying ? "PLAYING" : "READY"}</div></div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>VERTICES</span><Network size={16}/></div><div className="stat-value">{nodes.length.toString().padStart(2, "0")}</div><div className="stat-foot">Graph nodes</div></div>
          <div className="stat-card"><div className="stat-top"><span>EDGES</span><GitBranch size={16}/></div><div className="stat-value">{edges.length.toString().padStart(2, "0")}</div><div className="stat-foot">Connections</div></div>
          <div className="stat-card"><div className="stat-top"><span>VISITED</span><Activity size={16}/></div><div className="stat-value">{(step?.visited.length ?? 0).toString().padStart(2, "0")}</div><div className="stat-foot">Nodes explored</div></div>
          <div className="stat-card accent-stat"><div className="stat-top"><span>PATH COST</span><Route size={16}/></div><div className="stat-value">{showResult ? (result.totalCost ?? "—") : "—"}</div><div className="stat-foot">{algorithm === "Dijkstra" || algorithm === "A*" ? "Total path weight" : "Path edge count"}</div></div>
        </div>

        <div className="content-grid">
          <section className="panel graph-panel">
            <div className="panel-heading"><div><h2>Graph visualization</h2><p>Live state · weighted adjacency</p></div><span className="mini-badge"><span className="live-dot"/> INTERACTIVE</span></div>
            <div className="graph-canvas" id="tour-graph-canvas">
              <svg viewBox="0 0 700 330" role="img" aria-label="Graph visualization">
                <defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#243047" strokeWidth=".65"/></pattern><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#72829c"/></marker></defs>
                <rect width="700" height="330" fill="url(#grid)"/>
                {edges.map(e => {
                  const a = nodes.find(n => n.id === e.from), b = nodes.find(n => n.id === e.to); if (!a || !b) return null;
                  const dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx*dx+dy*dy) || 1;
                  const x1 = a.x + dx/len*24, y1 = a.y + dy/len*24, x2 = b.x - dx/len*27, y2 = b.y - dy/len*27;
                  const active = currentEdge === e.id, path = shownPath && activePath.has(e.id);
                  return <g key={e.id}><line x1={x1} y1={y1} x2={x2} y2={y2} className={`edge ${active ? "edge-active" : ""} ${path ? "edge-path" : ""}`} markerEnd={graph.directed ? "url(#arrow)" : undefined}/><rect x={(x1+x2)/2-13} y={(y1+y2)/2-10} width="26" height="20" rx="6" className="weight-bg"/><text x={(x1+x2)/2} y={(y1+y2)/2+4} textAnchor="middle" className="weight-label">{e.weight}</text></g>;
                })}
                {nodes.map(n => {
                  const isCurrent = currentNode === n.id, isVisited = visited.has(n.id), isFrontier = frontier.has(n.id), isPath = activeNodeSet.has(n.id);
                  return <g key={n.id} transform={`translate(${n.x},${n.y})`}><circle r="27" className={`node-ring ${isCurrent ? "ring-current" : ""}`}/><circle r="22" className={`node ${isCurrent ? "node-current" : ""} ${isVisited ? "node-visited" : ""} ${isFrontier ? "node-frontier" : ""} ${isPath ? "node-path" : ""}`}/><text y="5" textAnchor="middle" className="node-label">{n.id}</text><text y="43" textAnchor="middle" className="distance-label">d={fmt(distance[n.id])}</text>{n.id === start && <text x="-28" y="-31" className="marker-label start-marker">START</text>}{n.id === goal && <text x="-20" y="-31" className="marker-label goal-marker">GOAL</text>}</g>;
                })}
              </svg>
            </div>
            <div className="legend" id="tour-graph-legend"><span><i className="legend-dot current"/>Current</span><span><i className="legend-dot visited"/>Visited</span><span><i className="legend-dot frontier"/>Frontier</span><span><i className="legend-dot path"/>Final path</span></div>
            <div className="edge-editor"><div className="editor-title">Add connection</div><div className="editor-row"><select value={newFrom} onChange={e => setNewFrom(e.target.value)} className="control">{nodes.map(n => <option key={n.id}>{n.id}</option>)}</select><span className="edge-arrow">→</span><select value={newTo} onChange={e => setNewTo(e.target.value)} className="control">{nodes.map(n => <option key={n.id}>{n.id}</option>)}</select><input aria-label="Edge weight" aria-describedby="edge-error" className="control weight-input" type="number" min={algorithm === "Dijkstra" || algorithm === "A*" ? 0 : undefined} value={newWeight} onChange={e => { setNewWeight(e.target.value); setEdgeError(""); }}/><button className="primary-button" onClick={addEdge}>Add edge</button></div><p className="form-error" id="edge-error" role="alert">{edgeError}</p></div>
          </section>

          <section className="panel execution-panel">
            <div className="panel-heading"><div><h2>Execution trace</h2><p>Step-by-step algorithm state</p></div><span className="step-count">{String(Math.min(stepIndex + 1, result.steps.length)).padStart(2, "0")} <span>/ {String(result.steps.length).padStart(2, "0")}</span></span></div>
            <div className="progress-track"><div className="progress-value" style={{ width: `${result.steps.length <= 1 ? 100 : stepIndex/(result.steps.length-1)*100}%` }}/></div>
            <div className="step-card" id="tour-graph-stepcard"><div className="step-label">CURRENT OPERATION</div><h3>{step?.title ?? "Ready"}</h3><p>{step?.detail ?? "Run the algorithm to see its trace."}</p><div className="step-meta"><span className="status-chip">{step?.status === "found" ? "✓ Completed" : step?.status === "unreachable" ? "No path" : "● Processing"}</span><span>{step?.edgeCount ?? 0} edge checks</span></div></div>
            <div className="trace-controls" id="tour-graph-controls"><button className="icon-button" onClick={prev} disabled={stepIndex === 0} aria-label="Previous step"><ArrowLeft size={17}/></button><button className="play-button" onClick={() => { if (stepIndex >= result.steps.length - 1) setStepIndex(0); setIsPlaying(p => !p); }}><Play size={15}/>{isPlaying ? "Pause" : "Play trace"}</button><button className="icon-button" onClick={next} disabled={stepIndex >= result.steps.length - 1} aria-label="Next step"><ArrowRight size={17}/></button><button className="icon-button speed-button" onClick={() => setSpeed(nextSpeed)} aria-label="Playback speed">{speed}×</button><button className="icon-button" onClick={reset} aria-label="Reset"><RotateCcw size={16}/></button></div>
            <div className="data-block" id="tour-graph-frontier"><div className="data-title"><span>FRONTIER</span><span className="data-count">{step?.frontier.length ?? 0} items</span></div><div className="chips">{(step?.frontier ?? []).length ? step.frontier.map((n,i) => <span className="data-chip" key={`${n}-${i}`}>{n}</span>) : <span className="empty-text">Empty</span>}</div></div>
            <div className="data-block" id="tour-graph-visited"><div className="data-title"><span>VISITED NODES</span><span className="data-count">{step?.visited.length ?? 0} nodes</span></div><div className="chips">{(step?.visited ?? []).length ? step.visited.map(n => <span className="data-chip visited-chip" key={n}>{n}</span>) : <span className="empty-text">No nodes visited yet</span>}</div></div>
            <div className="data-block" id="tour-graph-distances"><div className="data-title"><span>{algorithm === "A*" ? "G / F SCORE TABLE" : "DISTANCE TABLE"}</span><span className="data-count">{algorithm === "A*" ? "g[v] / f[v]" : "dist[v]"}</span></div><div className="distance-table">{nodes.map(n => <div key={n.id} className={`distance-item ${n.id === currentNode ? "distance-current" : ""}`}><span>{n.id}</span><strong>{algorithm === "A*" ? `g ${fmt(distance[n.id])} / f ${fmt(step?.scores?.[n.id])}` : fmt(distance[n.id])}</strong></div>)}</div></div>
          </section>
        </div>

        <div className="bottom-grid">
          <section className="panel result-panel" id="tour-graph-result"><div className="panel-heading"><div><h2>Path result</h2><p>Output for selected source and target</p></div><Route size={17}/></div><div className="path-display">{showResult && result.path.length ? result.path.map((n,i) => <span className="path-part" key={`${n}-${i}`}>{i > 0 && <ArrowRight size={14}/>}<b>{n}</b></span>) : <span className="empty-text">{showResult ? "No path found for this graph." : "Path will appear here after execution."}</span>}</div><div className="result-footer"><span>Total cost</span><strong>{showResult ? (result.totalCost ?? "—") : "—"}</strong><span className="result-separator"/><span>Nodes visited</span><strong>{showResult ? result.visitedCount : "—"}</strong><span className="result-separator"/><span>Edge checks</span><strong>{showResult ? result.edgeChecks : "—"}</strong></div></section>
          <section className="panel complexity-panel" id="tour-graph-summary"><div className="panel-heading"><div><h2>Complexity reference</h2><p>Typical asymptotic bounds</p></div><CircleHelp size={17}/></div><div className="complexity-row"><span>BFS</span><code>O(V + E)</code><small>Adjacency list</small></div><div className="complexity-row"><span>DFS</span><code>O(V + E)</code><small>Adjacency list</small></div><div className="complexity-row"><span>Dijkstra</span><code>O(V² + E)</code><small>Linear scan</small></div><div className="complexity-row"><span>A*</span><code>O(V² + E)</code><small>Linear frontier</small></div><p className="complexity-note">BFS/DFS use an adjacency list for O(V + E) traversal. Dijkstra and A* use a linear scan of the frontier in this teaching implementation. A* uses a scaled Euclidean heuristic made consistent with the given edge weights; its bound is worst-case and remains O(V² + E) here.</p></section>
        </div>
        </>}
        <footer className="footer"><span>GRAPHLAB · ALGORITHM VISUALIZATION</span><span>Built for learning, testing, and algorithmic thinking.</span></footer>
      </section>
    </main>
  </div>;
}