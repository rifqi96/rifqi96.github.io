export function generateCommand(
  pair: string,
  position: string,
  deployedCapital: number,
  rewardPercent: number,
  stopLossPercent: number,
  leverage: number,
  options: {
    hasSlPrice?: boolean;
    stopMarketPrice?: string | null;
  } = {},
): string {
  // Round the deployed capital without decimal places
  const roundedCapital = Math.round(deployedCapital);

  // Determine the price part of the command
  const priceCommand = options.stopMarketPrice
    ? `${options.stopMarketPrice}(SM)`
    : "market";

  // If slPrice is present, omit rewardPercent and stopLossPercent
  if (options.hasSlPrice) {
    return `${pair}(x${leverage}), ${position}, $${roundedCapital}, ${priceCommand}`;
  } else {
    // Round the reward and stop loss percent to 2 decimal places
    const formattedRewardPercent = `${Math.round(rewardPercent * 100) / 100}%`;
    const formattedStopLossPercent = `${
      Math.round(stopLossPercent * 100) / 100
    }%`;
    return `${pair}(x${leverage}), ${position}, $${roundedCapital}, ${priceCommand}|${formattedRewardPercent}|${formattedStopLossPercent}`;
  }
}

export function generateReduceCommand(
  pair: string,
  position: string,
  reduceAmount: number,
  leverage: number,
): string {
  return `${pair}(x${leverage}), ${position}, $${Math.round(
    reduceAmount,
  )}, market`;
}

export function generateBeCommand(
  pair: string,
  tpsl: string,
  positionH: string,
): string {
  return `${pair}, ${tpsl}, ${positionH}, - | 0%(100%)`;
}

export function generateSLCommand(
  pair: string,
  tpsl: string,
  positionH: string,
  slPrice: number,
  tpPrice: number,
  contractsAmount: number,
  leverage: number,
): string {
  const amountString = contractsAmount.toFixed(10);
  return `${pair}(x${leverage}), ${tpsl}, ${positionH}, ${tpPrice.toFixed(
    2,
  )}(${amountString}) | ${slPrice}(${amountString})`;
}
