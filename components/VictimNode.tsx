import React from "react";

interface VictimNodeProps {
  data?: {
    name: string;
    status: string;
    imageUrl?: string;
  };
}

export default function VictimNode({ data }: VictimNodeProps) {
  const victimName = data?.name || "UNKNOWN SUBJECT";
  const victimStatus = data?.status || "DECEASED";

  return (
    <div
      className="relative w-56 cursor-pointer border-4 border-red-600
                 bg-[#f9f9f9] p-3 shadow-[0_10px_25px_rgba(220,38,38,0.4)]
                 transition-transform duration-200 hover:rotate-0
                 hover:scale-105 rotate-[-3deg]"
    >
      <div
        className="absolute -top-4 left-1/2 z-10 w-32 -translate-x-1/2
                   rotate-[4deg] bg-red-600 py-1 text-center text-xs
                   font-black tracking-widest text-white shadow-md"
      >
        START HERE
      </div>

      <div className="relative h-48 w-full border border-gray-300 bg-gray-200">
        {data?.imageUrl ? (
          <img
            src={data.imageUrl}
            alt="Victim"
            className="h-full w-full object-cover grayscale sepia-[.20]
                       contrast-125"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center
                       bg-gray-800 text-center text-sm font-bold text-gray-400"
          >
            NO PHOTO
            <br />
            ON FILE
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col items-center justify-center font-mono">
        <h2
          className="border-b-2 border-red-600 pb-1 text-center text-lg
                     font-bold text-gray-900"
        >
          {victimName}
        </h2>
        <span className="mt-2 text-xs font-bold tracking-widest text-red-600">
          STATUS: {victimStatus}
        </span>
      </div>

    </div>
  );
}
