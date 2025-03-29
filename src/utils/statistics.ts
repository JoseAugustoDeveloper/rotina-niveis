export function calculateWeeklyStats(activities: any[]) {
  // Supondo que as atividades tenham uma propriedade "date" para a data de realização
  const stats = activities.reduce((acc: any, activity) => {
    const weekStart = new Date(activity.date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Ajusta para o início da semana (domingo)

    const weekKey = weekStart.toISOString().split('T')[0]; // Formato YYYY-MM-DD

    if (!acc[weekKey]) {
      acc[weekKey] = { completed: 0, points: 0 };
    }

    if (activity.completed) {
      acc[weekKey].completed += 1;
      acc[weekKey].points += activity.points;
    }

    return acc;
  }, {});

  return stats;
}