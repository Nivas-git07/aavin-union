import { collectionEntry } from "@/data/mock/collectionGenerator";
import { cows, medicineRecords } from "@/data/mock/cows";
import {
  bmcById,
  bmcs,
  farmers,
  societies,
  societyById,
} from "@/data/mock/network";
import { summarize } from "@/domain/collection";
import type { CollectionRepository } from "@/types/repository";

/** Public data boundary. UI modules do not import raw demo generators. */
export const demoRepository: CollectionRepository = {
  summarize,
  collectionEntry,
  bmcs,
  societies,
  farmers,
  bmcById,
  societyById,
  findOwnerByAadhaar(aadhaar) {
    const owner = farmers.find((farmer) => farmer.demoAadhaar === aadhaar);
    if (!owner) return null;
    const society = societyById.get(owner.societyId)!;
    return {
      owner,
      society,
      bmc: bmcById.get(society.bmcId)!,
      cows: cows
        .filter((cow) => cow.farmerId === owner.id)
        .map((cow) => ({
          ...cow,
          medicines: medicineRecords
            .filter((record) => record.cowId === cow.id)
            .sort((a, b) => b.treatmentDate.localeCompare(a.treatmentDate)),
        })),
    };
  },
};

export { bmcById, bmcs, collectionEntry, farmers, societies, societyById };
