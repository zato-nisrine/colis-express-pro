import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";

const { width } = Dimensions.get("window");

const Step1Schema = Yup.object().shape({
  firstName: Yup.string().required("Prénom obligatoire"),
  lastName: Yup.string().required("Nom obligatoire"),
  email: Yup.string().email("Email invalide").required("Email obligatoire"),
  phone: Yup.string().required("Téléphone obligatoire"),
  password: Yup.string()
    .min(4, "4 caractères min")
    .required("Mot de passe obligatoire"),
});

export default function RegisterStep1Screen() {
  const router = useRouter();
  const { role } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Étape 1 - Infos de base</Text>
      <Text style={styles.subtitle}>
        Rôle : {role === "deliver" ? "Livreur 🚴" : "Restaurant 👨‍🍳"}
      </Text>

      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
        }}
        validationSchema={Step1Schema}
        onSubmit={(values) => {
          router.push({
            pathname:
              role === "deliver"
                ? "/screens/Auth/RegisterStep2Delivery"
                : "/screens/Auth/RegisterStep2Restaurant",
            params: { role, ...values },
          });
        }}
      >
        {({ handleChange, handleSubmit, values, errors, touched }) => (
          <>
            <TextInput
              placeholder="Prénom"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.firstName}
              onChangeText={handleChange("firstName")}
            />
            {touched.firstName && errors.firstName && (
              <Text style={styles.error}>{errors.firstName}</Text>
            )}

            <TextInput
              placeholder="Nom"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.lastName}
              onChangeText={handleChange("lastName")}
            />
            {touched.lastName && errors.lastName && (
              <Text style={styles.error}>{errors.lastName}</Text>
            )}

            <TextInput
              placeholder="Email"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.email}
              onChangeText={handleChange("email")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            <TextInput
              placeholder="Téléphone"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.phone}
              onChangeText={handleChange("phone")}
              keyboardType="phone-pad"
            />
            {touched.phone && errors.phone && (
              <Text style={styles.error}>{errors.phone}</Text>
            )}

            <TextInput
              placeholder="Mot de passe"
              placeholderTextColor="#000000ff"
              secureTextEntry
              style={styles.input}
              value={values.password}
              onChangeText={handleChange("password")}
            />
            {touched.password && errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleSubmit as any}>
              <Text style={styles.buttonText}>Continuer</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#D51B20" },
  subtitle: { color: "#444", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 10,
    width: width * 0.9,
    padding: 12,
    marginVertical: 6,
  },
  button: {
    backgroundColor: "#D51B20",
    paddingVertical: 15,
    borderRadius: 10,
    width: width * 0.9,
    marginTop: 15,
  },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  error: {
    color: "red",
    fontSize: 12,
    alignSelf: "flex-start",
    marginLeft: width * 0.05,
  },
});
