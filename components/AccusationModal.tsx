import { useState } from "react";
import { Node } from "reactflow";

interface AccusationModalProps {
  onClose: () => void;
  nodes: Node[];
  getConnectedClues: (suspectId: string) => Node[];
  caseId: string;
  onComplete: (data: any) => void;
}

export default function AccusationModal({
  onClose,
  onComplete,
  nodes,
  getConnectedClues,
  caseId,
}: AccusationModalProps) {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>("");
  const [theory, setTheory] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    is_correct: boolean;
    message: string;
  } | null>(null);

  const suspects = nodes.filter((n) => n.type === "suspect");
  const connectedClues = selectedSuspectId
    ? getConnectedClues(selectedSuspectId)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuspectId) return;

    setIsSubmitting(true);
    try {
      const clueIds = connectedClues.map((c) => c.id);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/cases/${caseId}/accuse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            suspect_id: selectedSuspectId,
            clue_ids: clueIds,
            player_theory: theory,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to submit accusation");

      const data = await res.json();
      onComplete(data);
    } catch (error) {
      console.error(error);
      setFeedback({
        is_correct: false,
        message: "Network error. The Chief is unreachable.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-700 p-8 rounded shadow-2xl w-full max-w-2xl flex flex-col gap-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white font-bold tracking-widest text-sm"
        >
          [ X ]
        </button>

        {feedback ? (
          <div className="flex flex-col gap-6">
            <h2
              className={`text-3xl font-serif ${
                feedback.is_correct ? "text-green-500" : "text-red-500"
              }`}
            >
              {feedback.is_correct ? "CASE CLOSED" : "ACCUSATION REJECTED"}
            </h2>
            <div className="bg-neutral-800 p-4 rounded border border-neutral-700">
              <h3 className="text-xs text-neutral-400 uppercase tracking-widest mb-2">
                Chief's Notes
              </h3>
              <p className="text-neutral-200 leading-relaxed">
                {feedback.message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-3 px-4 rounded transition-colors"
            >
              RETURN TO CORKBOARD
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-serif text-red-500 border-b border-red-900/50 pb-2">
                FILE ACCUSATION
              </h2>
              <p className="text-sm text-neutral-400 mt-2">
                Select your primary suspect. The physical connections on your
                corkboard will be submitted as your evidence.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
                Target Suspect
              </label>
              <select
                value={selectedSuspectId}
                onChange={(e) => setSelectedSuspectId(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-white p-3 rounded outline-none focus:border-red-500 transition-colors"
                required
              >
                <option value="" disabled>
                  Select a suspect...
                </option>
                {suspects.map((suspect) => (
                  <option key={suspect.id} value={suspect.id}>
                    {suspect.data.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedSuspectId && (
              <div className="flex flex-col gap-2">
                <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
                  Attached Evidence
                </label>
                {connectedClues.length > 0 ? (
                  <ul className="bg-neutral-800 border border-neutral-700 p-3 rounded flex flex-col gap-2 max-h-32 overflow-y-auto">
                    {connectedClues.map((clue) => (
                      <li
                        key={clue.id}
                        className="text-sm text-neutral-300 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        {clue.data.label}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="bg-neutral-800/50 border border-neutral-700 border-dashed p-4 rounded text-center text-neutral-500 text-sm">
                    No clues connected to this suspect on the corkboard.
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
                Your Deduction Theory
              </label>
              <textarea
                value={theory}
                onChange={(e) => setTheory(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 text-white p-3 rounded h-32 outline-none focus:border-red-500 transition-colors resize-none"
                placeholder="Explain how the evidence proves their guilt..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={!selectedSuspectId || isSubmitting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold py-4 px-8 rounded shadow-lg transition-colors mt-2"
            >
              {isSubmitting ? "SUBMITTING REPORT..." : "SUBMIT REPORT TO CHIEF"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}