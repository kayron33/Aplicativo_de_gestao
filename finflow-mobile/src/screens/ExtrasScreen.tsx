import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* =======================
   Helpers
======================= */
function addMonths(base: string, months: number) {
  const [y, m] = base.split("-").map(Number);
  const d = new Date(y, m - 1);
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/* =======================
   Screen
======================= */
export default function ExtrasScreen({ data, setData }: any) {
  const extras = Array.isArray(data.extras) ? data.extras : [];

  function addExtra() {
    const now = new Date();
    const startMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const installments = 5;
    const total = 3000;

    setData({
      ...data,
      extras: [
        ...extras,
        {
          id: Date.now().toString(),
          name: "Entrada extra",
          total,
          installments,
          installmentValue: total / installments,
          startMonth,
          endMonth: addMonths(startMonth, installments - 1),
          receiveDay: 10,
        },
      ],
    });
  }

  function updateExtra(id: string, field: string, value: any) {
    setData({
      ...data,
      extras: extras.map((e: any) => {
        if (e.id !== id) return e;

        const updated = { ...e, [field]: value };

        const total = Number(updated.total) || 0;
        const installments =
          Number(updated.installments) > 0
            ? Number(updated.installments)
            : 1;

        updated.installmentValue = total / installments;
        updated.endMonth = addMonths(
          updated.startMonth,
          installments - 1
        );

        return updated;
      }),
    });
  }

  function removeExtra(id: string) {
    setData({
      ...data,
      extras: extras.filter((e: any) => e.id !== id),
    });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 16 }}
    >
      <Text style={{ color: "#fff", fontSize: 22, marginBottom: 8 }}>
        Entradas Extras
      </Text>

      {extras.map((e: any) => (
        <View
          key={e.id}
          style={{
            backgroundColor: "#111",
            padding: 14,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <TextInput
            value={e.name}
            onChangeText={(t) => updateExtra(e.id, "name", t)}
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "700",
            }}
          />

          <Field
            label="Valor total"
            value={e.total}
            onChange={(v) => updateExtra(e.id, "total", v)}
          />

          <Field
            label="Parcelas"
            value={e.installments}
            onChange={(v) =>
              updateExtra(e.id, "installments", v)
            }
          />

          <Field
            label="Mês de início (YYYY-MM)"
            value={e.startMonth}
            text
            onChange={(v) =>
              updateExtra(e.id, "startMonth", v)
            }
          />

          <Field
            label="Dia do recebimento"
            value={e.receiveDay}
            onChange={(v) =>
              updateExtra(e.id, "receiveDay", v)
            }
          />

          <Text style={{ color: "#22d3ee", marginTop: 6 }}>
            Recebe por mês: R${" "}
            {Number(e.installmentValue).toFixed(2)}
          </Text>

          <Text style={{ color: "#aaa", fontSize: 12 }}>
            Período: {e.startMonth} → {e.endMonth}
          </Text>

          <TouchableOpacity onPress={() => removeExtra(e.id)}>
            <Text style={{ color: "#f87171", marginTop: 8 }}>
              Remover entrada
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={addExtra}
        style={{
          backgroundColor: "#4ade80",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "#000", fontWeight: "700" }}>
          + Nova Entrada Extra
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* =======================
   Campo reutilizável
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
      <Text style={{ color: "#aaa", fontSize: 12 }}>
        {label}
      </Text>
      <TextInput
        keyboardType={text ? "default" : "numeric"}
        value={String(value)}
        onChangeText={(t) =>
          onChange(text ? t : Number(t))
        }
        placeholder={text ? "YYYY-MM" : "0"}
        placeholderTextColor="#555"
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
