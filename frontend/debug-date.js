// Debug script to check date calculation
const today = new Date();
console.log("Today (raw):", today);
console.log("Today ISO:", today.toISOString());
today.setHours(0, 0, 0, 0);
console.log("Today (normalized):", today);

const startDateStr = "2025-10-23";
const startDate = new Date(startDateStr);
console.log("Start date (raw):", startDate);
console.log("Start date ISO:", startDate.toISOString());
startDate.setHours(0, 0, 0, 0);
console.log("Start date (normalized):", startDate);

const diff = startDate - today;
console.log("Difference (ms):", diff);
console.log("Difference (days raw):", diff / (1000 * 60 * 60 * 24));
console.log("Difference (Math.round):", Math.round(diff / (1000 * 60 * 60 * 24)));
console.log("Difference (Math.ceil):", Math.ceil(diff / (1000 * 60 * 60 * 24)));
