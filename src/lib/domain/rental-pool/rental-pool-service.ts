export type RentalPoolPayoutItemViewModel = {
  id: string;
  periodLabel: string;
  amountLabel: string;
  statusLabel: string;
};

export type RentalPoolSummaryViewModel = {
  reserveLabel: string;
  nextPayoutDateLabel: string;
  statusLabel: string;
  payouts: RentalPoolPayoutItemViewModel[];
};

export async function getRentalPoolSummaryViewModel(
  _organizationId: string,
): Promise<RentalPoolSummaryViewModel> {
  return {
    reserveLabel: "18.340 €",
    nextPayoutDateLabel: "31.03.2026",
    statusLabel: "Aktiv",
    payouts: [
      {
        id: "pool-payout-1",
        periodLabel: "Februar 2026",
        amountLabel: "4.820 €",
        statusLabel: "Ausgezahlt",
      },
      {
        id: "pool-payout-2",
        periodLabel: "März 2026",
        amountLabel: "5.040 €",
        statusLabel: "In Vorbereitung",
      },
    ],
  };
}