import { windowClosed } from "@/domain/collectionStatus";
import type { CollectionEntry, Farmer, Shift } from "@/types/models";
import { dayNumber, indiaDate, indiaHour } from "@/utils/date";

export function collectionEntry(
  farmer: Farmer,
  date: string,
  shift: Shift,
  now: Date,
): CollectionEntry {
  const index = farmer.index,
    day = dayNumber(date),
    societyIndex = Math.floor(index / 20),
    s = shift === "Morning" ? 0 : 1;
  const hour = (s ? 16 : 5) + (index % 4);
  const entry: CollectionEntry = {
    farmerId: farmer.id,
    date,
    shift,
    ml: 0,
    status: "Not expected",
    hour,
  };
  if (!farmer.active || !farmer.shifts.includes(shift)) return entry;
  const closed = windowClosed(date, shift, now);
  if (date > indiaDate(now) || (!closed && indiaHour(now) < hour + 1))
    return { ...entry, status: "Pending" };
  const hash = ((index + 13) * 7919 + day * 101 + s * 1307) >>> 0;
  // Fixed and rotating gaps expose realistic individual, society, and BMC exceptions.
  const zero =
    index % 53 === 1 ||
    (societyIndex === 9 && day % 7 === 0) ||
    (Math.floor(societyIndex / 5) === 5 && day % 29 === 0) ||
    hash % 100 < 6;
  const missing = hash % 100 >= 6 && hash % 100 < 9;
  if (zero || missing)
    return {
      ...entry,
      status: closed ? (zero ? "Confirmed zero" : "Missing record") : "Pending",
    };
  const seasonal = Math.round(
    Math.sin(((day % 365) / 365) * Math.PI * 2) * 500,
  );
  return {
    ...entry,
    ml: Math.max(
      1000,
      farmer.cows * (s ? 2100 : 2800) + (hash % 1700) + seasonal,
    ),
    status: "Supplied",
  };
}
