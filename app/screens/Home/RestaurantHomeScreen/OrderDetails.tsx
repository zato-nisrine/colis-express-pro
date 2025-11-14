// app/screens/Home/RestaurantHomeScreen/OrderDetails.tsx
import { API_URL, UPLOADS_URL } from "@/app/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../store/store";

const { width } = Dimensions.get("window");

type Menu = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
};

type OrderMenu = {
  id: string;
  menuId: string;
  quantity: number;
  price: number;
  unit: string;
  courseId: string;
  menu: Menu;
  createdAt: string;
  updatedAt: string;
};

type OrderUser = {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string | null;
};

type OrderRestaurant = {
  id: string;
  userId: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  phone: string;
};

type Order = {
  id: string;
  status: string;
  userId: string | null;
  deliverId: string | null;
  restaurantId: string;
  pickupLatitude: string;
  pickupLongitude: string;
  deliveryLatitude: string;
  deliveryLongitude: string;
  type: string;
  orderMenus: OrderMenu[];
  totalPrice: number;
  deliveryFee?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser;
  restaurant?: OrderRestaurant;
};

const ENDPOINT_RESTAURANT_ORDERS = `${API_URL}restaurant/orders`;
const ENDPOINT_ORDER_DETAILS = (id: string) => `${API_URL}restaurant/orders/${id}`;
const ENDPOINT_ACCEPT_ORDER = (id: string) => `${API_URL}restaurant/orders/${id}/accept`;
const ENDPOINT_REJECT_ORDER = (id: string) => `${API_URL}restaurant/orders/${id}/reject`;
const ENDPOINT_READY_ORDER = (id: string) => `${API_URL}restaurant/orders/${id}/ready`;

// Fonction pour formater la date complète
const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("fr-FR", options);
};

// Fonction pour formater la date relative
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
};

