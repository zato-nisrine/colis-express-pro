// app/profile/documents.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "../api";

type Document = {
  id: string;
  type: string;
  label: string;
  icon: string;
  status: "pending" | "verified" | "rejected" | "missing";
  file?: string;
  expiryDate?: string;
};

export default function DocumentsScreen() {
  const router = useRouter();
  const token = useSelector((state: RootState) => state.authReducer.token);

  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      type: "id_card",
      label: "Carte d'identité",
      icon: "card-outline",
      status: "verified",
      file: "https://via.placeholder.com/150",
      expiryDate: "2027-12-31",
    },
    {
      id: "2",
      type: "driver_license",
      label: "Permis de conduire",
      icon: "car-outline",
      status: "pending",
      file: "https://via.placeholder.com/150",
      expiryDate: "2026-06-15",
    },
    {
      id: "3",
      type: "vehicle_registration",
      label: "Carte grise",
      icon: "document-text-outline",
      status: "verified",
      file: "https://via.placeholder.com/150",
    },
    {
      id: "4",
      type: "insurance",
      label: "Assurance",
      icon: "shield-checkmark-outline",
      status: "rejected",
      file: "https://via.placeholder.com/150",
      expiryDate: "2025-03-20",
    },
    {
      id: "5",
      type: "criminal_record",
      label: "Casier judiciaire",
      icon: "document-outline",
      status: "missing",
    },
  ]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "verified":
        return { label: "Vérifié", color: "#4CAF50", bg: "#E8F5E9" };
      case "pending":
        return { label: "En attente", color: "#FF9800", bg: "#FFF3E0" };
      case "rejected":
        return { label: "Rejeté", color: "#F44336", bg: "#FFEBEE" };
      case "missing":
        return { label: "Manquant", color: "#9E9E9E", bg: "#F5F5F5" };
      default:
        return { label: "Inconnu", color: "#9E9E9E", bg: "#F5F5F5" };
    }
  };

  const pickDocument = async (docId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["image/*", "application/pdf"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        // Upload du document
        setLoading(true);
        // Simuler l'upload
        setTimeout(() => {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === docId
                ? { ...doc, file: result.assets[0].uri, status: "pending" }
                : doc
            )
          );
          setLoading(false);
          Alert.alert("Succès", "Document téléchargé. En attente de vérification.");
        }, 1500);
      }
    } catch (err) {
      console.error("Document picker error:", err);
      Alert.alert("Erreur", "Impossible de sélectionner le document");
    }
  };

  const renderDocument = (doc: Document) => {
    const statusInfo = getStatusInfo(doc.status);
    const isExpiringSoon =
      doc.expiryDate &&
      new Date(doc.expiryDate).getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

    return (
      <View key={doc.id} style={styles.docCard}>
        <View style={styles.docHeader}>
          <View style={styles.docInfo}>
            <View style={styles.iconContainer}>
              <Ionicons name={doc.icon as any} size={24} color="#D51B20" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docLabel}>{doc.label}</Text>
              {doc.expiryDate && (
                <Text style={[styles.expiryText, isExpiringSoon && styles.expiryWarning]}>
                  <Ionicons name="calendar-outline" size={12} />
                  {" "}Expire le {new Date(doc.expiryDate).toLocaleDateString("fr-FR")}
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {doc.file && (
          <Image source={{ uri: doc.file }} style={styles.docPreview} />
        )}

        <View style={styles.docActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => pickDocument(doc.id)}
            disabled={loading}
          >
            <Ionicons
              name={doc.file ? "cloud-upload-outline" : "add-circle-outline"}
              size={20}
              color="#2196F3"
            />
            <Text style={styles.actionBtnText}>
              {doc.file ? "Remplacer" : "Télécharger"}
            </Text>
          </TouchableOpacity>

          {doc.file && (
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="eye-outline" size={20} color="#666" />
              <Text style={styles.actionBtnText}>Voir</Text>
            </TouchableOpacity>
          )}

          {doc.status === "rejected" && (
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="information-circle-outline" size={20} color="#F44336" />
              <Text style={[styles.actionBtnText, { color: "#F44336" }]}>
                Raison
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const completedDocs = documents.filter((d) => d.status === "verified").length;
  const totalDocs = documents.length;
  const progress = (completedDocs / totalDocs) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mes documents</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Complétion du profil</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedDocs} sur {totalDocs} documents vérifiés
          </Text>
        </View>

        {/* Alert */}
        {documents.some((d) => d.status === "rejected" || d.status === "missing") && (
          <View style={styles.alertBox}>
            <Ionicons name="alert-circle" size={24} color="#F44336" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.alertTitle}>Action requise</Text>
              <Text style={styles.alertText}>
                Certains documents nécessitent votre attention
              </Text>
            </View>
          </View>
        )}

        {/* Documents list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documents requis</Text>
          {documents.map(renderDocument)}
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color="#2196F3" />
          <Text style={styles.infoText}>
            Tous vos documents sont sécurisés et cryptés. La vérification prend
            généralement 24 à 48 heures.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D51B20" />
        </View>
      )}
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
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  scrollView: { flex: 1 },
  progressSection: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  progressPercentage: { fontSize: 20, fontWeight: "bold", color: "#D51B20" },
  progressBar: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: { height: "100%", backgroundColor: "#4CAF50" },
  progressText: { fontSize: 12, color: "#666" },
  alertBox: {
    flexDirection: "row",
    backgroundColor: "#FFEBEE",
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#F44336",
  },
  alertTitle: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 4 },
  alertText: { fontSize: 13, color: "#666" },
  section: { backgroundColor: "#fff", padding: 20, marginBottom: 10 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  docCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  docHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  docInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  docLabel: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 4 },
  expiryText: { fontSize: 12, color: "#666" },
  expiryWarning: { color: "#F44336" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  docPreview: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },
  docActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionBtnText: {
    fontSize: 13,
    color: "#2196F3",
    marginLeft: 6,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoText: { flex: 1, fontSize: 13, color: "#1976D2", marginLeft: 12 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});