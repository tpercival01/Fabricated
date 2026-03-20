import { Handle, Position } from "reactflow";

export default function ClueNode({ data }: { data: any }) {
  return (
    <div className="relative w-48 border border-yellow-200 bg-yellow-100 p-4 shadow-md">
      <div className="absolute -top-3 left-1/2 h-6 w-12 -translate-x-1/2 rotate-2 bg-white/50 shadow-sm backdrop-blur-sm" />
      <Handle
        type="source"
        position={Position.Top}
        className="!w-10 !h-10 opacity-0 cursor-crosshair"     />
      <div className="min-h-[4rem] font-serif text-gray-800">
        {data.label || "Write clue here..."}
      </div>
      <Handle
        type="target"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-red-600 !border-[1px] !border-white !rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-crosshair"  />
        </div>
  );
}