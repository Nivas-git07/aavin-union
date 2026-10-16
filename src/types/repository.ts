import type {
  BMC,
  CollectionEntry,
  Farmer,
  OwnerCowDetails,
  Filters,
  QueryOptions,
  Shift,
  Society,
  Summary,
} from "@/types/models";

/** Data-access contract used by the frontend's synchronous demo adapter. */
export interface CollectionRepository {
  readonly bmcs: readonly BMC[];
  readonly societies: readonly Society[];
  readonly farmers: readonly Farmer[];
  readonly bmcById: ReadonlyMap<string, BMC>;
  readonly societyById: ReadonlyMap<string, Society>;
  findOwnerByAadhaar(aadhaar: string): OwnerCowDetails | null;
  summarize(filters: Filters, now: Date, options?: QueryOptions): Summary;
  collectionEntry(
    farmer: Farmer,
    date: string,
    shift: Shift,
    now: Date,
  ): CollectionEntry;
}
