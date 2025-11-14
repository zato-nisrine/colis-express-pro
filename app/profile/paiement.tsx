import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function AddressScreen() {
  const router = useRouter();

  // 🟢 Exemple de données (tu peux plus tard les remplacer par un backend ou AsyncStorage)
  const [addresses, setAddresses] = useState<string[]>([
    "Maison - Carrefour PK10",
    "Travail - Ganhi",
  ]);

  const [newAddress, setNewAddress] = useState("");

  const addAddress = () => {
    if (!newAddress.trim()) {
      Alert.alert("Adresse vide", "Veuillez saisir une adresse valide.");
      return;
    }
    setAddresses((prev) => [...prev, newAddress.trim()]);
    setNewAddress("");
  };

  const deleteAddress = (index: number) => {
    Alert.alert("Supprimer", "Voulez-vous vraiment supprimer cette adresse ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () =>
          setAddresses((prev) => prev.filter((_, i) => i !== index)),
      },
    ]);
  };

  const renderItem = ({ item, index }: any) => (
    <View style={styles.card}>
      <Text style={styles.addressText}>{item}</Text>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => deleteAddress(index)}
      >
        <Text style={styles.deleteText}>Supprimer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes adresses</Text>

      {/* Champ pour ajouter une nouvelle adresse */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ajouter une nouvelle adresse"
          value={newAddress}
          onChangeText={setNewAddress}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addAddress}>
          <Text style={styles.addText}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des adresses */}
      {addresses.length === 0 ? (
        <Text style={styles.empty}>Aucune adresse enregistrée.</Text>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>⬅ Retour</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  addContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: "#D51B20",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addText: { color: "#fff", fontWeight: "bold" },
  empty: { textAlign: "center", marginTop: 50, color: "#555" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  addressText: { fontSize: 16, color: "#333", flexShrink: 1 },
  deleteBtn: {
    backgroundColor: "#ff5252",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteText: { color: "#fff", fontWeight: "600" },
  backBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D51B20",
    alignItems: "center",
  },
  backText: { color: "#D51B20", fontWeight: "bold", fontSize: 16 },
});
