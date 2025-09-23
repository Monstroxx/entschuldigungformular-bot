export interface ScheduleEntry {
  hour: string;
  subject: string;
  weekday?: string;
}

export function parseScheduleFormat(csvContent: string): ScheduleEntry[] {
  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];

    // First line: weekdays (mo;di;mi;do;fr)
    const weekdays = lines[0].split(';').map(day => day.trim());

    // Remaining lines: hours
    const scheduleData: ScheduleEntry[] = [];

    for (let lineNum = 1; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      if (!line.trim()) continue;

      const subjects = line.split(';').map(subj => subj.trim());

      // For each hour (1std, 2std, etc.)
      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        if (i < weekdays.length && subject) {
          // Use line number as hour (line 1 = 1. Stunde, line 2 = 2. Stunde, etc.)
          const hourName = `${lineNum}. Stunde`;

          scheduleData.push({
            hour: hourName,
            subject: subject,
            weekday: weekdays[i] || `Tag ${i + 1}`
          });
        }
      }
    }

    return scheduleData;

  } catch (error) {
    console.error('Fehler beim Parsen des Stundenplan-Formats:', error);
    return [];
  }
}
