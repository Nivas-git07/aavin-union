import { cows, medicineRecords } from "@/data/mock/cows";
import { demoRepository } from "@/services/demoRepository";
import { describe, expect, it } from "vitest";

describe("cow registry", () => {
  it("has unique demo identities and reconciles every farmer's registered cows", () => {
    const { farmers } = demoRepository;
    expect(new Set(farmers.map((farmer) => farmer.demoAadhaar)).size).toBe(
      farmers.length,
    );
    expect(farmers.every((farmer) => /^\d{12}$/.test(farmer.demoAadhaar))).toBe(
      true,
    );
    expect(new Set(cows.map((cow) => cow.id)).size).toBe(cows.length);
    expect(new Set(cows.map((cow) => cow.tagId)).size).toBe(cows.length);
    expect(cows).toHaveLength(
      farmers.reduce((total, farmer) => total + farmer.cows, 0),
    );
    for (const farmer of farmers) {
      expect(cows.filter((cow) => cow.farmerId === farmer.id)).toHaveLength(
        farmer.cows,
      );
    }
    expect(new Set(medicineRecords.map((record) => record.id)).size).toBe(
      medicineRecords.length,
    );
    expect(
      medicineRecords.every((record) =>
        cows.some(
          (cow) =>
            cow.id === record.cowId && cow.birthDate <= record.treatmentDate,
        ),
      ),
    ).toBe(true);
  });

  it("returns the exact owner, hierarchy and only that owner's cow histories, newest first", () => {
    const result = demoRepository.findOwnerByAadhaar("000000000001")!;
    expect(result.owner.id).toBe("FMR-0001");
    expect(result.society.id).toBe(result.owner.societyId);
    expect(result.bmc.id).toBe(result.society.bmcId);
    expect(result.cows).toHaveLength(2);
    expect(result.cows.every((cow) => cow.farmerId === result.owner.id)).toBe(
      true,
    );
    expect(
      result.cows[0].medicines.map((record) => record.treatmentDate),
    ).toEqual(["2026-09-12", "2026-06-10"]);
    expect(
      result.cows.every((cow) =>
        cow.medicines.every((record) => record.cowId === cow.id),
      ),
    ).toBe(true);
    expect(result.cows[1].medicines).toEqual([]);
    expect(demoRepository.findOwnerByAadhaar("000000000002")?.owner.id).toBe(
      "FMR-0002",
    );
    for (const query of ["", "00000000000", "0000000000999", "999999999999"]) {
      expect(demoRepository.findOwnerByAadhaar(query)).toBeNull();
    }
  });
});
