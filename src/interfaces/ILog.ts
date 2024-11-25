export interface LogEntry {
  email: string;
  day: string;
  field: "roster" | "shift";
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp?: string;
  date?: string;
}
