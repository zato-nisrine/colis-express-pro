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


export function TermsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.termsTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.termsText}>
            En utilisant l'application Colis Express en tant que livreur, vous acceptez d'être lié
            par ces conditions d'utilisation.
          </Text>

          <Text style={styles.termsTitle}>2. Inscription et compte</Text>
          <Text style={styles.termsText}>
            Pour devenir livreur, vous devez fournir des informations exactes et à jour. Vous êtes
            responsable de maintenir la confidentialité de votre compte.
          </Text>

          <Text style={styles.termsTitle}>3. Obligations du livreur</Text>
          <Text style={styles.termsText}>
            - Respecter les délais de livraison{"\n"}
            - Traiter les colis avec soin{"\n"}
            - Maintenir un comportement professionnel{"\n"}
            - Respecter le code de la route{"\n"}
          </Text>

          <Text style={styles.termsTitle}>4. Rémunération</Text>
          <Text style={styles.termsText}>
            Les gains sont calculés en fonction de la distance parcourue et du type de livraison.
            Les paiements sont effectués hebdomadairement.
          </Text>

          <Text style={styles.termsTitle}>5. Assurance</Text>
          <Text style={styles.termsText}>
            Vous devez maintenir une assurance valide pour votre véhicule et votre activité de
            livraison.
          </Text>

          <Text style={styles.termsTitle}>6. Résiliation</Text>
          <Text style={styles.termsText}>
            Colis Express se réserve le droit de suspendre ou résilier votre compte en cas de
            violation des conditions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}