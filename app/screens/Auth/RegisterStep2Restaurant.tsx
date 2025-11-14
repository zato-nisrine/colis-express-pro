import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import * as Location from "expo-location";
import axios from "axios";
import { API_URL } from "../../api";

const GOOGLE_MAPS_API_KEY = "AIzaSyAtNqQvTH1JLaH1-OKqCpzgzd-yZdv_o4o"
const { width } = Dimensions.get("window");

const RestaurantSchema = Yup.object().shape({
  name: Yup.string().required("Nom du restaurant obligatoire"),
  address: Yup.string().required("Adresse obligatoire"),
  latitude: Yup.string().required("Latitude obligatoire"),
  longitude: Yup.string().required("Longitude obligatoire"),
  phone: Yup.string().required("Téléphone obligatoire"),
});

export default function RegisterStep2Restaurant() {
  const router = useRouter();
  const params = useLocalSearchParams(); // step1 data

  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async (setFieldValue: any) => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission de localisation refusée.");
      setLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const address = response.data.results[0]?.formatted_address || "Adresse non trouvée";

      setFieldValue("latitude", String(latitude));
      setFieldValue("longitude", String(longitude));
      setFieldValue("address", address);
    } catch (error) {
      alert("Impossible de récupérer l'adresse depuis Google Maps.");
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Étape 2 - Infos du restaurant 🍽️</Text>
      <Text style={styles.subtitle}>Localise ton restaurant facilement</Text>

      <Formik
        initialValues={{ name: "", address: "", latitude: "", longitude: "", phone: "" }}
        validationSchema={RestaurantSchema}
        onSubmit={async (values) => {
          const data = { ...params, ...values, role: "restaurant" };

          console.log("DATA ENVOYE BACK:", data);

          try {
            await axios.post(`${API_URL}auth/register/restaurant`, data);
            alert("Compte restaurant créé ✅");
            router.push("/screens/Auth/LoginScreen");
          } catch (error: any) {
            console.log("REGISTER RESTAURANT ERR:", error);
            alert("Erreur serveur, réessaye");
          }
        }}

      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
          <>
            <TextInput
              placeholder="Nom du restaurant"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.name}
              onChangeText={handleChange("name")}
            />
            {touched.name && errors.name && <Text style={styles.error}>{errors.name}</Text>}

            <TextInput
              placeholder="Téléphone"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.phone}
              onChangeText={handleChange("phone")}
              keyboardType="phone-pad"
            />
            {touched.phone && errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

            <TextInput
              placeholder="Adresse"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.address}
              onChangeText={handleChange("address")}
            />
            {touched.address && errors.address && <Text style={styles.error}>{errors.address}</Text>}

            <TextInput
              placeholder="Latitude"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.latitude}
              onChangeText={handleChange("latitude")}
            />
            {touched.latitude && errors.latitude && <Text style={styles.error}>{errors.latitude}</Text>}

            <TextInput
              placeholder="Longitude"
              placeholderTextColor="#000000ff"
              style={styles.input}
              value={values.longitude}
              onChangeText={handleChange("longitude")}
            />
            {touched.longitude && errors.longitude && <Text style={styles.error}>{errors.longitude}</Text>}

            <TouchableOpacity
              style={styles.geoButton}
              onPress={() => getCurrentLocation(setFieldValue)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.geoButtonText}>📍 Utiliser ma localisation actuelle</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Créer mon compte</Text>
            </TouchableOpacity>

          </>
        )}
      </Formik>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: "#fff", padding: 20, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#D51B20", marginTop: 40 },
  subtitle: { color: "#444", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: width * 0.9,
    padding: 12,
    marginVertical: 6,
  },
  geoButton: {
    backgroundColor: "#D51B20",
    paddingVertical: 12,
    borderRadius: 10,
    width: width * 0.9,
    marginTop: 10,
  },
  geoButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  button: {
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    width: width * 0.9,
    marginTop: 20,
  },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  error: { color: "red", fontSize: 12, alignSelf: "flex-start", marginLeft: width * 0.05 },
});
