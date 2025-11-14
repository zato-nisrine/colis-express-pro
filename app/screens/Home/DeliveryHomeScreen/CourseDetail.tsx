// app/screens/Home/DeliveryHomeScreen/CourseDetail.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { API_URL } from "@/app/api";

const { width, height } = Dimensions.get("window");
const GOOGLE_API_KEY = "AIzaSyAtNqQvTH1JLaH1-OKqCpzgzd-yZdv_o4o";

type Expedition = {
  id: string;
  name: string;
  description: string;
  image: string;
  vehicleType: string;
};

type Course = {
  id: string;
  status: string;
  pickupLatitude: string;
  pickupLongitude: string;
  deliveryLatitude: string;
  deliveryLongitude: string;
  type: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  expeditions: Expedition[];
};
const ENDPOINT_COURSE_DETAIL = (id: string) => `${API_URL}courses/${id}`;
const ENDPOINT_ACCEPT = (id: string) => `${API_URL}courses/accept/${id}`;

// Calcul de distance
const calculateDistance = (lat1: string, lon1: string, lat2: string, lon2: string): string => {
  const R = 6371;
  const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
  const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
};

// Formatage date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Status badge
const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "En attente", color: "#FFA726", icon: "time-outline" };
    case "accepted":
      return { label: "Acceptée", color: "#66BB6A", icon: "checkmark-circle-outline" };
    case "in_progress":
      return { label: "En cours", color: "#42A5F5", icon: "bicycle-outline" };
    case "completed":
      return { label: "Terminée", color: "#66BB6A", icon: "checkmark-done-outline" };
    case "cancelled":
      return { label: "Annulée", color: "#EF5350", icon: "close-circle-outline" };
    default:
      return { label: status, color: "#999", icon: "help-circle-outline" };
  }
};

