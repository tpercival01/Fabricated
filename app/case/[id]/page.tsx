"use client";

import { useCallback, useState, useEffect } from "react";
import ReactFlow, { 
  Background, 
  Node, 
  Edge,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection
} from "reactflow";
import "reactflow/dist/style.css";
import SuspectNode from "@/components/SuspectNode";
import ClueNode from "@/components/ClueNode";
import VictimNode from "@/components/VictimNode";
import AccusationModal from "@/components/AccusationModal";
import { useParams, useRouter } from "next/navigation";

const nodeTypes = {
  suspect: SuspectNode,
  clue: ClueNode,
  victim: VictimNode
}

export default function Home() {
  const params = useParams();
  const caseId = params.id;
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [isAccusationModalOpen, setIsAccusationModalOpen] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [caseContext, setCaseContext] = useState<any>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAftermath, setShowAftermath] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: 'red', strokeWidth: 3 } }, eds)),
    []
  );

  useEffect(() => {
    async function loadGame() {
      if (!caseId) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${baseUrl}/api/cases/${caseId}`);
        
        if (!res.ok) throw new Error("Case not found");
        
        const json = await res.json();
        const gameData = json.case_data;

        const truth = gameData.core_truth;
        setCaseContext({
          victimName: truth?.victim_name || "Unknown Victim",
          timeOfDeath: truth?.time_of_death || "Unknown Time",
          causeOfDeath: truth?.cause_of_death || "Unknown Cause",
          crimeScene: truth?.crime_scene || { location: "Unknown", details: "No details provided." }
        });

        try {
          const historyStr = localStorage.getItem("fabricate_history");
          const history = historyStr ? JSON.parse(historyStr) : [];
          
          if (!history.find((h: any) => h.caseId === caseId)) {
            history.push({
              caseId: caseId,
              victimName: truth?.victim_name || "Unknown Victim",
              isSolved: null,
              date: new Date().toLocaleDateString()
            });
            localStorage.setItem("fabricate_history", JSON.stringify(history));
          }
          setIsLoading(false);
        } catch (e) {
          console.error("Failed to initialize case history", e);
          setFetchError("Error 404");
          setIsLoading(false);
        }

        const savedBoard = localStorage.getItem(`fabricated_board_${caseId}`);

        if (savedBoard){
          const {savedNodes, savedEdges, savedIsGameOver, savedGameOverData} = JSON.parse(savedBoard);
          setNodes(savedNodes);
          setEdges(savedEdges);

          if (savedIsGameOver){
            setIsGameOver(true);
            setGameOverData(savedGameOverData);
            setShowAftermath(false);
          }
        } else {
        
          const newNodes: Node[] = [];

          gameData.suspects.forEach((suspect: any, index: number) => {
            newNodes.push({
              id: suspect.id,
              position: { x: 200 + (index * 250), y: 700 },
              data: { label: suspect.name, fullData: suspect },
              type: "suspect"
            });
          });

          gameData.clues.forEach((clue: any, index: number) => {
            newNodes.push({
              id: clue.id,
              position: { x: 200 + (index * 250), y: 1000 },
              data: { label: clue.name, fullData: clue},
              type: "clue"
            });
          });

          newNodes.push({
            id: "victim-node",
            position: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 150 },
            data: { name: truth?.victim_name || "Unknown Victim" },
            type: "victim",
            draggable: false
          });
          setNodes(newNodes);
        }
      } catch (error) {
        console.error(error);
        setFetchError("ERROR 404: CASE FILE CORRUPTED.");
      }
    }
    loadGame();
  }, [caseId]);

  useEffect(() => {
    if (!caseId || nodes.length === 0) return;

    const boardState = {
      savedNodes: nodes,
      savedEdges: edges,
      savedIsGameOver: isGameOver,
      savedGameOverData: gameOverData
    };

    localStorage.setItem(`fabricated_board_${caseId}`, JSON.stringify(boardState));
  }, [nodes, edges, isGameOver, gameOverData, caseId]);

  const getConnectedClues = (suspectId: string) => {
    const connectedNodeIds = new Set<string>();

    edges.forEach((edge) => {
      if (edge.source === suspectId) connectedNodeIds.add(edge.target);
      if (edge.target === suspectId) connectedNodeIds.add(edge.source); 
    });

    return nodes.filter(
      (node) => node.type === "clue" && connectedNodeIds.has(node.id)
    );
  }

  const handleAccusationResult = (resultData: any) => {
    setIsAccusationModalOpen(false);
    setGameOverData(resultData);
    setIsGameOver(true);
    setShowAftermath(true);

    try {
      const historyStr = localStorage.getItem("fabricate_history");
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      const existingIndex = history.findIndex((h: any) => h.caseId === caseId);
      
      if (existingIndex >= 0) {
        history[existingIndex].isSolved = resultData.is_correct;
      } else {
        history.push({
          caseId: caseId,
          victimName: caseContext?.victimName || "Unknown Victim",
          isSolved: resultData.is_correct,
          date: new Date().toLocaleDateString()
        });
      }
      localStorage.setItem("fabricate_history", JSON.stringify(history));
    } catch (e) {
      console.error("Failed to update case history", e);
    }
  }

  if (fetchError) {
    return (
      <div className="w-screen h-screen bg-neutral-900 flex flex-col items-center justify-center text-white">
        <div className="border border-red-800 bg-red-950/30 p-12 text-center rounded shadow-2xl">
          <h1 className="text-4xl font-black text-red-600 mb-4 tracking-widest">ACCESS DENIED</h1>
          <p className="text-neutral-300 font-mono mb-8">{fetchError}</p>
          <p className="text-neutral-500 text-sm mb-8">The requested case UUID does not exist in the mainframe.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-white font-bold py-3 px-8 rounded transition-colors"
          >
            RETURN TO HQ
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-neutral-900 flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neutral-600 border-t-red-600 rounded-full animate-spin"></div>
          <h2 className="text-xl font-mono tracking-widest text-neutral-400">RETRIEVING CASE FILE...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-neutral-900 flex flex-col">
      <div className="flex-1 relative overflow-hidden">
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          nodesDraggable={!isGameOver}
          nodesConnectable={!isGameOver}
          elementsSelectable={!isGameOver}
          proOptions={{ hideAttribution: true }}
          onNodeClick={(event, node) => {
            if (isGameOver) return;
            if (node.type === "victim"){
              setIsContextOpen(true);
            } else {
              setSelectedNodeData(node.data);
            }
          }}
          fitView
          connectionRadius={50}
        >
          <Background color="#555" gap={16} />
        </ReactFlow>

        {isContextOpen && caseContext && (
          <div className="absolute top-0 left-0 w-120 h-full bg-neutral-900 text-white p-6 shadow-2xl z-50 flex flex-col gap-4 border-r border-neutral-700 overflow-y-auto">
            <button 
              onClick={() => setIsContextOpen(false)}
              className="self-start text-neutral-400 hover:text-white text-sm font-bold tracking-widest"
            >
              [ CLOSE ]
            </button>
            
            <h2 className="text-2xl font-serif text-red-500 border-b border-neutral-600 pb-2 uppercase">
              CASE FILE: {caseContext.victimName}
            </h2>

            <div className="flex flex-col gap-4 mt-2">
              <div>
                <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Time of Death</h3>
                <p className="text-neutral-200">{caseContext.timeOfDeath}</p>
              </div>
              
              <div>
                <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Cause of Death</h3>
                <p className="text-neutral-200">{caseContext.causeOfDeath}</p>
              </div>

              <div>
                <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Location</h3>
                <p className="text-neutral-200">{caseContext.crimeScene.location}</p>
              </div>

              <div>
                <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Scene Details</h3>
                <p className="text-neutral-200 leading-relaxed text-sm">
                  {caseContext.crimeScene.details}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedNodeData && (
          <div className="absolute top-0 right-0 w-120 h-full bg-neutral-800 text-white p-6 shadow-2xl z-50 flex flex-col gap-4 border-l border-neutral-700 overflow-y-auto">
            <button 
              onClick={() => setSelectedNodeData(null)}
              className="self-end text-neutral-400 hover:text-white text-sm font-bold tracking-widest"
            >
              [ CLOSE ]
            </button>
            
            <h2 className="text-2xl font-serif text-yellow-400 border-b border-neutral-600 pb-2">
              {selectedNodeData.label}
            </h2>

            {selectedNodeData.fullData.description ? (
              <div>
                <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Evidence Details</h3>
                <p className="text-neutral-200 leading-relaxed">
                  {selectedNodeData.fullData.description}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                 <div>
                   <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Appearance</h3>
                   <p className="text-neutral-200">{selectedNodeData.fullData.appearance}</p>
                 </div>
                 <div>
                   <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Clothing</h3>
                   <p className="text-neutral-200">{selectedNodeData.fullData.clothing}</p>
                 </div>
                 <div>
                   <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Known Motive</h3>
                   <p className="text-neutral-200">{selectedNodeData.fullData.motive}</p>
                 </div>
                 <div>
                   <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Alibi</h3>
                   <p className="text-neutral-200 italic">"{selectedNodeData.fullData.alibi}"</p>
                 </div>
              </div>
            )}
          </div>
        )}

        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => window.location.href = '/'}
            className="bg-neutral-800/80 hover:bg-neutral-700 backdrop-blur border border-neutral-600 text-neutral-300 text-xs font-bold tracking-widest py-2 px-6 rounded-full shadow-lg transition-colors"
          >
            &larr; RETURN TO HQ
          </button>
        </div>

        {isGameOver && (
          <div className="absolute bottom-8 right-8 z-40">
            <button
              onClick={() => setShowAftermath(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded shadow-lg transition-colors"
            >
              VIEW VERDICT REPORT
            </button>
          </div>
        )}

        {!isGameOver && (
           <div className="absolute bottom-8 right-8 z-50">
           <button
             onClick={() => setIsAccusationModalOpen(true)}
             className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded shadow-lg transition-colors"
           >
             MAKE ACCUSATION
           </button>
         </div>
        )}

        {!isGameOver && showTutorial && (
          <div className="absolute top-8 right-8 z-40 bg-yellow-100 text-neutral-900 p-5 w-72 shadow-2xl rotate-1 border border-yellow-400 font-mono text-sm">
            <div className="flex justify-between items-start border-b border-yellow-500 pb-2 mb-3">
              <h3 className="font-bold tracking-widest">HOW TO PLAY</h3>
              <button
                onClick={() => setShowTutorial(false)}
                className="text-yellow-600 hover:text-black font-black text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <ul className="list-disc list-outside ml-4 space-y-3 text-xs leading-relaxed">
              <li><strong>Investigate:</strong> Click notes and polaroids to read their details.</li>
              <li><strong>Connect:</strong> Drag red strings from the dots on Suspects to the tape on notes to build a theory.</li>
              <li><strong>Solve:</strong> When you are confident, click MAKE ACCUSATION at the bottom of the screen.</li>
            </ul>
          </div>
        )}

        {isAccusationModalOpen && (
          <AccusationModal 
            onClose={() => setIsAccusationModalOpen(false)}
            onComplete={handleAccusationResult}
            nodes={nodes}
            getConnectedClues={getConnectedClues}
            caseId={caseId as string}
          />
        )}

        {showAftermath && gameOverData && (
          <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-8 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-700 p-8 rounded shadow-2xl max-w-2xl w-full text-white overflow-y-auto max-h-[90vh]">
              <h1 className={`text-4xl font-black mb-2 text-center ${gameOverData.is_correct ? 'text-green-500' : 'text-red-600'}`}>
                {gameOverData.is_correct ? "CASE SOLVED" : "CASE FAILED"}
              </h1>
              
              <div className="bg-neutral-800 p-4 rounded mb-6 border-l-4 border-yellow-500">
                <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-2">Judge's Verdict</h3>
                <p className="text-lg italic leading-relaxed text-neutral-200">"{gameOverData.feedback}"</p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-xs text-red-500 uppercase tracking-wider mb-1 font-bold">The Actual Killer</h3>
                  <p className="text-xl font-serif text-white">{gameOverData.actual_killer}</p>
                </div>

                <div>
                  <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">The Motive</h3>
                  <p className="text-neutral-300">{gameOverData.killer_motive}</p>
                </div>

                <div>
                  <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">The Alibi Flaw</h3>
                  <p className="text-neutral-300">{gameOverData.alibi_flaw}</p>
                </div>

                <div>
                  <h3 className="text-xs text-neutral-400 uppercase tracking-wider mb-1">The Full Solution</h3>
                  <p className="text-neutral-300 leading-relaxed text-sm">
                    {gameOverData.solution_explanation}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-center space-x-10">
                <button 
                  onClick={() => setShowAftermath(false)} 
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded transition-colors !cursor-pointer"
                >
                  REVIEW CORKBOARD
                </button>

                <button 
                  onClick={() => window.location.href = '/'} 
                  className="bg-neutral-600 hover:bg-neutral-500 text-white font-bold py-3 px-8 rounded transition-colors !cursor-pointer"
                >
                  RETURN TO HQ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
