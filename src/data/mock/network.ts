import type { BMC, Farmer, Society } from "@/types/models";

const places = [
  "Melur",
  "Usilampatti",
  "Thirumangalam",
  "Vadipatti",
  "Alanganallur",
  "Peraiyur",
];

const villages = [
  "Arittapatti",
  "Kottampatti",
  "Vellalapatti",
  "Keelavalavu",
  "Navinipatti",
  "Chekkanoorani",
  "Karumathur",
  "Chellampatti",
  "Uthappanaickanur",
  "Valandur",
  "Kappalur",
  "Kalligudi",
  "Sivarakottai",
  "Alampatti",
  "Koodakovil",
  "Sholavandan",
  "Samayanallur",
  "Thenkarai",
  "Kuruvithurai",
  "Katchaikatti",
  "Palamedu",
  "Mettupatti",
  "Achampatti",
  "Kondayampatti",
  "Vavidamaruthur",
  "Sedapatti",
  "Elumalai",
  "T. Kallupatti",
  "Saptur",
  "Athipatti",
];

const names = [
  "Murugan",
  "Lakshmi",
  "Selvam",
  "Meenakshi",
  "Karuppasamy",
  "Muthulakshmi",
  "Ramesh",
  "Parvathi",
  "Pandi",
  "Kavitha",
  "Rajendran",
  "Selvi",
  "Arumugam",
  "Chitra",
  "Kannan",
  "Dhanalakshmi",
  "Sundaram",
  "Amutha",
  "Manikandan",
  "Valli",
];

export const bmcs: BMC[] = places.map((name, i) => ({
  id: `BMC-${String(i + 1).padStart(3, "0")}`,
  name: `${name} BMC`,
  location: name,
}));

export const societies: Society[] = villages.map((name, i) => ({
  id: `SOC-${String(i + 1).padStart(3, "0")}`,
  name: `${name} Society`,
  bmcId: bmcs[Math.floor(i / 5)].id,
  location: name,
}));

export const farmers: Farmer[] = Array.from({ length: 600 }, (_, i) => ({
  id: `FMR-${String(i + 1).padStart(4, "0")}`,
  demoAadhaar: `000000${String(i + 1).padStart(6, "0")}`,
  name: `${String.fromCharCode(65 + (Math.floor(i / 20) % 20))}. ${names[i % 20]}`,
  societyId: societies[Math.floor(i / 20)].id,
  village: villages[Math.floor(i / 20)],
  contact: `DEMO-${String(i + 1).padStart(4, "0")}`,
  cows: 2 + (i % 7),
  active: i % 41 !== 0,
  shifts: i % 17 === 0 ? ["Morning"] : ["Morning", "Evening"],
  index: i,
}));

export const societyById = new Map(societies.map((s) => [s.id, s]));

export const bmcById = new Map(bmcs.map((b) => [b.id, b]));
