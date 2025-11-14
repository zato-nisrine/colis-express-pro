// app/profile/details.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../api";

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.authReducer.user);
  const token = useSelector((state: RootState) => state.authReducer.token);

  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [address, setAddress] = useState(user?.address || "");
  const [profileImage, setProfileImage] = useState(
    user?.profileImage || "https://randomuser.me/api/portraits/men/1.jpg"
  );

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permission requise", "Nous avons besoin de l'accès à vos photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Erreur", "Le prénom et le nom sont obligatoires");
      return;
    }

    setLoading(true);
    try {
      // Appel API pour mettre à jour le profil
      const res = await fetch(`${API_URL}user/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          profileImage,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Erreur lors de la mise à jour");
      }

      Alert.alert("Succès", "Profil mis à jour avec succès", [
        {
          text: "OK",
          onPress: () => {
            setEditing(false);
            // Optionnel: dispatch pour mettre à jour Redux
          },
        },
      ]);
    } catch (err: any) {
      console.error("Update profile error:", err);
      Alert.alert("Erreur", err.message || "Impossible de mettre à jour le profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon profil</Text>
        <TouchableOpacity
          onPress={() => (editing ? handleSave() : setEditing(true))}
          style={styles.editBtn}
        >
          {loading ? (
            <ActivityIndicator color="#D51B20" />
          ) : (
            <Text style={styles.editBtnText}>{editing ? "Sauvegarder" : "Modifier"}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo de profil */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: profileImage }} style={styles.avatar} />
            {editing && (
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.avatarLabel}>Photo de profil</Text>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Votre prénom"
                editable={editing}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Votre nom"
                editable={editing}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Téléphone</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+229 XX XX XX XX"
                keyboardType="phone-pad"
                editable={editing}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={editing}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#999" />
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Votre adresse"
                editable={editing}
                placeholderTextColor="#999"
                multiline
              />
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes statistiques</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="bicycle" size={28} color="#D51B20" />
              </View>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={28} color="#FFB400" />
              </View>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
              </View>
              <Text style={styles.statValue}>98%</Text>
              <Text style={styles.statLabel}>Taux réussite</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={28} color="#2196F3" />
              </View>
              <Text style={styles.statValue}>15min</Text>
              <Text style={styles.statLabel}>Temps moyen</Text>
            </View>
          </View>
        </View>

        {/* Badge & Niveau */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mon niveau</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Ionicons name="trophy" size={40} color="#FFB400" />
              <Text style={styles.badgeTitle}>Livreur Gold</Text>
              <Text style={styles.badgeDesc}>Niveau 3 - 45 livraisons effectuées</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "75%" }]} />
              </View>
              <Text style={styles.progressText}>75% vers le niveau suivant (15 livraisons restantes)</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  editBtn: { minWidth: 80, alignItems: "flex-end" },
  editBtnText: { fontSize: 16, fontWeight: "600", color: "#D51B20" },
  scrollView: { flex: 1 },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  avatarContainer: { position: "relative" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#D51B20",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#D51B20",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  avatarLabel: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 15,
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  badgeContainer: {
    alignItems: "center",
  },
  badge: {
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    marginBottom: 20,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  badgeDesc: {
    fontSize: 13,
    color: "#666",
    marginTop: 5,
  },
  progressContainer: {
    width: "100%",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});