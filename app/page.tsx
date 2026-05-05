"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const historyStr = localStorage.getItem("fabricate_history");
    if(historyStr){
      setHistory(JSON.parse(historyStr));
    }
  }, []);

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError("You must enter a theme to begin.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/api/cases/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({theme, difficulty }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("GCPD database lockout. You have requested too many case files recently. Please wait an hour.");
        }
        throw new Error("Failed to generate case");
      }

      const data = await response.json();

      if (data.case_id) {
        router.push(`/case/${data.case_id}`);
      } else {
        throw new Error("No case ID returned from backend");
      }
    } catch (err) {
      console.error(err);
      setError("The case generation failed. Please try again.");
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-neutral-700 border-t-red-600 rounded-full animate-spin"></div>
          <h1 className="text-2xl font-black tracking-widest text-neutral-300 animate-pulse uppercase">
            Constructing Case File...
          </h1>
          <p className="text-neutral-500 font-mono text-sm uppercase">
            Interviewing suspects and gathering evidence. Please wait.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-8">Fabricated</h1>

      <section className="mb-8 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
          Procedural AI mystery game
        </p>
      
        <p className="mx-auto max-w-2xl text-sm leading-6 text-neutral-300">
          Fabricated generates a unique murder mystery case on demand. Choose a theme, select a difficulty, then investigate suspects, connect evidence on a digital case board, and submit your final theory to an AI judge.
        </p>
      
        <div className="mt-6 grid gap-3 text-left text-sm text-neutral-300 sm:grid-cols-3">
          <div className="rounded border border-neutral-700 bg-neutral-900 p-4">
            <strong className="block text-white">Generate</strong>
            Create a new case from your own theme.
          </div>
      
          <div className="rounded border border-neutral-700 bg-neutral-900 p-4">
            <strong className="block text-white">Investigate</strong>
            Review suspects, clues, motives, and contradictions.
          </div>
      
          <div className="rounded border border-neutral-700 bg-neutral-900 p-4">
            <strong className="block text-white">Accuse</strong>
            Submit your theory and evidence for judgement.
          </div>
        </div>
      </section>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col gap-4 w-80">
        <div>
          <label className="block text-sm font-bold mb-2">Custom Theme</label>
          <input
            type="text"
            maxLength={50}
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. 1920s Mafia, Space Station, 1600s Wallachia"
            className="border p-2 w-full text-white rounded"
          />
        </div>
        <p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
          Try themes like 1920s mafia, lunar research base, gothic manor, or corporate cybercrime.
        </p>

        <div>
          <label className="block text-sm font-bold mb-2">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="border p-2 w-full text-white rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded mt-4"
        >
          Start Investigation
        </button>
      </div>

      {history.length > 0 && (
        <div className="mt-16 w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-4 border-b border-neutral-700 pb-2 uppercase tracking-widest text-neutral-400">
            Archived Case Files
          </h2>
          <div className="flex flex-col gap-3">
            {history.slice().reverse().map((pastCase: any, idx: number) => (
              <div 
                key={idx} 
                onClick={() => router.push(`/case/${pastCase.caseId}`)}
                className="flex items-center justify-between bg-neutral-900 border border-neutral-700 p-4 rounded cursor-pointer hover:border-neutral-500 hover:bg-neutral-800 transition-colors"
              >
                <div>
                <h3 className="font-bold text-white uppercase">
                  {pastCase.victimName} <span className="text-neutral-500 text-xs normal-case ml-2">#{pastCase.caseId.split('-')[0]}</span>
                </h3>                  
                  <span className="text-xs text-neutral-500">{pastCase.date}</span>
                </div>
                <div className={`text-sm font-black tracking-widest ${
                  pastCase.isSolved === true ? 'text-green-500' : 
                  pastCase.isSolved === false ? 'text-red-600' : 
                  'text-blue-500'
                }`}>
                  {pastCase.isSolved === true ? 'SOLVED' : 
                   pastCase.isSolved === false ? 'FAILED' : 
                   'IN PROGRESS'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
