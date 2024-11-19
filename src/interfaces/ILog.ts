export interface LogEntry {
  email: string;
  day: string;
  field: "roster" | "shift"; // Restricting field to only these two possible values
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp?: string; // Optional as it's added server-side
}

// If you need to type the response from the server
export interface LogResponse {
  success: boolean;
  message: string;
}

// If you need to type the log request payload
export interface LogRequest {
  action: "log";
  logs: string; // Stringified LogEntry[]
}
