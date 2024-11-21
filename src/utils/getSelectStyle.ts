export const getSelectStyle = (type: "roster" | "shift", value: string) => {
    if (type === "roster") {
      return value === "WFH"
        ? "bg-[#69c17c] text-white"
        : value === "WFO"
        ? "bg-[#4a805b] text-white"
        : "bg-white text-black";
    } else {
      return value === "MORNING"
        ? "bg-[#fee5a0] text-black"
        : value === "DAY"
        ? "bg-[#E8EAED] text-black"
        : value === "EVENING"
        ? "bg-[#F6C7A9] text-black"
        : value === "LATE"
        ? "bg-[#3D3D3D] text-white"
        : "bg-white";
    }
  };