export default function CourseDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const courseId = params.id as string;
  
  const token = useSelector((state: RootState) => state.authReducer.token);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<boolean>(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);

  console.log("CourseDetail courseId:", courseId);
  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  useEffect(() => {
    if (course) {
      fetchDirections();
    }
  }, [course]);

  const fetchCourseDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ENDPOINT_COURSE_DETAIL(courseId), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors du chargement des détails");
      }

      const data = await res.json();
      setCourse(data);
    } catch (err: any) {
      console.error("fetchCourseDetail error:", err);
      setError(err.message || "Impossible de charger la course");
    } finally {
      setLoading(false);
    }
  };

  const fetchDirections = async () => {
    if (!course) return;

    try {
      const origin = `${course.pickupLatitude},${course.pickupLongitude}`;
      const destination = `${course.deliveryLatitude},${course.deliveryLongitude}`;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      }
    } catch (err) {
      console.error("fetchDirections error:", err);
    }
  };

  // Décodage polyline
  const decodePolyline = (encoded: string) => {
    const poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return poly;
  };

  const acceptCourse = async () => {
    if (!course) return;

    setAccepting(true);
    try {
      const res = await fetch(ENDPOINT_ACCEPT(course.id), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors de l'acceptation");
      }

      Alert.alert("Succès", "Course acceptée avec succès !", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      console.error("acceptCourse error:", err);
      Alert.alert("Erreur", err.message || "Impossible d'accepter la course");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#D51B20" />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#D51B20" />
        <Text style={styles.errorText}>{error || "Course introuvable"}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const expedition = course.expeditions[0];
  const statusInfo = getStatusInfo(course.status);
  const distance = calculateDistance(
    course.pickupLatitude,
    course.pickupLongitude,
    course.deliveryLatitude,
    course.deliveryLongitude
  );

  const pickupCoord = {
    latitude: parseFloat(course.pickupLatitude),
    longitude: parseFloat(course.pickupLongitude),
  };

  const deliveryCoord = {
    latitude: parseFloat(course.deliveryLatitude),
    longitude: parseFloat(course.deliveryLongitude),
  };

  const region = {
    latitude: (pickupCoord.latitude + deliveryCoord.latitude) / 2,
    longitude: (pickupCoord.longitude + deliveryCoord.longitude) / 2,
    latitudeDelta: Math.abs(pickupCoord.latitude - deliveryCoord.latitude) * 2 + 0.02,
    longitudeDelta: Math.abs(pickupCoord.longitude - deliveryCoord.longitude) * 2 + 0.02,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la course</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={region}
            scrollEnabled={true}
            zoomEnabled={true}
          >
            {/* Marker départ */}
            <Marker coordinate={pickupCoord} title="Point de départ">
              <View style={styles.markerPickup}>
                <Ionicons name="location" size={30} color="#4CAF50" />
              </View>
            </Marker>

            {/* Marker arrivée */}
            <Marker coordinate={deliveryCoord} title="Point d'arrivée">
              <View style={styles.markerDelivery}>
                <Ionicons name="location" size={30} color="#D51B20" />
              </View>
            </Marker>

            {/* Route */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#2196F3"
                strokeWidth={4}
              />
            )}
          </MapView>

          {/* Badge statut sur la carte */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color="#fff" />
            <Text style={styles.statusText}>{statusInfo.label}</Text>
          </View>
        </View>

        {/* Infos principales */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.typeBadge}>
              <Ionicons name="bicycle" size={16} color="#fff" />
              <Text style={styles.typeBadgeText}>{course.type}</Text>
            </View>
            <Text style={styles.priceText}>{course.totalPrice.toFixed(0)} FCFA</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="navigate-outline" size={20} color="#666" />
              <Text style={styles.statValue}>{distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.statValue}>~{Math.ceil(parseFloat(distance) * 3)} min</Text>
              <Text style={styles.statLabel}>Durée estimée</Text>
            </View>
          </View>
        </View>

        {/* Détails du colis */}
        {expedition && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="cube-outline" size={18} /> Détails du colis
            </Text>
            <View style={styles.packageCard}>
              {expedition.image && !expedition.image.startsWith("file://") && (
                <Image source={{ uri: expedition.image }} style={styles.packageImage} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.packageName}>{expedition.name}</Text>
                <Text style={styles.packageDesc}>{expedition.description}</Text>
                <View style={styles.vehicleTag}>
                  <Text style={styles.vehicleTagText}>
                    Véhicule: {expedition.vehicleType}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Trajet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="map-outline" size={18} /> Trajet
          </Text>
          <View style={styles.routeCard}>
            <View style={styles.routeItem}>
              <View style={styles.dotPickup} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTitle}>Point de départ</Text>
                <Text style={styles.routeCoords}>
                  {course.pickupLatitude.substring(0, 9)}, {course.pickupLongitude.substring(0, 9)}
                </Text>
              </View>
              <TouchableOpacity style={styles.navButton}>
                <Ionicons name="navigate" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>

            <View style={styles.routeLine} />

            <View style={styles.routeItem}>
              <View style={styles.dotDelivery} />
              <View style={{ flex: 1 }}>
                <Text style={styles.routeTitle}>Point d'arrivée</Text>
                <Text style={styles.routeCoords}>
                  {course.deliveryLatitude.substring(0, 9)}, {course.deliveryLongitude.substring(0, 9)}
                </Text>
              </View>
              <TouchableOpacity style={styles.navButton}>
                <Ionicons name="navigate" size={20} color="#2196F3" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="calendar-outline" size={18} /> Informations temporelles
          </Text>
          <View style={styles.dateCard}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Créée le:</Text>
              <Text style={styles.dateValue}>{formatDate(course.createdAt)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Mise à jour:</Text>
              <Text style={styles.dateValue}>{formatDate(course.updatedAt)}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bouton accepter (si pending) */}
      {course.status === "pending" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.acceptButton, accepting && styles.acceptButtonDisabled]}
            onPress={acceptCourse}
            disabled={accepting}
          >
            {accepting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.acceptButtonText}>Accepter cette course</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
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
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  loadingText: { marginTop: 15, color: "#666" },
  errorText: { marginTop: 15, color: "#D51B20", textAlign: "center" },
  backButton: {
    marginTop: 20,
    backgroundColor: "#D51B20",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: { color: "#fff", fontWeight: "bold" },
  scrollView: { flex: 1 },
  mapContainer: {
    height: height * 0.4,
    position: "relative",
  },
  map: { flex: 1 },
  markerPickup: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  markerDelivery: {
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D51B20",
  },
  statusBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: { color: "#fff", fontWeight: "bold", marginLeft: 6, fontSize: 13 },
  infoCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D51B20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: { color: "#fff", fontWeight: "600", marginLeft: 6 },
  priceText: { fontSize: 24, fontWeight: "bold", color: "#F57C00" },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 8 },
  statLabel: { fontSize: 12, color: "#666", marginTop: 4 },
  statDivider: { width: 1, backgroundColor: "#e0e0e0" },
  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  packageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
  },
  packageImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: "#f0f0f0",
  },
  packageName: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 6 },
  packageDesc: { fontSize: 14, color: "#666", marginBottom: 10 },
  vehicleTag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  vehicleTagText: { fontSize: 12, color: "#2196F3", fontWeight: "500" },
  routeCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dotPickup: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    marginRight: 15,
  },
  dotDelivery: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#D51B20",
    marginRight: 15,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: "#ddd",
    marginLeft: 7,
    marginVertical: 8,
  },
  routeTitle: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
  routeCoords: { fontSize: 12, color: "#666" },
  navButton: {
    padding: 8,
    backgroundColor: "#E3F2FD",
    borderRadius: 8,
  },
  dateCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15 },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dateLabel: { fontSize: 14, color: "#666" },
  dateValue: { fontSize: 14, fontWeight: "500", color: "#333" },
  bottomBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  acceptButton: {
    backgroundColor: "#D51B20",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  acceptButtonDisabled: { backgroundColor: "#ccc" },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});