// Nombres de los tipos de cargo que carga el script (ver ERS, RF 2.2).
// Se comparan sin mayúsculas ni acentos.
export const POSITION_TYPE_NAMES = {
  FIXED_TERM: 'a termino',
  SUBSTITUTE: 'suplente',
} as const;

export const DEFAULT_EXPIRING_DAYS = 30;

export const RELATIONS = {
  teacher: true,
  positionType: true,
  replacedAssignment: { teacher: true },
  courseSectionSubject: {
    subject: true,
    courseSection: { studyPlanAcademicCycle: { academicCycle: true } },
  },
};
