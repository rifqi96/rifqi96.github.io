export function generateCommand(
  pair: string,
  position: string,
  deployedCapital: number,
  rewardPercent: number,
  stopLossPercent: number,
  leverage: number,
  hasSLPrice: boolean,
): string {
  const roundedCapital = Math.round(deployedCapital);
  const roundedReward = Math.round(rewardPercent * 100) / 100;
  const roundedStopLoss = Math.round(stopLossPercent * 100) / 100;
  const stopLoss = hasSLPrice
    ? "-"
    : `${Math.round(stopLossPercent * 100) / 100}`;
  return `${pair}(x${leverage}), ${position}, $${roundedCapital}, market|${roundedReward}%|${stopLoss}`;
}

export function generateReduceCommand(
  pair: string,
  position: string,
  reduceAmount: number,
  leverage: number,
): string {
  const roundedAmount = Math.round(reduceAmount);
  return `${pair}(x${leverage}), ${position}, $${roundedAmount}, market`;
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
  amountToBeLiquidated: number,
  leverage: number,
): string {
  const roundedSLPrice = slPrice.toFixed(8);
  const roundedAmount = amountToBeLiquidated.toFixed(10);
  return `${pair}(x${leverage}), ${tpsl}, ${positionH}, - | ${roundedSLPrice}(${roundedAmount})`;
}
