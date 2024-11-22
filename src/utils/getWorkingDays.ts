  // Helper function to get dates between range (excluding weekends)
  export const getWorkingDays = (start: string, end: string) => {
    if (!start || !end) return [];
    const dates: string[] = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) {
        // Skip Saturday (6) and Sunday (0)
        dates.push(current.toISOString().split("T")[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };