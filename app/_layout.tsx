import * as Font from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store/store"; // ✅ chemin correct

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "Inika-Bold": require("../assets/fonts/Inika/Inika-Bold.ttf"),
        "Italianno-Regular": require("../assets/fonts/Italianno/Italianno-Regular.ttf"),
      });
      setFontsLoaded(true);
    };

    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#d4a017" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Stack
          initialRouteName="index"
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* Page d'accueil (Welcome) */}
          <Stack.Screen name="index" />

          {/* Authentification */}
          <Stack.Screen name="screens/Auth/LoginScreen" />
          <Stack.Screen name="screens/Auth/RegisterScreen" />
          <Stack.Screen name="screens/Auth/RegisterStep1Screen" />
          <Stack.Screen name="screens/Auth/RegisterStep2Delivery" />
          <Stack.Screen name="screens/Auth/RegisterStep2Restaurant" />

          {/* Pages principales */}
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="screens/Home/DeliveryHomeScreen/DeliveryHomeScreen" />
          <Stack.Screen name="screens/Home/DeliveryHomeScreen/CourseDetail" />
          <Stack.Screen name="screens/Home/DeliveryHomeScreen/CurrentCourses" />
          <Stack.Screen name="screens/Home/RestaurantHomeScreen/RestaurantHomeScreen" />
        </Stack>
      </PersistGate>
    </Provider>
  );
}
