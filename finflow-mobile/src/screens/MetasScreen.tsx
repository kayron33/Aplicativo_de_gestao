import { Text, TextInput, View } from "react-native";

function addMonths(base: string, months: number) {
  const [y, m] = base.split("-").map(Number);
  const d = new Date(y, m - 1);
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function MetasScreen({ data, setData }: any) {
  const months = Number(data.goalMonths) > 0 ? Number(data.goalMonths) : 1;
  const goalAmount = Number(data.goalAmount) || 0;
  const goalSaved = Number(data.goalSaved) || 0;

  const mensal = goalAmount / months;
  const restante = Math.max(goalAmount - goalSaved, 0);
  const progresso = goalAmount > 0 ? (goalSaved / goalAmount) * 100 : 0;

  function update(field: string, value: any) {
    const updated = { ...data, [field]: value };

    // recalcula fim da meta automaticamente
    if (field === "goalStartMonth" || field === "goalMonths") {
      const start = updated.goalStartMonth;
      const m = Number(updated.goalMonths) || 1;
      updated.goalEndMonth = addMonths(start, m - 1);
    }

    setData(updated);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 22, marginBottom: 8 }}>
        Meta Financeira
      </Text>

      <Field
        label="Valor da meta (R$)"
        value={goalAmount}
        onChange={(v) => update("goalAmount", v)}
      />

      <Field
        label="Meses para alcançar"
        value={months}
        onChange={(v) => update("goalMonths", v)}
      />

      <Field
        label="Mês de início (YYYY-MM)"
        value={data.goalStartMonth}
        text
        onChange={(v) => update("goalStartMonth", v)}
      />

      <Field
        label="Quanto já guardei (R$)"
        value={goalSaved}
        onChange={(v) => update("goalSaved", v)}
      />

      <View
        style={{
          marginTop: 16,
          padding: 14,
          borderRadius: 12,
          backgroundColor: "#111",
        }}
      >
        <Text style={{ color: "#4ade80", fontSize: 16 }}>
          Guardar por mês
        </Text>
        <Text style={{ color: "#fff", fontSize: 20 }}>
          R$ {mensal.toFixed(2)}
        </Text>

        <Text style={{ color: "#aaa", marginTop: 6 }}>
          Progresso: {progresso.toFixed(1)}%
        </Text>

        <Text style={{ color: "#aaa", marginTop: 4 }}>
          Período: {data.goalStartMonth} → {data.goalEndMonth}
        </Text>

        <Text style={{ color: "#aaa", marginTop: 4 }}>
          Falta guardar: R$ {restante.toFixed(2)}
        </Text>
      </View>
    </View>
  );
}

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
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: "#aaa", marginBottom: 2 }}>{label}</Text>
      <TextInput
        keyboardType={text ? "default" : "numeric"}
        value={String(value ?? "")}
        onChangeText={(t) => onChange(text ? t : Number(t))}
        placeholder={text ? "YYYY-MM" : "0"}
        placeholderTextColor="#555"
        style={{
          backgroundColor: "#111",
          padding: 10,
          borderRadius: 8,
          color: "#fff",
        }}
      />
    </View>
  );
}
