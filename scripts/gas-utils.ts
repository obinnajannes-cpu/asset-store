import type { PublicClient } from "viem";

export interface GasPricing {
  gasPrice?: bigint;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

function parseGasValue(value: unknown): bigint | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    if (value.startsWith("0x")) {
      return BigInt(value);
    }
    if (/^\d+$/.test(value)) {
      const asBigInt = BigInt(value);
      return asBigInt <= 1_000_000n ? asBigInt * 1_000_000_000n : asBigInt;
    }
  }

  if (typeof value === "number") {
    const asBigInt = BigInt(Math.floor(value));
    return asBigInt <= 1_000_000n ? asBigInt * 1_000_000_000n : asBigInt;
  }

  return undefined;
}

function parseGasApiResponse(payload: any): GasPricing | undefined {
  if (payload == null || typeof payload !== "object") {
    return undefined;
  }

  const gasPrice = parseGasValue(
    payload.gasPrice ?? payload.gas_price ?? payload.price ?? payload.fast ?? payload.standard ?? payload.average ?? payload.safeLow ?? payload.slow
  );
  const maxFeePerGas = parseGasValue(
    payload.maxFeePerGas ?? payload.max_fee_per_gas ?? payload.max_fee ?? payload.maxFee ?? payload.maxPriorityFeePerGas
  );
  const maxPriorityFeePerGas = parseGasValue(
    payload.maxPriorityFeePerGas ?? payload.max_priority_fee_per_gas ?? payload.priorityFee ?? payload.priority_fee ?? payload.tip
  );

  if (maxFeePerGas !== undefined && maxPriorityFeePerGas !== undefined) {
    return { maxFeePerGas, maxPriorityFeePerGas };
  }

  if (gasPrice !== undefined) {
    return { gasPrice };
  }

  return undefined;
}

export async function getGasPricing(publicClient: PublicClient): Promise<GasPricing | undefined> {
  const gasApiUrl = process.env.GAS_API_URL;
  if (!gasApiUrl) {
    return undefined;
  }

  try {
    const response = await fetch(gasApiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.warn(`Gas API request failed: ${response.status} ${response.statusText}`);
      return undefined;
    }

    const payload = await response.json();
    const pricing = parseGasApiResponse(payload);
    if (pricing) {
      return pricing;
    }

    console.warn("Gas API returned unexpected payload, falling back to provider defaults.");
    return undefined;
  }
  catch (error) {
    console.warn("Gas API request error:", error);
    return undefined;
  }
}

export async function getGasPricingOrDefault(publicClient: PublicClient): Promise<GasPricing> {
  const pricing = await getGasPricing(publicClient);
  if (pricing) {
    return pricing;
  }

  const gasPrice = await publicClient.getGasPrice();
  return { gasPrice };
}
