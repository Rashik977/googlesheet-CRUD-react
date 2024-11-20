export const dateConverter = (date: string) => {
  const [year, month, day] = date.split("T")[0].split("-");
  return `${year}/${month}/${day}`;
};
