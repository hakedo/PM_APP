// Debug script with fixed date calculation
const today = new Date();
console.log("Today (raw):", today);
const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
console.log("Today UTC timestamp:", todayUTC);
console.log("Today UTC date:", new Date(todayUTC));

const startDateStr = "2025-10-23";
const startDate = new Date(startDateStr);
console.log("\nStart date (raw):", startDate);
const startDateUTC = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
console.log("Start date UTC timestamp:", startDateUTC);
console.log("Start date UTC date:", new Date(startDateUTC));

const diff = startDateUTC - todayUTC;
console.log("\nDifference (ms):", diff);
console.log("Difference (days raw):", diff / (1000 * 60 * 60 * 24));
console.log("Difference (Math.round):", Math.round(diff / (1000 * 60 * 60 * 24)));
