// Debug script with the final approach
const today = new Date();
console.log("Today (raw):", today);
const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
console.log("Today midnight (local):", todayMidnight);

const startDateStr = "2025-10-23";
const startDate = new Date(startDateStr);
console.log("\nStart date (raw):", startDate);
console.log("Start date UTC components:", startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
const startMidnight = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
console.log("Start midnight (local from UTC components):", startMidnight);

const diff = startMidnight - todayMidnight;
console.log("\nDifference (ms):", diff);
console.log("Difference (days raw):", diff / (1000 * 60 * 60 * 24));
console.log("Difference (Math.round):", Math.round(diff / (1000 * 60 * 60 * 24)));
