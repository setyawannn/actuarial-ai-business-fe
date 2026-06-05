import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChartBadgeProps {
  type: "ai-derived" | "source-backed" | "confidence";
  value?: number;
}

export function ChartBadge({ type, value }: ChartBadgeProps) {
  if (type === "ai-derived") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="cursor-help bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20 transition-colors">
              AI-derived
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px] bg-popover/95 backdrop-blur-sm border shadow-lg text-sm">
            <p>Data ini dihasilkan melalui analisis model AI kami berdasarkan interpretasi data yang tersedia, bukan dari data sumber langsung.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (type === "source-backed") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="cursor-help bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
              Source-backed
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px] bg-popover/95 backdrop-blur-sm border shadow-lg text-sm">
            <p>Data ini diambil langsung dari dokumen atau sumber referensi yang valid tanpa modifikasi AI.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  if (type === "confidence" && value !== undefined) {
    const color = value >= 70
      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
      : value >= 40
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20";
    
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className={`cursor-help ${color} transition-colors`}>
              Confidence: {value}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[250px] bg-popover/95 backdrop-blur-sm border shadow-lg text-sm">
            <p>Tingkat kepercayaan AI terhadap kesimpulan dan prediksi ini. Angka lebih tinggi berarti AI sangat yakin.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return null;
}
