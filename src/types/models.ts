export type Shift = "Morning" | "Evening";

export type Status =
  | "Supplied"
  | "Partial supply"
  | "Confirmed zero"
  | "Missing record"
  | "Pending"
  | "Not expected";

export type EntityKind = "bmcs" | "societies" | "farmers";

export interface BMC {
  id: string;
  name: string;
  location: string;
}

export interface Society {
  id: string;
  name: string;
  bmcId: string;
  location: string;
}

export interface Farmer {
  id: string;
  demoAadhaar: string;
  name: string;
  societyId: string;
  village: string;
  contact: string;
  cows: number;
  active: boolean;
  shifts: Shift[];
  index: number;
}

export interface Cow {
  id: string;
  farmerId: string;
  tagId: string;
  breed: string;
  birthDate: string;
  lactationStatus: "Lactating" | "Dry" | "Heifer";
}

export interface MedicineRecord {
  id: string;
  cowId: string;
  treatmentDate: string;
  medicine: string;
  reason: string;
  recordedDose: string;
  duration: string;
  veterinarian: string;
  notes: string;
}

export interface OwnerCowDetails {
  owner: Farmer;
  society: Society;
  bmc: BMC;
  cows: (Cow & { medicines: MedicineRecord[] })[];
}

export interface CollectionEntry {
  farmerId: string;
  date: string;
  shift: Shift;
  ml: number;
  status: Exclude<Status, "Partial supply">;
  hour: number;
}

export interface Filters {
  preset: string;
  start: string;
  end: string;
  shift: "Both" | Shift;
  bmc: string;
  society: string;
}

export interface FarmerStats {
  id: string;
  ml: number;
  morning: number;
  evening: number;
  supplied: number;
  zero: number;
  missing: number;
  pending: number;
  expected: number;
  missedDays: number;
  lastDelivery: string;
  status: Status;
}

export interface SeriesPoint {
  name: string;
  date: string;
  morning: number;
  evening: number;
  litres: number;
  pending?: boolean;
}

export interface Summary {
  ml: number;
  morning: number;
  evening: number;
  stats: FarmerStats[];
  series: SeriesPoint[];
  daily: SeriesPoint[];
  days: number;
  farmers: Farmer[];
}

export interface Row {
  id: string;
  name: string;
  location: string;
  bmc: string;
  society: string;
  contact: string;
  cows: number;
  farmers: number;
  societies: number;
  ml: number;
  morning: number;
  evening: number;
  zero: number;
  missing: number;
  pending: number;
  expected: number;
  missedDays: number;
  lastDelivery: string;
  lastDeliveryScope: string;
  status: Status;
  affected: number;
  pattern: string;
}

export interface QueryOptions {
  farmerId?: string;
  elapsedReference?: { date: string; cutoff: Date };
}
