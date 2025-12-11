import Shift from "../database/default/entity/shift";

export function mapShiftResponse(s: Shift) {
  // gunakan helper bawaan entity untuk menghitung datetime full
  const start = s.getStartDateTime();
  const end = s.getEndDateTime();

  return {
    id: s.id,
    name: s.name,
    date: s.date,

    // ini yang frontend butuhkan → ISO datetime
    startTime: start.toISOString(),
    endTime: end.toISOString(),

    isPublished: s.isPublished,
    weekId: s.weekId ?? null,
  };
}
