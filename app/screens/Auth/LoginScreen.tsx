import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import * as Yup from "yup";
import { loginSuccess } from "../../store/authSlice";
import { RootState } from "../../store/store";
import { API_URL } from "../../api";
import KeyboardAwareScreen from "@/app/components/KeyboardAwareScreen";

const { width, height } = Dimensions.get("window");

// ✅ Validation avec Yup
const LoginSchema = Yup.object().shape({
  telephone: Yup.string()
    .matches(/^[0-9]+$/, "Le téléphone doit contenir uniquement des chiffres")
    .min(8, "Numéro trop court")
    .required("Téléphone obligatoire"),
  password: Yup.string()
    .min(4, "4 caractères minimum")
    .required("Mot de passe obligatoire"),
});

const loginUser = async (telephone: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ phone: telephone, password }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Erreur serveur");
    }

    const data = await response.json();
    return data; // ex: { user, accessToken }
  } catch (err: any) {
    throw new Error(err.message || "Impossible de se connecter");
  }
};

export default function LoginScreen() {
  const router = useRouter();
  const [stay, setStay] = useState(false);
  const dispatch = useDispatch();

  const { token, user } = useSelector((state: RootState) => state.authReducer);
  console.log("État auth actuel :", { token, user });

  const handleLogin = async (values: { telephone: string; password: string }) => {
    try {
      const result = await loginUser(values.telephone, values.password);
      const { user, accessToken } = result;

      dispatch(loginSuccess({ user, token: accessToken }));

      // ✅ Redirection selon le rôle
      const role = user.role?.name || "";
      if (role === "RESTAURANT") {
        router.replace("/screens/Home/RestaurantHomeScreen/RestaurantHomeScreen");
      } else if (role === "DELIVER") {
        router.replace("/screens/Home/DeliveryHomeScreen/DeliveryHomeScreen");
      } else {
        router.replace("../(tabs)/index");
      }
    } catch (err: any) {
      alert("Erreur de connexion : " + err.message);
    }
  };

  return (
    <KeyboardAwareScreen scrollable>
    <View style={styles.container}>
      {/* Image logo */}
      <Image
        source={require("../../../assets/images/deliverylog.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Zone de connexion */}
      <View style={styles.box}>
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>Veuillez vous connecter</Text>

        <Formik
          initialValues={{ telephone: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={(values) => handleLogin(values)}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              {/* Téléphone */}
              <View style={styles.inputRow}>
                <Ionicons name="call" size={20} color="#fff" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Téléphone"
                  placeholderTextColor="#999"
                  onChangeText={handleChange("telephone")}
                  onBlur={handleBlur("telephone")}
                  value={values.telephone}
                  keyboardType="phone-pad"
                />
              </View>
              {touched.telephone && errors.telephone && (
                <Text style={styles.error}>{errors.telephone}</Text>
              )}

              {/* Mot de passe */}
              <View style={styles.inputRow}>
                <MaterialIcons name="lock" size={20} color="#fff" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Mot de passe"
                  placeholderTextColor="#999"
                  secureTextEntry
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                />
              </View>
              {touched.password && errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              {/* Options */}
              <View style={styles.rowBetween}>
                <TouchableOpacity style={styles.rowCenter} onPress={() => setStay(!stay)}>
                  <Ionicons
                    name={stay ? "checkbox" : "square-outline"}
                    size={20}
                    color="#000"
                  />
                  <Text style={styles.smallText}> Rester connecté</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                  <Text style={[styles.smallText, { color: "#D51B20" }]}>
                    Mot de passe oublié
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bouton Connexion */}
              <TouchableOpacity style={styles.button} onPress={handleSubmit as any}>
                <Text style={styles.buttonText}>Connexion</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>

        <TouchableOpacity onPress={() => router.push("/screens/Auth/RegisterScreen")}>
          <Text style={styles.link}>
            Je n’ai pas de compte ? <Text style={{ fontWeight: "bold" }}>S’inscrire</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logo texte en bas */}
      <View style={styles.logoText}>
        <Text style={[styles.logoTitle, { fontFamily: "Inika-Bold" }]}>Colis</Text>
        <Text style={[styles.logoSub, { fontFamily: "Italianno-Regular" }]}>Express</Text>
      </View>
    </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#D51B20", alignItems: "center" },
  image: { width: width * 0.7, height: height * 0.35, marginTop: 70 },
  box: {
    position: "absolute",
    bottom: 0,
    height: "55%",
    width: "100%",
    backgroundColor: "#eee",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 25,
  },
  title: { fontSize: 38, fontWeight: "bold", marginBottom: 4, marginTop: 40 },
  subtitle: { fontSize: 15, color: "#555", marginBottom: 20 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 20,
    width: "100%",
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  icon: { marginRight: 6 },
  input: { flex: 1, color: "#fff", height: 45 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  smallText: { fontSize: 13, color: "#000" },
  button: {
    backgroundColor: "#000",
    width: "50%",
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  link: { color: "#333", fontSize: 14, marginTop: 10 },
  error: { color: "red", fontSize: 12, alignSelf: "flex-start", marginBottom: 10 },
  logoText: {bottom: 10, alignItems: "center" },
  logoTitle: { fontSize: 49, fontWeight: "bold", color: "#000" },
  logoSub: { fontSize: 48, fontStyle: "italic", marginTop: -20, color: "#000" },
});
