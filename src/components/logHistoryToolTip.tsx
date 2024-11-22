import { LogEntry } from "@/interfaces/ILog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { ClockIcon } from "lucide-react";
import { formatDateTime } from "@/utils/formatDateTime";

export const LogHistoryTooltip = ({
  email,
  date,
  getLogHistoryForCell,
}: {
  email: string;
  date: string;
  getLogHistoryForCell: (email: string, date: string) => LogEntry[];
}) => {
  const logHistory = getLogHistoryForCell(email, date);

  if (logHistory.length === 0) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-pointer">
          <ClockIcon size={16} className="text-gray-500 hover:text-gray-700" />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <div className="text-xs">
          {logHistory.map((log, idx) => (
            <div key={idx} className="mb-1">
              <span className="font-bold">{log.field}</span>:{log.oldValue} →{" "}
              {log.newValue}
              <span className="ml-2 text-gray-400">
                {formatDateTime(log.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
