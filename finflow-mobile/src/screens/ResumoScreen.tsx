import { ScrollView, Text, View, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { getPriorityDebt, isDebtActive } from "../financeEngine";
import { pmt } from "../finance";

const screenWidth = Dimensions.get("window").width;

/* =======================
   Helpers de data
======================= */
function monthKey(date: Date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function parseMonth(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthDiff(from: string, to: string) {
  const [y1, m1] = from.split("-").map(Number);
  const [y2, m2] = to.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1) + 1;
}

/* =======================
   Regras financeiras
======================= */

// Dívida ativa e fora da carência
function isDebtPayingThisMonth(d: any, today = new Date()) {
  if (!isDebtActive(d, today)) return false;

  const start = parseMonth(d.startMonth);
  const grace = Number(d.graceMonths) || 0;

  const payStart = new Date(start);
  payStart.setMonth(payStart.getMonth() + grace);

  return monthKey(today) >= monthKey(payStart);
}

// Extra ativo no mês
function isExtraActiveThisMonth(e: any, today = new Date()) {
  if (!e?.installmentValue) return false; // ✅ campo correto

  const start = parseMonth(e.startMonth);
  const end = parseMonth(e.endMonth);

  return (
    monthKey(today) >= monthKey(start) &&
    monthKey(today) <= monthKey(end)
  );
}


/* =======================
   SCREEN
======================= */
export default function ResumoScreen({ data }: any) {
  const today = new Date();

  /* ===== ENTRADAS ===== */
  const salary = Number(data?.salary) || 0;

  const extrasMonthly = Array.isArray(data?.extras)
  ? data.extras.reduce((sum: number, e: any) => {
      if (!isExtraActiveThisMonth(e, today)) return sum;
      return sum + Number(e.installmentValue || 0); // ✅ campo correto
    }, 0)
  : 0;

  const incomeTotal = salary + extrasMonthly;

  /* ===== META ===== */
  const goalAmount = Number(data?.goalAmount) || 0;
  const goalSaved = Number(data?.goalSaved) || 0;
  const goalRemaining = Math.max(goalAmount - goalSaved, 0);

  const goalMonths =
    Number(data?.goalMonths) > 0 ? Number(data.goalMonths) : 1;

  const goalMonthlySuggested =
    goalAmount > 0 ? goalAmount / goalMonths : 0;

  /* ===== CHEQUE ESPECIAL ===== */
  const overdraftUsed = Number(data?.overdraftUsed) || 0;
  const overdraftRate = Number(data?.overdraftRate) || 0;
  const overdraftDueMonth = data?.overdraftDueMonth;

  const monthsLeft =
    overdraftDueMonth && overdraftUsed > 0
      ? monthDiff(currentMonth(), overdraftDueMonth)
      : 0;

  const overdraftMonthly =
    overdraftUsed > 0 && monthsLeft > 0
      ? pmt(overdraftRate, monthsLeft, overdraftUsed)
      : 0;

  /* ===== DÍVIDAS ===== */
  const debtsMonthly = Array.isArray(data?.debts)
    ? data.debts.reduce((sum: number, d: any) => {
        if (!d?.installment) return sum;
        if (!isDebtPayingThisMonth(d, today)) return sum;
        return sum + Number(d.installment);
      }, 0)
    : 0;

  /* ===== TOTAIS ===== */
  const totalToReserve =
    debtsMonthly + overdraftMonthly + goalMonthlySuggested;

  const sobra = incomeTotal - totalToReserve;

  /* ===== PRIORIDADE ===== */
  const priority = getPriorityDebt(
    (data?.debts || []).filter((d: any) =>
      isDebtPayingThisMonth(d, today)
    )
  );

  /* ===== GRÁFICOS ===== */

  const goalChart = [
    goalSaved > 0 && {
      name: "Já guardado",
      amount: goalSaved,
      color: "#4ade80",
      legendFontColor: "#fff",
      legendFontSize: 12,
    },
    goalRemaining > 0 && {
      name: "Falta",
      amount: goalRemaining,
      color: "#1f2933",
      legendFontColor: "#aaa",
      legendFontSize: 12,
    },
  ].filter(Boolean) as any[];

  const salaryChart = [
    debtsMonthly > 0 && {
      name: "Dívidas",
      amount: debtsMonthly,
      color: "#facc15",
      legendFontColor: "#fff",
      legendFontSize: 12,
    },
    overdraftMonthly > 0 && {
      name: "Cheque",
      amount: overdraftMonthly,
      color: "#f87171",
      legendFontColor: "#fff",
      legendFontSize: 12,
    },
    goalMonthlySuggested > 0 && {
      name: "Meta",
      amount: goalMonthlySuggested,
      color: "#4ade80",
      legendFontColor: "#fff",
      legendFontSize: 12,
    },
    extrasMonthly > 0 && {
      name: "Extras",
      amount: extrasMonthly,
      color: "#22d3ee",
      legendFontColor: "#fff",
      legendFontSize: 12,
    },
    sobra > 0 && {
      name: "Livre",
      amount: sobra,
      color: "#60a5fa",
      legendFontColor: "#fff",
      legendFontSize: 12,
    },
  ].filter(Boolean) as any[];

  /* ===== UI ===== */
  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>
        Resumo do Mês
      </Text>

      {priority && (
        <View
          style={{
            backgroundColor: "#111",
            padding: 16,
            borderRadius: 12,
            marginTop: 16,
            borderLeftWidth: 4,
            borderLeftColor: "#f87171",
          }}
        >
          <Text style={{ color: "#f87171", fontWeight: "700" }}>
            🔴 Prioridade do mês
          </Text>
          <Text style={{ color: "#fff", marginTop: 4 }}>
            {priority.name}
          </Text>
          <Text style={{ color: "#aaa" }}>
            Parcela: R$ {priority.installment.toFixed(2)} — vence em{" "}
            {priority.daysLeft} dia(s)
          </Text>
        </View>
      )}

      <Section title="Progresso da Meta">
        {goalChart.length > 0 ? (
          <PieChart
            data={goalChart}
            width={screenWidth - 32}
            height={200}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="16"
            chartConfig={{ color: () => "#fff" }}
            absolute
          />
        ) : (
          <Text style={{ color: "#aaa", padding: 16 }}>
            Defina uma meta para ver o gráfico.
          </Text>
        )}
      </Section>

      <Section title="Distribuição do Dinheiro (mês)">
        {salaryChart.length > 0 ? (
          <PieChart
            data={salaryChart}
            width={screenWidth - 32}
            height={220}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="16"
            chartConfig={{ color: () => "#fff" }}
            absolute
          />
        ) : (
          <Text style={{ color: "#aaa", padding: 16 }}>
            Preencha os dados para ver o gráfico.
          </Text>
        )}
      </Section>

      <ResumoCard label="Salário" value={salary} color="#4ade80" />
      <ResumoCard label="Extras (mês)" value={extrasMonthly} color="#22d3ee" />
      <ResumoCard label="Entrada total" value={incomeTotal} color="#16a34a" />
      <ResumoCard label="Dívidas" value={debtsMonthly} color="#facc15" />
      <ResumoCard label="Cheque" value={overdraftMonthly} color="#f87171" />
      <ResumoCard label="Meta" value={goalMonthlySuggested} color="#4ade80" />
      <ResumoCard
        label="Total a separar"
        value={totalToReserve}
        color="#fb7185"
        highlight
      />
      <ResumoCard
        label="Sobra estimada"
        value={sobra}
        color={sobra >= 0 ? "#60a5fa" : "#ef4444"}
        highlight
      />
    </ScrollView>
  );
}

/* =======================
   UI Helpers
======================= */
function Section({ title, children }: any) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ color: "#aaa", marginBottom: 6 }}>{title}</Text>
      <View
        style={{
          backgroundColor: "#111",
          borderRadius: 12,
          paddingVertical: 8,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function ResumoCard({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={{
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 12,
        marginTop: 12,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      <Text style={{ color: "#aaa", fontSize: 13 }}>{label}</Text>
      <Text
        style={{
          color: "#fff",
          fontSize: highlight ? 20 : 18,
          fontWeight: highlight ? "700" : "500",
        }}
      >
        R$ {Number(value).toFixed(2)}
      </Text>
    </View>
  );
}
