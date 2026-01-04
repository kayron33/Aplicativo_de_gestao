import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_KEY = "finflow:data:v2";

export async function save(data: any) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function load() {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}
