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


export function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>À propos</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.aboutHeader}>
          <View style={styles.appIcon}>
            <Ionicons name="bicycle" size={60} color="#D51B20" />
          </View>
          <Text style={styles.appName}>Colis Express</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.aboutText}>
            Colis Express est la solution de livraison rapide et fiable au Bénin. Nous connectons
            les livreurs professionnels avec les clients pour des livraisons express.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notre mission</Text>
          <Text style={styles.aboutText}>
            Faciliter les livraisons et créer des opportunités d'emploi pour les livreurs tout en
            offrant un service de qualité aux clients.
          </Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.aboutLink}>
            <Ionicons name="globe-outline" size={20} color="#2196F3" />
            <Text style={styles.aboutLinkText}>www.colisexpress.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutLink}>
            <Ionicons name="mail-outline" size={20} color="#2196F3" />
            <Text style={styles.aboutLinkText}>contact@colisexpress.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.aboutLink}>
            <Ionicons name="call-outline" size={20} color="#2196F3" />
            <Text style={styles.aboutLinkText}>+229 XX XX XX XX</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.copyright}>© 2025 Colis Express. Tous droits réservés.</Text>
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
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  scrollView: { flex: 1 },
  section: { backgroundColor: "#fff", padding: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 15 },
  description: { fontSize: 14, color: "#666", marginBottom: 20, lineHeight: 20 },
  earningsCard: {
    backgroundColor: "#D51B20",
    margin: 20,
    padding: 25,
    borderRadius: 15,
  },
  earningsLabel: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 8 },
  earningsAmount: { fontSize: 36, fontWeight: "bold", color: "#fff", marginBottom: 20 },
  earningsRow: { flexDirection: "row", justifyContent: "space-between" },
  earningsItem: { flex: 1 },
  earningsItemLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 4 },
  earningsItemValue: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  periodButtons: { flexDirection: "row", gap: 10, marginBottom: 15 },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  periodBtnActive: { backgroundColor: "#D51B20" },
  periodText: { fontSize: 13, fontWeight: "600", color: "#666" },
  periodTextActive: { color: "#fff" },
  chart: { marginVertical: 8, borderRadius: 16 },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  transactionDate: { fontSize: 12, color: "#666", marginBottom: 4 },
  transactionAmount: { fontSize: 16, fontWeight: "bold", color: "#333" },
  transactionStatus: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusPaid: { backgroundColor: "#E8F5E9" },
  statusPending: { backgroundColor: "#FFF3E0" },
  transactionStatusText: { fontSize: 11, fontWeight: "600" },
  statusTextPaid: { color: "#4CAF50" },
  statusTextPending: { color: "#FF9800" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: {
    width: "48%",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  statIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#333", marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#666", textAlign: "center" },
  rankCard: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#FFF9E6",
    borderRadius: 15,
  },
  rankTitle: { fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 15 },
  rankDesc: { fontSize: 14, color: "#666", marginTop: 8, textAlign: "center" },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginBottom: 10,
  },
  contactIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactLabel: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 4 },
  contactValue: { fontSize: 13, color: "#666" },
  termsTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 20, marginBottom: 10 },
  termsText: { fontSize: 14, color: "#666", lineHeight: 22, marginBottom: 10 },
  aboutHeader: { alignItems: "center", padding: 40, backgroundColor: "#fff", marginBottom: 10 },
  appIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  appName: { fontSize: 24, fontWeight: "bold", color: "#333", marginBottom: 5 },
  appVersion: { fontSize: 14, color: "#999" },
  aboutText: { fontSize: 14, color: "#666", lineHeight: 22 },
  aboutLink: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  aboutLinkText: { fontSize: 14, color: "#2196F3", marginLeft: 10 },
  copyright: { textAlign: "center", fontSize: 12, color: "#999", padding: 20 },
});

export default EarningsScreen;