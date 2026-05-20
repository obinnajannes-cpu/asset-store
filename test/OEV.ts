import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("OEV token", async function () {
  const { viem } = await network.create();

  it("deploys with the correct name, symbol and initial supply", async function () {
    const oev = await viem.deployContract("OEV");

    assert.equal(await oev.read.name(), "OG Elite Ventures");
    assert.equal(await oev.read.symbol(), "OEV");
    assert.equal(await oev.read.totalSupply(), 1_000_000n * 10n ** 18n);
  });
});
