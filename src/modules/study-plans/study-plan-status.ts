
export const STUDY_PLAN_STATUS = {
  VIGENTE: 'VIGENTE',
  NO_VIGENTE: 'NO_VIGENTE',
  ARCHIVADO: 'ARCHIVADO',
} as const;

export const STUDY_PLAN_STATUS_VALUES: string[] = Object.values(STUDY_PLAN_STATUS);