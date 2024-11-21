// Utility function for formatting date/time
export const formatDateTime = (timestamp?: string) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };