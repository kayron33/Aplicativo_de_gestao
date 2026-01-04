import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

/* =======================
   Helpers de data
======================= */
function addMonths(base: string, months: number) {
  const [y, m] = base.split("-").map(Number);
  const d = new Date(y, m - 1);
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function todayDay() {
  return new Date().getDate();
}

/* =======================
   Screen
======================= */
export default function DividasScreen({ data, setData }: any) {
  /* ===== ADD ===== */
  function addDebt() {
    const now = new Date();
    const startMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const months = 6;
    const graceMonths = 0;

    const endMonth = addMonths(startMonth, graceMonths + months - 1);

    setData({
      ...data,
      debts: [
        ...data.debts,
        {
          id: Date.now().toString(),
          name: "Nova dívida",
          installment: 300,
          months,
          graceMonths,
          paidMonths: 0,
          lastPaidMonth: null,
          finished: false,
          dueDay: 10,
          startMonth,
          endMonth,
        },
      ],
    });
  }

  /* ===== UPDATE ===== */
  function updateDebt(id: string, field: string, value: any) {
    setData({
      ...data,
      debts: data.debts.map((d: any) => {
        if (d.id !== id) return d;

        const updated = { ...d, [field]: value };

        const totalMonths =
          Number(updated.graceMonths || 0) +
          Number(updated.months || 1) -
          1;

        updated.endMonth = addMonths(updated.startMonth, totalMonths);

        return updated;
      }),
    });
  }

  /* ===== PAGAR PARCELA ===== */
  function payInstallment(id: string) {
    const thisMonth = currentMonthKey();

    setData({
      ...data,
      debts: data.debts.map((d: any) => {
        if (d.id !== id || d.finished) return d;

        // 🔒 trava: já pago neste mês
        if (d.lastPaidMonth === thisMonth) return d;

        const paid = d.paidMonths + 1;
        const finished = paid >= d.months;

        Alert.alert(
          "✅ Parcela paga",
          `A parcela de "${d.name}" deste mês foi marcada como paga.`
        );

        if (finished) {
          Alert.alert(
            "🎉 Dívida quitada!",
            `Parabéns! Você finalizou "${d.name}".`
          );
        }

        return {
          ...d,
          paidMonths: paid,
          lastPaidMonth: thisMonth,
          finished,
        };
      }),
    });
  }

  /* ===== REMOVE ===== */
  function removeDebt(id: string) {
    setData({
      ...data,
      debts: data.debts.filter((d: any) => d.id !== id),
    });
  }

  /* =======================
     UI
  ======================= */
  const today = todayDay();
  const thisMonth = currentMonthKey();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 22, marginBottom: 8 }}>
        Dívidas
      </Text>

      {data.debts.map((d: any) => {
        const total = d.installment * d.months;
        const progress = `${d.paidMonths}/${d.months}`;

        const isDueToday = today === Number(d.dueDay);
        const alreadyPaidThisMonth = d.lastPaidMonth === thisMonth;

        return (
          <View
            key={d.id}
            style={{
              backgroundColor: "#111",
              padding: 14,
              borderRadius: 12,
              marginBottom: 12,
              borderLeftWidth: d.finished ? 4 : 0,
              borderLeftColor: d.finished ? "#4ade80" : "transparent",
            }}
          >
            <TextInput
              value={d.name}
              onChangeText={(t) => updateDebt(d.id, "name", t)}
              style={{
                color: "#fff",
                fontSize: 16,
                fontWeight: "700",
              }}
            />

            <Field
              label="Valor da parcela"
              value={d.installment}
              onChange={(v) => updateDebt(d.id, "installment", v)}
            />

            <Field
              label="Quantidade de parcelas"
              value={d.months}
              onChange={(v) => updateDebt(d.id, "months", v)}
            />

            <Field
              label="Dia do vencimento"
              value={d.dueDay}
              onChange={(v) => updateDebt(d.id, "dueDay", v)}
            />

            <Field
              label="Mês de início (YYYY-MM)"
              value={d.startMonth}
              text
              onChange={(v) => updateDebt(d.id, "startMonth", v)}
            />

            <Field
              label="Carência (meses)"
              value={d.graceMonths}
              onChange={(v) => updateDebt(d.id, "graceMonths", v)}
            />

            <Text style={{ color: "#4ade80", marginTop: 6 }}>
              Total: R$ {total.toFixed(2)}
            </Text>

            <Text style={{ color: "#aaa", fontSize: 12 }}>
              Parcelas pagas: {progress}
            </Text>

            <Text style={{ color: "#aaa", fontSize: 12 }}>
              Ativa de {d.startMonth} até {d.endMonth}
            </Text>

            {/* 🔘 BOTÃO DE PAGAMENTO (ANTES OU NO DIA) */}
            {!d.finished && !alreadyPaidThisMonth && (
              <TouchableOpacity
                onPress={() => payInstallment(d.id)}
                style={{
                  backgroundColor: "#4ade80",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#000", fontWeight: "700" }}>
                  {isDueToday
                    ? "Pagou essa dívida?"
                    : "Pagou a dívida adiantada?"}
                </Text>
              </TouchableOpacity>
            )}

            {alreadyPaidThisMonth && (
              <Text style={{ color: "#4ade80", marginTop: 8 }}>
                ✅ Parcela deste mês já paga
              </Text>
            )}

            {d.finished && (
              <Text style={{ color: "#4ade80", marginTop: 8 }}>
                🎉 Dívida finalizada
              </Text>
            )}

            <TouchableOpacity onPress={() => removeDebt(d.id)}>
              <Text style={{ color: "#f87171", marginTop: 8 }}>
                Remover dívida
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity
        onPress={addDebt}
        style={{
          backgroundColor: "#4ade80",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 12,
        }}
      >
        <Text style={{ color: "#000", fontWeight: "700" }}>
          + Nova Dívida
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* =======================
   Field
======================= */
function Field({
  label,
  value,
  onChange,
  text,
}: {
  label: string;
  value: any;
  onChange: (v: any) => void;
  text?: boolean;
}) {
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={{ color: "#aaa", fontSize: 12 }}>{label}</Text>
      <TextInput
        keyboardType={text ? "default" : "numeric"}
        value={String(value)}
        onChangeText={(t) => onChange(text ? t : Number(t))}
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: 8,
          borderRadius: 8,
        }}
      />
    </View>
  );
}