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

export function ContactScreen() {
  const router = useRouter();

  const contacts = [
    { label: "WhatsApp", icon: "logo-whatsapp", value: "+229 XX XX XX XX", color: "#25D366" },
    { label: "Email", icon: "mail", value: "support@colisexpress.com", color: "#2196F3" },
    { label: "Téléphone", icon: "call", value: "+229 XX XX XX XX", color: "#D51B20" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nous contacter</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service client</Text>
          <Text style={styles.description}>
            Notre équipe est disponible 24/7 pour répondre à vos questions et vous accompagner.
          </Text>
          {contacts.map((contact, i) => (
            <TouchableOpacity key={i} style={styles.contactCard}>
              <View style={[styles.contactIcon, { backgroundColor: contact.color + "15" }]}>
                <Ionicons name={contact.icon as any} size={24} color={contact.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactLabel}>{contact.label}</Text>
                <Text style={styles.contactValue}>{contact.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Réseaux sociaux</Text>
          {[
            { name: "Facebook", icon: "logo-facebook", color: "#1877F2" },
            { name: "Instagram", icon: "logo-instagram", color: "#E4405F" },
            { name: "Twitter", icon: "logo-twitter", color: "#1DA1F2" },
          ].map((social, i) => (
            <TouchableOpacity key={i} style={styles.contactCard}>
              <View style={[styles.contactIcon, { backgroundColor: social.color + "15" }]}>
                <Ionicons name={social.icon as any} size={24} color={social.color} />
              </View>
              <Text style={styles.contactLabel}>{social.name}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}