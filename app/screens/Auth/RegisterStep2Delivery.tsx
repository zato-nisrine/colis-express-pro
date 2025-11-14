import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../api";

const { width } = Dimensions.get("window");

// Schéma Yup
const DeliverySchema = Yup.object().shape({
  anginType: Yup.string().required("Type de véhicule obligatoire"),
  anginNumber: Yup.string().required("Numéro du véhicule obligatoire"),
  licenseImage: Yup.string().when("anginType", {
    is: (val: string) => val !== "Moto" && val !== "Tricycle",
    then: () => Yup.string().required("Permis obligatoire"),
    otherwise: () => Yup.string().notRequired(),
  }),
});

export default function RegisterStep2Delivery() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [licenseImage, setLicenseImage] = useState<string | null>(null);
  const [vehicleImage, setVehicleImage] = useState<string | null>(null);
  const [cipImage, setCipImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [vehicleValue, setVehicleValue] = useState<string | null>(null);
  const [vehicleItems, setVehicleItems] = useState([
    { label: "Moto", value: "Moto" },
    { label: "Tricycle", value: "Tricycle" },
    { label: "Vélo", value: "Vélo" },
    { label: "Voiture", value: "Voiture" },
  ]);

  const pickImage = async (setter: (uri: string | null) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission refusée", "Autorisez l'accès à la galerie.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const takePhoto = async (setter: (uri: string | null) => void) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permission refusée", "Autorisez l'accès à la caméra.");
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) setter(result.assets[0].uri);
  };

  const submitData = async (values: any) => {
    if (
      !vehicleImage ||
      !cipImage ||
      (values.anginType !== "Moto" && values.anginType !== "Tricycle" && !licenseImage)
    ) {
      return Alert.alert("Erreur", "Veuillez ajouter toutes les images requises.");
    }

    if (!params.email || !params.firstName || !params.lastName || !params.phone || !params.password) {
      return Alert.alert("Erreur", "Certaines informations de base sont manquantes !");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", params.firstName as string);
      formData.append("lastName", params.lastName as string);
      formData.append("phone", params.phone as string);
      formData.append("password", params.password as string);
      formData.append("role", "Deliver");
      formData.append("email", params.email as string);
      formData.append("anginType", values.anginType);
      formData.append("anginNumber", values.anginNumber);

      const uriToFile = (uri: string, name: string) => ({ uri, type: "image/jpeg", name });
      if (licenseImage) formData.append("licenseImage", uriToFile(licenseImage, "license.jpg") as any);
      formData.append("aginImage", uriToFile(vehicleImage, "vehicle.jpg") as any);
      formData.append("cip", uriToFile(cipImage, "cip.jpg") as any);

      await axios.post(`${API_URL}auth/register/deliver`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Succès ✅", "Compte livreur créé avec succès !");
      router.push("/screens/Auth/LoginScreen");
    } catch (err: any) {
      console.error(err.response?.data || err);
      Alert.alert("Erreur", err.response?.data?.message || "Impossible de créer le compte");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Étape 2 - Infos du livreur 🚴</Text>
          <Text style={styles.subtitle}>Presque terminé !</Text>

          <Formik
            initialValues={{
              anginType: "",
              anginNumber: "",
              licenseImage: "",
            }}
            validationSchema={DeliverySchema}
            onSubmit={submitData}
          >
            {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
              <>
                <Text style={styles.label}>Type de véhicule</Text>
                <DropDownPicker
                  open={openDropdown}
                  value={vehicleValue}
                  items={vehicleItems}
                  setOpen={setOpenDropdown}
                  setValue={(callback) => {
                    const val = callback(vehicleValue);
                    setVehicleValue(val);
                    setFieldValue("anginType", val);
                  }}
                  setItems={setVehicleItems}
                  placeholder="Sélectionner un véhicule"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  zIndex={1000}
                  modalProps={{
                    animationType: "slide",
                  }}
                />
                {touched.anginType && errors.anginType && <Text style={styles.error}>{errors.anginType}</Text>}

                <TextInput
                  placeholder="Numéro du véhicule"
                  placeholderTextColor="#000"
                  style={styles.input}
                  value={values.anginNumber}
                  onChangeText={handleChange("anginNumber")}
                />
                {touched.anginNumber && errors.anginNumber && <Text style={styles.error}>{errors.anginNumber}</Text>}

                {values.anginType !== "Moto" && values.anginType !== "Tricycle" && (
                  <>
                    <Text style={styles.label}>Photo du permis</Text>
                    <View style={styles.imageContainer}>
                      {licenseImage && <Image source={{ uri: licenseImage }} style={styles.image} />}
                      <View style={styles.row}>
                        <TouchableOpacity style={styles.smallBtn} onPress={() => pickImage(setLicenseImage)}>
                          <Text style={styles.smallBtnText}>📁 Galerie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.smallBtn} onPress={() => takePhoto(setLicenseImage)}>
                          <Text style={styles.smallBtnText}>📸 Caméra</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                )}

                <Text style={styles.label}>Photo du véhicule</Text>
                <View style={styles.imageContainer}>
                  {vehicleImage && <Image source={{ uri: vehicleImage }} style={styles.image} />}
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => pickImage(setVehicleImage)}>
                      <Text style={styles.smallBtnText}>📁 Galerie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => takePhoto(setVehicleImage)}>
                      <Text style={styles.smallBtnText}>📸 Caméra</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>Photo du CIP</Text>
                <View style={styles.imageContainer}>
                  {cipImage && <Image source={{ uri: cipImage }} style={styles.image} />}
                  <View style={styles.row}>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => pickImage(setCipImage)}>
                      <Text style={styles.smallBtnText}>📁 Galerie</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallBtn} onPress={() => takePhoto(setCipImage)}>
                      <Text style={styles.smallBtnText}>📸 Caméra</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit as any} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#D51B20", marginTop: 20 },
  subtitle: { color: "#444", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: width * 0.9,
    padding: 12,
    marginVertical: 6,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: width * 0.9,
    marginVertical: 6,
    paddingHorizontal: 10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  label: { alignSelf: "flex-start", marginTop: 10, fontWeight: "bold", color: "#333" },
  imageContainer: { alignItems: "center", marginVertical: 8 },
  image: { width: 150, height: 100, borderRadius: 10, marginVertical: 5 },
  row: { flexDirection: "row", gap: 10 },
  smallBtn: { backgroundColor: "#eee", padding: 8, borderRadius: 8 },
  smallBtnText: { color: "#000" },
  button: {
    backgroundColor: "#D51B20",
    paddingVertical: 15,
    borderRadius: 10,
    width: width * 0.9,
    marginTop: 15,
  },
  buttonText: { textAlign: "center", color: "#fff", fontWeight: "bold" },
  error: { color: "red", fontSize: 12, alignSelf: "flex-start", marginLeft: width * 0.05 },
});
