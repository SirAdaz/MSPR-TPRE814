import { countryApiMap } from "@/lib/countries";

describe("countryApiMap", () => {
  it("contains supported country endpoints", () => {
    expect(countryApiMap.BR).toBeTruthy();
    expect(countryApiMap.EC).toBeTruthy();
    expect(countryApiMap.CO).toBeTruthy();
  });
});
