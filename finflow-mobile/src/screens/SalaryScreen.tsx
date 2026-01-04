import { View, Text, TextInput } from "react-native";

export default function SalaryScreen({ data, setData }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 22, marginBottom: 16 }}>
        Salário
      </Text>

      {/* Valor do salário */}
      <Field
        label="Salário mensal"
        value={data.salary}
        onChange={(v) => setData({ ...data, salary: v })}
      />

      {/* Dia do pagamento */}
      <Field
        label="Dia do pagamento"
        value={data.payday}
        onChange={(v) => setData({ ...data, payday: v })}
      />

      <Text style={{ color: "#4ade80", marginTop: 12 }}>
        Esse valor será usado no resumo mensal.
      </Text>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: number) => void;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={{ color: "#aaa", marginBottom: 4 }}>{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={String(value)}
        onChangeText={(t) => onChange(Number(t))}
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
