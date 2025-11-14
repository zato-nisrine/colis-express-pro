import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { API_URL } from "../../api";

const { width, height } = Dimensions.get("window");

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* IMAGE DU HAUT */}
      <Image
        source={require("../../../assets/images/deliverylog.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* BOX EN BAS (moitié de l’écran) */}
      <View style={styles.box}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Choisissez votre type de profil</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("/screens/Auth/RegisterStep1Screen?role=deliver")}
        >
          <Image source={require("../../../assets/images/lvrimg.png")} style={styles.icon1} />
          <Text style={styles.cardText}>Je suis un livreur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: "#ff002bff" }]}
          onPress={() => router.push("/screens/Auth/RegisterStep1Screen?role=restaurant")}
        >
          <Image source={require("../../../assets/images/restimg.png")} style={styles.icon} />
          <Text style={styles.cardText}>Je suis un restaurant</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/screens/Auth/LoginScreen")}>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#D51B20",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  image: {
    position: "absolute",
    top: height * 0.05,
    width: width * 0.7,
    height: height * 0.3,
    marginTop: 20,
  },
  box: {
    width: "100%",
    height: height * 0.6, // prend la moitié de l’écran
    backgroundColor: "#550707ff",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  title: { fontSize: 36, color: "white", fontWeight: "bold",marginTop:-50 },
  subtitle: { color: "white", fontSize: 16, marginBottom: 30 },
  card: {
    backgroundColor: "#a30909ff",
    borderRadius: 15,
    width: "80%",
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  icon: { width: 80, height: 50 },
  icon1: { width: 100, height: 50,marginRight:0, marginLeft:-50 },
  cardText: { color: "white", fontSize: 18, fontWeight: "600" },
  link: { color: "#fff", marginTop: 20, textDecorationLine: "underline" },
});
