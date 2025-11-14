import { Redirect, useRouter } from "expo-router";
import React from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "./store/store"; // ✅ corrige le chemin

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const {token, user} = useSelector((state: RootState) => state.authReducer);
  console.log("WelcomeScreen - token:", user);
  // Si l’utilisateur est déjà connecté, on le redirige vers son tableau de bord
  if (token && user?.role?.label === "Restaurant") {
    return <Redirect href="/screens/Home/RestaurantHomeScreen/RestaurantHomeScreen" />;
  } else if (token && user?.role?.label === "Deliver") {
    return <Redirect href="/screens/Home/DeliveryHomeScreen/DeliveryHomeScreen" />;
  } else {
    <Redirect href="/screens/Auth/LoginScreen"/>
  }

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/deliverylog.png")} // ✅ vérifie que cette image existe
        style={styles.image}
        resizeMode="contain"
      />

      <Text style={[styles.title, { fontFamily: "Inika-Bold" }]}>Colis</Text>
      <Text style={[styles.subtitle, { fontFamily: "Italianno-Regular" }]}>Express</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/screens/Auth/LoginScreen")}
      >
        <Text style={styles.buttonText}>Se Connecter</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#000" }]}
        onPress={() => router.push("/screens/Auth/RegisterScreen")}
      >
        <Text style={[styles.buttonText, { color: "white" }]}>S’inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D51B20",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  image: {
    width: width * 0.7,
    height: height * 0.35,
    marginBottom: 20,
  },
  title: {
    fontSize: 49,
    fontWeight: "bold",
    color: "black",
  },
  subtitle: {
    fontSize: 48,
    fontStyle: "italic",
    color: "black",
    marginBottom: 30,
    marginTop: -20,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 20,
    borderRadius: 10,
    marginVertical: 8,
    width: width * 0.9,
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 18,
    fontWeight: "600",
  },
});
