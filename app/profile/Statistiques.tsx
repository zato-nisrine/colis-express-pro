import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export function StatsScreen() {
    const router = useRouter();

    const stats = [
        { label: "Total courses", value: "245", icon: "bicycle", color: "#D51B20" },
        { label: "Taux d'acceptation", value: "92%", icon: "checkmark-circle", color: "#4CAF50" },
        { label: "Note moyenne", value: "4.8/5", icon: "star", color: "#FFB400" },
        { label: "Temps moyen", value: "15 min", icon: "time", color: "#2196F3" },
        { label: "Distance totale", value: "1,248 km", icon: "navigate", color: "#9C27B0" },
        { label: "Gains totaux", value: "385,000 FCFA", icon: "wallet", color: "#4CAF50" },
    ];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Statistiques</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Performance globale</Text>
                    <View style={styles.statsGrid}>
                        {stats.map((stat, i) => (
                            <View key={i} style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: stat.color + "15" }]}>
                                    <Ionicons name={stat.icon as any} size={28} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Classement</Text>
                    <View style={styles.rankCard}>
                        <Ionicons name="trophy" size={60} color="#FFB400" />
                        <Text style={styles.rankTitle}>Top 15%</Text>
                        <Text style={styles.rankDesc}>Vous êtes parmi les meilleurs livreurs !</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}