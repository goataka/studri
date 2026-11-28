import { describe, expect, it } from "vitest";
import { currentEnv, storageKey } from "./storage-key";

describe("storageKey", () => {
  it("保存名の前に環境名を付ける", () => {
    expect(storageKey("studri.sound", "staging")).toBe("staging:studri.sound");
  });

  it("環境名がないときは local にする", () => {
    expect(currentEnv()).toBe("local");
    expect(storageKey("studri.sound")).toBe("local:studri.sound");
  });
});
