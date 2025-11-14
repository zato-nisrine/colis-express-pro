import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { API_URL } from "../api";

export default function HistoryScreen() {
  const router = useRouter();
  const token = useSelector((s: RootState) => s.authReducer.token);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/courses`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Erreur serveur");
        }
        const data = await res.json();
        if (mounted) setHistory(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.warn('Fetch history failed', e);
        Alert.alert('Erreur', 'Impossible de récupérer l\'historique');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [token]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: `/profile/history/[id]`,
          params: { id: item.id || item._id || item.courseId },
        } as any)
      }
    >
      <Text style={styles.date}>{item.date || item.createdAt || ''}</Text>
      <Text style={styles.route}>
        {item.start?.address || item.from || '—'} ➡️ {item.end?.address || item.to || '—'}
      </Text>
      <Text style={styles.info}>
        {item.vehicle} - {item.price ? `${item.price} FCFA` : '—'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historique des courses</Text>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#D51B20" />
      ) : history.length === 0 ? (
        <Text style={styles.empty}>Aucun trajet pour l’instant.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => (item.id || item._id || item.courseId || Math.random().toString())}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
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
  empty: { textAlign: "center", marginTop: 50, color: "#555" },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  date: { fontSize: 14, color: "#999", marginBottom: 4 },
  route: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  info: { fontSize: 14, color: "#555" },
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
