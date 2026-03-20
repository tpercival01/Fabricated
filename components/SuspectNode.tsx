import {Handle, Position} from "reactflow";

export default function SuspectNode({data}: {data: any}){
    return (
        <div className="w-48 rounded-sm border border-gray-200 bg-white p-3 pb-12 shadow-lg transition-shadow hover:shadow-xl">
            <Handle 
            type="source" 
            position={Position.Top} 
            className="!w-3 !h-3 !bg-red-600 !border-[1px] !border-white !rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-crosshair" />
                       <div className="flex aspect-square w-full items-center justify-center overflow-hidden bg-slate-800 text-white shadow-inner">
                {data.label || "No Suspect"}
            </div>
            <Handle 
            type="target" 
            position={Position.Bottom} 
            className="!w-3 !h-3 !bg-red-600 !border-[1px] !border-white !rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5)] cursor-crosshair"           />
        </div>
    );
}