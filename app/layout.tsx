import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-neutral-900 overflow-hidden">
        <div className="md:hidden fixed inset-0 z-[9999] bg-neutral-950 flex flex-col items-center justify-center p-8 text-center text-white">
          <div className="border border-red-800 bg-red-900/20 p-6 rounded-lg shadow-2xl">
            <h1 className="text-2xl font-black text-red-500 mb-4 tracking-widest uppercase">
              Terminal Incompatible
            </h1>
            <p className="text-neutral-300 text-sm leading-relaxed mb-6">
              The Fabricated interface requires a minimum display resolution 
              that your current device does not support. 
            </p>
            <p className="text-neutral-500 text-xs font-mono uppercase">
              Please access this case file from a desktop computer.
            </p>
          </div>
        </div>
        <div className="hidden md:block w-full h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
