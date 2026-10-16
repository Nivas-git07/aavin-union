import { farmers } from "@/data/mock/network";
import type { Cow, MedicineRecord } from "@/types/models";

const breeds = ["Jersey cross", "Holstein Friesian cross", "Kangayam"];

/** Fictional master records; each owner's herd matches the collection dashboard. */
export const cows: Cow[] = farmers.flatMap((farmer) =>
  Array.from({ length: farmer.cows }, (_, index) => {
    const suffix = `${farmer.id.slice(4)}-${String(index + 1).padStart(2, "0")}`;
    const heifer = index % 3 === 2;
    return {
      id: `COW-${suffix}`,
      farmerId: farmer.id,
      tagId: `DEMO-TAG-${suffix}`,
      breed: breeds[(farmer.index + index) % breeds.length],
      birthDate: `${heifer ? 2025 : 2020 + (farmer.index % 4)}-${String(index + 1).padStart(2, "0")}-15`,
      lactationStatus: heifer
        ? "Heifer"
        : index % 3 === 1
          ? "Dry"
          : "Lactating",
    };
  }),
);

/** Sample recorded history only; these are not treatment recommendations. */
export const medicineRecords: MedicineRecord[] = cows.flatMap((cow, index) =>
  index % 3 === 1
    ? []
    : [
        {
          id: `MED-${cow.id}-01`,
          cowId: cow.id,
          treatmentDate: "2026-06-10",
          medicine: "Demo mineral supplement",
          reason: "Routine nutrition follow-up",
          recordedDose: "1 demo measure",
          duration: "7 days",
          veterinarian: "Demo veterinarian A",
          notes: "Fictional record; follow-up completed.",
        },
        {
          id: `MED-${cow.id}-02`,
          cowId: cow.id,
          treatmentDate: "2026-09-12",
          medicine: "Demo veterinary supplement",
          reason: "Post-examination care",
          recordedDose: "1 demo measure",
          duration: "3 days",
          veterinarian: "Demo veterinarian B",
          notes: "Fictional record; routine review recorded.",
        },
      ],
);
