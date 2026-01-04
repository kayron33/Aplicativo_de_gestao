import { useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";

function monthKey(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function parseMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export default function CalendarioScreen({ data }: any) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 🔹 MARCA OS DIAS COM DÍVIDA (respeitando início e fim)
  const calendarData = useMemo(() => {
    const marks: any = {};

    data.debts.forEach((d: any) => {
      if (!d.startMonth || !d.endMonth || !d.dueDay) return;

      const start = parseMonth(d.startMonth);
      const end = parseMonth(d.endMonth);

      let current = new Date(start);

      while (monthKey(current) <= monthKey(end)) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(d.dueDay).padStart(2, "0");

        const dateKey = `${year}-${month}-${day}`;

        if (!marks[dateKey]) {
          marks[dateKey] = { dots: [] };
        }

        marks[dateKey].dots.push({
          key: d.id,
          color: "#f87171",
        });

        current.setMonth(current.getMonth() + 1);
      }
    });

    return marks;
  }, [data.debts]);

  // 🔹 DÍVIDAS DO DIA SELECIONADO (COM LIMITE REAL)
  const debtsForDay = useMemo(() => {
  if (!selectedDate) return [];

  const [sy, sm, sd] = selectedDate.split("-").map(Number);
  const selectedMonthKey = sy * 12 + (sm - 1);

  return data.debts.filter((d: any) => {
    if (!d.startMonth || !d.endMonth || !d.dueDay) return false;

    const start = parseMonth(d.startMonth);
    const end = parseMonth(d.endMonth);

    const inRange =
      selectedMonthKey >= monthKey(start) &&
      selectedMonthKey <= monthKey(end);

    return inRange && sd === Number(d.dueDay);
  });
}, [selectedDate, data.debts]);


  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <Calendar
        markingType="multi-dot"
        markedDates={{
          ...calendarData,
          ...(selectedDate
            ? {
                [selectedDate]: {
                  ...(calendarData[selectedDate] || {}),
                  selected: true,
                  selectedColor: "#4ade80",
                },
              }
            : {}),
        }}
        theme={{
          backgroundColor: "#0a0a0a",
          calendarBackground: "#0a0a0a",
          dayTextColor: "#fff",
          monthTextColor: "#fff",
          arrowColor: "#4ade80",
          todayTextColor: "#4ade80",
        }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />

      <View style={{ padding: 16 }}>
        <Text style={{ color: "#fff", fontSize: 18, marginBottom: 8 }}>
          {selectedDate
            ? `Vencimentos em ${selectedDate}`
            : "Selecione um dia"}
        </Text>

        {debtsForDay.length === 0 && (
          <Text style={{ color: "#aaa" }}>
            Nenhuma dívida neste dia.
          </Text>
        )}

        {debtsForDay.map((d: any) => (
          <View
            key={d.id}
            style={{
              backgroundColor: "#111",
              padding: 12,
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              {d.name}
            </Text>
            <Text style={{ color: "#f87171" }}>
              Parcela: R$ {Number(d.installment).toFixed(2)}
            </Text>
            <Text style={{ color: "#aaa", fontSize: 12 }}>
              Ativa de {d.startMonth} até {d.endMonth}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
