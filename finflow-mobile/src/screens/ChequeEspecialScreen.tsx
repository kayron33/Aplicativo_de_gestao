import { View, Text, TextInput } from "react-native";
import { pmt } from "../finance";

function monthDiff(from: string, to: string) {
  const [y1, m1] = from.split("-").map(Number);
  const [y2, m2] = to.split("-").map(Number);
  return (y2 - y1) * 12 + (m2 - m1) + 1;
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function ChequeEspecialScreen({ data, setData }: any) {
  const overdraftUsed = Number(data.overdraftUsed) || 0;
  const overdraftRate = Number(data.overdraftRate) || 0;
  const dueMonth = data.overdraftDueMonth;

  const monthsLeft =
    dueMonth ? monthDiff(currentMonth(), dueMonth) : 0;

  const mensal =
    overdraftUsed > 0 && monthsLeft > 0
      ? pmt(overdraftRate, monthsLeft, overdraftUsed)
      : 0;

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 22, marginBottom: 8 }}>
        Cheque Especial
      </Text>

      <Field
        label="Valor usado (R$)"
        value={overdraftUsed}
        onChange={(v) =>
          setData({ ...data, overdraftUsed: v })
        }
      />

      <Field
        label="Juros mensal (%)"
        value={overdraftRate * 100}
        onChange={(v) =>
          setData({ ...data, overdraftRate: v / 100 })
        }
      />

      <Field
        label="Mês limite para zerar (YYYY-MM)"
        value={dueMonth}
        text
        onChange={(v) =>
          setData({ ...data, overdraftDueMonth: v })
        }
      />

      {monthsLeft <= 0 && overdraftUsed > 0 && (
        <Text style={{ color: "#ef4444", marginTop: 12 }}>
          ⚠️ Prazo inválido ou já vencido
        </Text>
      )}

      {monthsLeft > 0 && overdraftUsed > 0 && (
        <View
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 12,
            backgroundColor: "#111",
          }}
        >
          <Text style={{ color: "#f87171", fontWeight: "700" }}>
            Prioridade máxima
          </Text>

          <Text style={{ color: "#fff", fontSize: 18, marginTop: 4 }}>
            Separar por mês:
          </Text>

          <Text
            style={{
              color: "#f87171",
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            R$ {mensal.toFixed(2)}
          </Text>

          <Text style={{ color: "#aaa", marginTop: 6 }}>
            Prazo: {monthsLeft} mês(es)
          </Text>
        </View>
      )}
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
    <View style={{ marginTop: 12 }}>
      <Text style={{ color: "#aaa" }}>{label}</Text>
      <TextInput
        keyboardType={text ? "default" : "numeric"}
        value={String(value ?? "")}
        onChangeText={(t) => onChange(text ? t : Number(t))}
        placeholder={text ? "YYYY-MM" : "0"}
        placeholderTextColor="#555"
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: 10,
          borderRadius: 8,
        }}
      />
    </View>
  );
}
