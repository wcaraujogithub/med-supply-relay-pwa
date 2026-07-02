// export type MatchPriority = 'Low' | 'Medium' | 'High' | 'Critical' | string;

// export interface MatchResultDto {
//   demandId: string;
//   demandClientOperationId: string;
//   demandReliefLocationId: string;
//   demandLocationName?: string | null;
//   demandLocationArea?: string | null;

//   medicineName: string;
//   medicineCode?: string | null;
//   unit: string;
//   priority: MatchPriority;
//   demandQuantity: number;

//   supplyId: string;
//   supplyClientOperationId: string;
//   supplyReliefLocationId: string;
//   supplyLocationName?: string | null;
//   supplyLocationArea?: string | null;
//   supplyQuantity: number;
//   supplyExpiresOn?: string | null;

//   suggestedQuantity: number;
//   distanceKm?: number | null;

//   viabilityScore?: number;
//   recommended?: boolean;
//   recommendationReasons?: string[];
// }

// export type MatchesApiResponse =
//   | MatchResultDto[]
//   | {
//       total: number;
//       generatedAtUtc: string;
//       items: MatchResultDto[];
//     };

// export interface MatchFilters {
//   medicineName?: string;
//   area?: string;
//   criticalOnly?: boolean;
//   limit?: number;
// }


export type MatchPriority = 'Low' | 'Medium' | 'High' | 'Critical' | string;

export interface MatchResultDto {
  demandId: string;
  demandClientOperationId: string;
  demandReliefLocationId: string;
  demandLocationName?: string | null;
  demandLocationArea?: string | null;

  medicineName: string;
  medicineCode?: string | null;
  unit: string;
  priority: MatchPriority;
  demandQuantity: number;

  supplyId: string;
  supplyClientOperationId: string;
  supplyReliefLocationId: string;
  supplyLocationName?: string | null;
  supplyLocationArea?: string | null;

  supplyQuantity: number;
  supplyTotalQuantity?: number;
  supplyReservedQuantity?: number;
  supplyAvailableQuantity?: number;
  supplyExpiresOn?: string | null;

  suggestedQuantity: number;
  distanceKm?: number | null;

  viabilityScore?: number;
  recommended?: boolean;
  recommendationReasons?: string[];
}

export type MatchesApiResponse =
  | MatchResultDto[]
  | {
      total: number;
      generatedAtUtc: string;
      items: MatchResultDto[];
    };

export interface MatchFilters {
  medicineName?: string;
  area?: string;
  criticalOnly?: boolean;
  limit?: number;
}