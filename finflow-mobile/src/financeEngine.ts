function monthKey(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function parseMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function isDebtActive(d: any, today = new Date()) {
  if (!d.startMonth || !d.endMonth) return false;

  const current = monthKey(today);
  const start = monthKey(parseMonth(d.startMonth));
  const end = monthKey(parseMonth(d.endMonth));

  return current >= start && current <= end;
}

export function daysUntilDue(d: any, today = new Date()) {
  const dueDay = Number(d.dueDay);
  if (!dueDay) return 999;

  const currentDay = today.getDate();

  if (dueDay >= currentDay) return dueDay - currentDay;
  return 30 - currentDay + dueDay; // mês médio
}

export function getPriorityDebt(debts: any[]) {
  const today = new Date();

  return debts
    .filter((d) => isDebtActive(d, today))
    .map((d) => ({
      ...d,
      daysLeft: daysUntilDue(d, today),
    }))
    .sort((a, b) => {
      if (a.daysLeft !== b.daysLeft) return a.daysLeft - b.daysLeft;
      if (a.installment !== b.installment)
        return b.installment - a.installment;
      return a.months - b.months;
    })[0];
}
