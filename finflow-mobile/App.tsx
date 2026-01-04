import { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// 🔴 ESSENCIAL para estabilidade no Android
import { enableScreens } from "react-native-screens";
enableScreens(true);

// Storage + Notifications
import { load, save } from "./src/storage";
import { requestNotificationPermission } from "./src/notifications";

// Screens
import ResumoScreen from "./src/screens/ResumoScreen";
import CalendarioScreen from "./src/screens/CalendarioScreen";
import ChequeEspecialScreen from "./src/screens/ChequeEspecialScreen";
import DividasScreen from "./src/screens/DividasScreen";
import MetasScreen from "./src/screens/MetasScreen";
import ExtrasScreen from "./src/screens/ExtrasScreen";
import SalaryScreen from "./src/screens/SalaryScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  const [data, setData] = useState({
    // 💼 Salário
    salary: 3500,
    payday: 5,

    // 🎯 Meta financeira
    goalAmount: 10000,
    goalMonths: 4,
    goalSaved: 0,
    goalStartMonth: "2026-01",
    goalEndMonth: "2026-04",

    // 💳 Cheque especial
    overdraftUsed: 0,
    overdraftRate: 0.12,
    overdraftDueMonth: "",

    // 📉 Dívidas
    debts: [],

    // 📈 Entradas extras
    extras: [],
  });

  // 🔔 Permissão de notificação (uma vez)
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // 🔹 Carregar dados salvos
  useEffect(() => {
    load().then((d) => {
      if (d) {
        setData((prev) => ({
          ...prev,
          ...d,
          debts: d.debts || [],
          extras: d.extras || [],
        }));
      }
    });
  }, []);

  // 🔹 Salvar automaticamente
  useEffect(() => {
    save(data);
  }, [data]);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: "#0a0a0a" },
          headerTintColor: "#ffffff",

          tabBarStyle: {
            backgroundColor: "#0a0a0a",
            borderTopColor: "#111",
          },

          tabBarActiveTintColor: "#4ade80",
          tabBarInactiveTintColor: "#888",

          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Resumo: "stats-chart",
              Calendário: "calendar",
              Salário: "cash-outline",
              Cheque: "card",
              Dívidas: "list",
              Metas: "trophy",
              Extras: "cash",
            };

            return (
              <Ionicons
                name={icons[route.name] ?? "help-circle"}
                size={size}
                color={color}
              />
            );
          },
        })}
      >
        <Tab.Screen name="Resumo">
          {() => <ResumoScreen data={data} />}
        </Tab.Screen>

        <Tab.Screen name="Calendário">
          {() => <CalendarioScreen data={data} />}
        </Tab.Screen>

        <Tab.Screen name="Salário">
          {() => <SalaryScreen data={data} setData={setData} />}
        </Tab.Screen>

        <Tab.Screen name="Cheque">
          {() => (
            <ChequeEspecialScreen data={data} setData={setData} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Dívidas">
          {() => <DividasScreen data={data} setData={setData} />}
        </Tab.Screen>

        <Tab.Screen name="Metas">
          {() => <MetasScreen data={data} setData={setData} />}
        </Tab.Screen>

        <Tab.Screen name="Extras">
          {() => <ExtrasScreen data={data} setData={setData} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
