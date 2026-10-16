import { collectionEntry } from "@/data/mock/collectionGenerator";
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
};

export { bmcById, bmcs, collectionEntry, farmers, societies, societyById };
