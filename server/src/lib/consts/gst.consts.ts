import { TaxRateType } from "../types/index";

export const gstRates: Record<TaxRateType, number> = {
    [TaxRateType.GST_5]: 0.05,
    [TaxRateType.GST_12]: 0.12,
    [TaxRateType.GST_18]: 0.18,
    [TaxRateType.GST_28]: 0.28,
};