// Status info
const getStatusInfo = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "Nouvelle", color: "#FF9800", icon: "time-outline", bgColor: "#FFF3E0" };
    case "accepted":
      return { label: "Acceptée", color: "#2196F3", icon: "checkmark-circle", bgColor: "#E3F2FD" };
    case "preparing":
      return { label: "En préparation", color: "#9C27B0", icon: "restaurant", bgColor: "#F3E5F5" };
    case "ready":
      return { label: "Prête", color: "#4CAF50", icon: "checkmark-done", bgColor: "#E8F5E9" };
    case "picked_up":
      return { label: "Récupérée", color: "#00BCD4", icon: "bicycle", bgColor: "#E0F7FA" };
    case "delivered":
      return { label: "Livrée", color: "#4CAF50", icon: "checkmark-circle", bgColor: "#E8F5E9" };
    case "rejected":
      return { label: "Refusée", color: "#F44336", icon: "close-circle", bgColor: "#FFEBEE" };
    default:
      return { label: status, color: "#999", icon: "help-circle", bgColor: "#F5F5F5" };
  }
};

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const token = useSelector((state: RootState) => state.authReducer.token);

  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Essayer d'abord l'endpoint spécifique
      let res = await fetch(ENDPOINT_ORDER_DETAILS(id), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      // Si l'endpoint spécifique n'existe pas, utiliser l'endpoint général
      if (!res.ok && res.status === 404) {
        res = await fetch(ENDPOINT_RESTAURANT_ORDERS, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Erreur serveur lors de la récupération des commandes");
        }

        const orders = await res.json();
        const ordersArray = Array.isArray(orders) ? orders : [];
        const foundOrder = ordersArray.find((o: Order) => o.id === id);
        
        if (!foundOrder) {
          throw new Error("Commande introuvable");
        }
        
        setOrder(foundOrder);
      } else {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Erreur serveur lors de la récupération de la commande");
        }

        const data = await res.json();
        setOrder(data);
      }
    } catch (err: any) {
      console.error("fetchOrderDetails error:", err);
      setError(err.message || "Impossible de charger les détails de la commande");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id, fetchOrderDetails]);

  // Rafraîchir les données quand l'écran redevient actif
  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchOrderDetails();
      }
    }, [id, fetchOrderDetails])
  );

  const acceptOrder = async () => {
    if (!order) return;
    try {
      const res = await fetch(ENDPOINT_ACCEPT_ORDER(order.id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors de l'acceptation");
      }

      Alert.alert("Succès", "Commande acceptée. Commencez la préparation !");
      await fetchOrderDetails();
    } catch (err: any) {
      console.error("acceptOrder error:", err);
      Alert.alert("Erreur", err.message || "Impossible d'accepter la commande");
    }
  };

  const rejectOrder = async () => {
    if (!order) return;
    Alert.alert(
      "Refuser la commande",
      "Voulez-vous vraiment refuser cette commande ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Refuser",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await fetch(ENDPOINT_REJECT_ORDER(order.id), {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: token ? `Bearer ${token}` : "",
                },
              });

              if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Erreur lors du refus");
              }

              Alert.alert("Commande refusée", "Le client a été notifié", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch (err: any) {
              console.error("rejectOrder error:", err);
              Alert.alert("Erreur", err.message || "Impossible de refuser la commande");
            }
          },
        },
      ]
    );
  };

  const markAsReady = async () => {
    if (!order) return;
    try {
      const res = await fetch(ENDPOINT_READY_ORDER(order.id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Erreur lors de la mise à jour");
      }

      Alert.alert("Succès", "Commande prête pour la livraison !");
      await fetchOrderDetails();
    } catch (err: any) {
      console.error("markAsReady error:", err);
      Alert.alert("Erreur", err.message || "Impossible de marquer comme prête");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#D51B20" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={48} color="#D51B20" />
          <Text style={styles.errorText}>{error || "Commande introuvable"}</Text>
          <TouchableOpacity onPress={fetchOrderDetails} style={styles.reloadBtn}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.reloadText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Détails de la commande</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* STATUS BADGE */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Ionicons name={statusInfo.icon as any} size={20} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
          <Text style={styles.timeText}>{formatDate(order.createdAt)}</Text>
          <Text style={styles.fullDateText}>{formatFullDate(order.createdAt)}</Text>
        </View>

        {/* CLIENT INFO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#D51B20" />
            <Text style={styles.sectionTitle}>Informations client</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nom complet</Text>
              <Text style={styles.infoValue}>
                {order.user
                  ? `${order.user.firstName} ${order.user.lastName}`
                  : "Non disponible"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{order.user?.phone || "Non disponible"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{order.user?.email || "Non disponible"}</Text>
            </View>
          </View>
        </View>

        {/* DELIVERY INFO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color="#D51B20" />
            <Text style={styles.sectionTitle}>Adresse de livraison</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.addressText}>
              {order.restaurant?.address ||
                (order.deliveryLatitude && order.deliveryLongitude
                  ? `Lat: ${order.deliveryLatitude}, Lng: ${order.deliveryLongitude}`
                  : "Non disponible")}
            </Text>
            <View style={styles.coordsRow}>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <Text style={styles.coordValue}>{order.deliveryLatitude}</Text>
              </View>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <Text style={styles.coordValue}>{order.deliveryLongitude}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* PICKUP INFO */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="storefront-outline" size={20} color="#D51B20" />
            <Text style={styles.sectionTitle}>Point de collecte</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.coordsRow}>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <Text style={styles.coordValue}>{order.pickupLatitude}</Text>
              </View>
              <View style={styles.coordItem}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <Text style={styles.coordValue}>{order.pickupLongitude}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type de livraison</Text>
              <Text style={styles.infoValue}>{order.type || "Non spécifié"}</Text>
            </View>
          </View>
        </View>

        {/* ORDER ITEMS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={20} color="#D51B20" />
            <Text style={styles.sectionTitle}>
              Articles ({order.orderMenus?.length || 0})
            </Text>
          </View>
          <View style={styles.sectionContent}>
            {order.orderMenus?.map((orderMenu) => (
              <View key={orderMenu.id} style={styles.itemCard}>
                {orderMenu.menu?.image && (
                  <Image
                    source={{
                      uri: `${UPLOADS_URL}${orderMenu.menu.image}`,
                    }}
                    style={styles.itemImage}
                  />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{orderMenu.menu?.name || "Article"}</Text>
                  {orderMenu.menu?.description && (
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {orderMenu.menu.description}
                    </Text>
                  )}
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemQuantity}>Quantité: {orderMenu.quantity}</Text>
                    <Text style={styles.itemUnit}>{orderMenu.unit}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{orderMenu.price.toFixed(0)} FCFA</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* NOTES */}
        {order.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbox-outline" size={20} color="#D51B20" />
              <Text style={styles.sectionTitle}>Notes</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#D51B20" />
            <Text style={styles.sectionTitle}>Récapitulatif</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sous-total</Text>
              <Text style={styles.summaryValue}>{order.totalPrice.toFixed(0)} FCFA</Text>
            </View>
            {order.deliveryFee !== undefined && order.deliveryFee > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Frais de livraison</Text>
                <Text style={styles.summaryValue}>{order.deliveryFee.toFixed(0)} FCFA</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
              <Text style={styles.summaryLabelTotal}>Total</Text>
              <Text style={styles.summaryValueTotal}>
                {(order.totalPrice + (order.deliveryFee || 0)).toFixed(0)} FCFA
              </Text>
            </View>
          </View>
        </View>

        {/* ORDER METADATA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#D51B20" />
            <Text style={styles.sectionTitle}>Informations</Text>
          </View>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID Commande</Text>
              <Text style={styles.infoValueSmall}>{order.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Créée le</Text>
              <Text style={styles.infoValueSmall}>{formatFullDate(order.createdAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Modifiée le</Text>
              <Text style={styles.infoValueSmall}>{formatFullDate(order.updatedAt)}</Text>
            </View>
            {order.deliverId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Livreur ID</Text>
                <Text style={styles.infoValueSmall}>{order.deliverId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ACTIONS */}
        {order.status === "pending" && (
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.rejectBtnFull} onPress={rejectOrder}>
              <Ionicons name="close-circle" size={22} color="#F44336" />
              <Text style={styles.rejectBtnText}>Refuser la commande</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.acceptBtnFull} onPress={acceptOrder}>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text style={styles.acceptBtnText}>Accepter la commande</Text>
            </TouchableOpacity>
          </View>
        )}

        {(order.status === "accepted" || order.status === "preparing") && (
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.readyBtnFull} onPress={markAsReady}>
              <Ionicons name="checkmark-done-circle" size={22} color="#fff" />
              <Text style={styles.readyBtnText}>Marquer comme prête</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 15,
    color: "#666",
    fontSize: 14,
  },
  errorText: {
    marginTop: 15,
    color: "#D51B20",
    textAlign: "center",
    fontSize: 14,
  },
  reloadBtn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D51B20",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  reloadText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  statusSection: {
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    marginBottom: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
  },
  fullDateText: {
    fontSize: 12,
    color: "#999",
    marginTop: 5,
  },
  section: {
    backgroundColor: "#fff",
    marginBottom: 10,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  sectionContent: {
    paddingHorizontal: 20,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  infoValueSmall: {
    fontSize: 12,
    color: "#666",
    flex: 2,
    textAlign: "right",
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 15,
    lineHeight: 20,
  },
  coordsRow: {
    flexDirection: "row",
    gap: 15,
  },
  coordItem: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
  },
  coordLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 13,
    color: "#666",
    marginRight: 8,
  },
  itemUnit: {
    fontSize: 13,
    color: "#999",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#D51B20",
    marginTop: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    fontStyle: "italic",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryValue: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
  summaryRowTotal: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  actionsSection: {
    padding: 20,
    gap: 12,
  },
  rejectBtnFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  rejectBtnText: {
    color: "#F44336",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  acceptBtnFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D51B20",
    paddingVertical: 15,
    borderRadius: 12,
  },
  acceptBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  readyBtnFull: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 12,
  },
  readyBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 20,
  },
});

