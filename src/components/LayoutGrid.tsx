interface LayoutGridProps {
    theme?: "light" | "dark";
}

export default function LayoutGrid({ theme = "dark" }: LayoutGridProps) {
    const crossColor = theme === "light" ? "bg-red-800/90" : "bg-lime-300/80";
    const gridColor = theme === "light" ? "bg-red-800/30" : "bg-lime-400/20";

    return (
        <div className="fixed z-100">
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
                {/* <div className={`absolute w-6 h-[2px] ${crossColor}`}></div>
                <div className={`absolute w-[2px] h-6 ${crossColor}`}></div> */}
                <div className="absolute inset-x-0 flex justify-between">
                    {/* Left line */}
                    <div
                        className={`w-[1px] h-screen ${gridColor} ml-5 md:ml-20 lg:ml-[120px]`}
                    ></div>
                    {/* Center line */}
                    <div
                        className={`w-[1px] h-screen ${gridColor} absolute left-[520px]`}
                    ></div>
                    <div
                        className={`w-[1px] h-screen ${gridColor} absolute left-[536px]`}
                    ></div>

                    {/* Right line */}
                    <div
                        className={`w-[1px] h-screen ${gridColor} mr-5 md:mr-20 lg:mr-[120px]`}
                    ></div>
                    {/* Top line */}
                    <div
                        className={`absolute top-0 left-0 right-0 h-[1px] ${gridColor} mt-[20px]`}
                    ></div>
                    <div
                        className={`absolute top-0 left-0 right-0 h-[1px] ${gridColor} mt-[200px]`}
                    ></div>
                    {/* Bottom line */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 h-[1px] ${gridColor} mb-[20px]`}
                    ></div>
                </div>
            </div>
        </div>
    );
}
