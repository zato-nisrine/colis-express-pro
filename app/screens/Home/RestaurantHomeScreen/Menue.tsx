// app/screens/Home/RestaurantHomeScreen/RestaurantMenuScreen.tsx
import KeyboardAwareScreen from "@/app/components/KeyboardAwareScreen";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import { API_URL, UPLOADS_URL } from "../../../api";
import { RootState } from "../../../store/store";

type MenuItem = {
    id: string;
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    createdAt: string;
    updatedAt: string;
};

const ENDPOINT_MENU = (restaurantId: string) => `${API_URL}menu/restaurant/${restaurantId}`;
const ENDPOINT_CREATE_MENU = `${API_URL}menu`;
const ENDPOINT_UPDATE_MENU = (id: string) => `${API_URL}menu/${id}`;
const ENDPOINT_DELETE_MENU = (id: string) => `${API_URL}menu/${id}`;


export default function RestaurantMenuScreen() {
    const router = useRouter();
    const token = useSelector((state: RootState) => state.authReducer.token);
    const user = useSelector((state: RootState) => state.authReducer.user);

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const res = await fetch(ENDPOINT_MENU(user.restaurantId), {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Erreur lors du chargement du menu");
            }

            const data = await res.json();
            console.log("Fetched menu data:", data);
            setMenuItems(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("fetchMenu error:", err);
            Alert.alert("Erreur", err.message || "Impossible de charger le menu");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permission requise", "Nous avons besoin de l'accès à vos photos");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const openAddModal = () => {
        setEditingItem(null);
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price.toString());
        setImage(UPLOADS_URL+item.image || "");
        setShowModal(true);
    };

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice("");
        setImage("");
    };

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim() || !price.trim()) {
            Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
            return;
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
            Alert.alert("Erreur", "Le prix doit être un nombre positif");
            return;
        }

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", name.trim());
            formData.append("description", description.trim());
            formData.append("price", priceNum.toString());
            if (image) {
                const filename = image.split("/").pop() || "photo.jpg";
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append("image", {
                    uri: image,
                    name: filename,
                    type,
                } as any);
            }
            console.log("Submitting form data:", formData);
            const endpoint = editingItem
                ? ENDPOINT_UPDATE_MENU(editingItem.id)
                : ENDPOINT_CREATE_MENU;
            const method = editingItem ? "PATCH" : "POST";

            const res = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: token ? `Bearer ${token}` : "",
                },
                body: formData,
            });

            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || "Erreur lors de la sauvegarde");
            }

            Alert.alert(
                "Succès",
                editingItem ? "Plat modifié avec succès" : "Plat ajouté avec succès"
            );
            setShowModal(false);
            resetForm();
            await fetchMenu();
        } catch (err: any) {
            console.error("handleSubmit error:", err);
            Alert.alert("Erreur", err.message || "Impossible de sauvegarder le plat");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (item: MenuItem) => {
        Alert.alert(
            "Supprimer le plat",
            `Voulez-vous vraiment supprimer "${item.name}" ?`,
            [
                { text: "Annuler", style: "cancel" },
                {
                    text: "Supprimer",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await fetch(ENDPOINT_DELETE_MENU(item.id), {
                                method: "DELETE",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: token ? `Bearer ${token}` : "",
                                },
                            });

                            if (!res.ok) {
                                const txt = await res.text();
                                throw new Error(txt || "Erreur lors de la suppression");
                            }

                            Alert.alert("Succès", "Plat supprimé");
                            await fetchMenu();
                        } catch (err: any) {
                            console.error("handleDelete error:", err);
                            Alert.alert("Erreur", err.message || "Impossible de supprimer le plat");
                        }
                    },
                },
            ]
        );
    };

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.menuCard}>
            <View style={styles.menuCardContent}>
                {item.image ? (
                    <Image source={{ uri: UPLOADS_URL+item.image }} style={styles.menuImage} />
                ) : (
                    <View style={[styles.menuImage, styles.menuImagePlaceholder]}>
                        <Ionicons name="restaurant-outline" size={40} color="#ccc" />
                    </View>
                )}

                <View style={styles.menuInfo}>
                    <Text style={styles.menuName}>{item.name}</Text>
                    <Text style={styles.menuDesc} numberOfLines={2}>
                        {item.description}
                    </Text>
                    <Text style={styles.menuPrice}>{item.price.toFixed(0)} FCFA</Text>
                </View>
            </View>

            <View style={styles.menuActions}>
                <TouchableOpacity
                    style={styles.menuActionBtn}
                    onPress={() => openEditModal(item)}
                >
                    <Ionicons name="create-outline" size={20} color="#2196F3" />
                    <Text style={styles.menuActionText}>Modifier</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.menuActionBtn}
                    onPress={() => handleDelete(item)}
                >
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                    <Text style={[styles.menuActionText, { color: "#F44336" }]}>
                        Supprimer
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <KeyboardAwareScreen scrollable>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mon menu</Text>
                    <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
                        <Ionicons name="add-circle" size={28} color="#D51B20" />
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Ionicons name="restaurant" size={32} color="#D51B20" />
                        <Text style={styles.statValue}>{menuItems.length}</Text>
                        <Text style={styles.statLabel}>Plats au menu</Text>
                    </View>
                </View>

                {/* Menu list */}
                {loading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#D51B20" />
                        <Text style={styles.loadingText}>Chargement du menu...</Text>
                    </View>
                ) : menuItems.length === 0 ? (
                    <View style={styles.centerContent}>
                        <Ionicons name="restaurant-outline" size={80} color="#ddd" />
                        <Text style={styles.emptyTitle}>Votre menu est vide</Text>
                        <Text style={styles.emptySubtitle}>
                            Commencez par ajouter vos premiers plats
                        </Text>
                        <TouchableOpacity style={styles.addFirstBtn} onPress={openAddModal}>
                            <Ionicons name="add-circle-outline" size={24} color="#fff" />
                            <Text style={styles.addFirstBtnText}>Ajouter un plat</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // <FlatList
                    //     data={menuItems}
                    //     keyExtractor={(item) => item.id}
                    //     renderItem={renderMenuItem}
                    //     contentContainerStyle={styles.listContainer}
                    //     showsVerticalScrollIndicator={false}
                    // />
                    <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
                        {menuItems.map((item) => (
                            <View key={item.id}>
                                {renderMenuItem({ item })}
                            </View>
                        ))}
                    </ScrollView>
                )}

                {/* Add/Edit Modal */}
                <Modal visible={showModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingItem ? "Modifier le plat" : "Ajouter un plat"}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                >
                                    <Ionicons name="close" size={28} color="#333" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* Image */}
                                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                    {image ? (
                                        <Image source={{ uri: image }} style={styles.previewImage} />
                                    ) : (
                                        <View style={styles.imagePlaceholder}>
                                            <Ionicons name="camera-outline" size={40} color="#999" />
                                            <Text style={styles.imagePlaceholderText}>
                                                Ajouter une photo
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Name */}
                                <Text style={styles.inputLabel}>Nom du plat *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: Poulet braisé"
                                    value={name}
                                    onChangeText={setName}
                                    placeholderTextColor="#999"
                                />

                                {/* Description */}
                                <Text style={styles.inputLabel}>Description *</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Décrivez votre plat..."
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    placeholderTextColor="#999"
                                />

                                {/* Price */}
                                <Text style={styles.inputLabel}>Prix (FCFA) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Ex: 2500"
                                    value={price}
                                    onChangeText={setPrice}
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />

                                {/* Buttons */}
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                    >
                                        <Text style={styles.cancelBtnText}>Annuler</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.submitBtn}
                                        onPress={handleSubmit}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitBtnText}>
                                                {editingItem ? "Modifier" : "Ajouter"}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        </KeyboardAwareScreen>
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
    addBtn: {},

    statsCard: {
        backgroundColor: "#fff",
        margin: 20,
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    statItem: { alignItems: "center" },
    statValue: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#D51B20",
        marginTop: 10,
    },
    statLabel: { fontSize: 14, color: "#666", marginTop: 5 },

    listContainer: { paddingHorizontal: 20, paddingBottom: 20 },

    menuCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuCardContent: {
        flexDirection: "row",
        marginBottom: 12,
    },
    menuImage: {
        width: 90,
        height: 90,
        borderRadius: 10,
        marginRight: 12,
    },
    menuImagePlaceholder: {
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
    },
    menuInfo: { flex: 1, justifyContent: "space-between" },
    menuName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    menuDesc: { fontSize: 13, color: "#666", lineHeight: 18 },
    menuPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#4CAF50",
        marginTop: 4,
    },

    menuActions: {
        flexDirection: "row",
        justifyContent: "space-around",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        paddingTop: 12,
    },
    menuActionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    menuActionText: {
        fontSize: 14,
        color: "#2196F3",
        marginLeft: 6,
        fontWeight: "500",
    },

    centerContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    loadingText: { marginTop: 15, color: "#666", fontSize: 14 },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#999",
        marginTop: 8,
        textAlign: "center",
    },
    addFirstBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#D51B20",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        marginTop: 20,
    },
    addFirstBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },

    imagePicker: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 20,
    },
    previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
    imagePlaceholder: {
        width: "100%",
        height: "100%",
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderStyle: "dashed",
    },
    imagePlaceholderText: { fontSize: 14, color: "#999", marginTop: 8 },

    inputLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#666",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        fontSize: 15,
        color: "#333",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    textArea: {
        height: 100,
        paddingTop: 12,
    },

    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 20,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 15,
        borderRadius: 10,
        marginRight: 10,
    },
    cancelBtnText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: "#666",
    },
    submitBtn: {
        flex: 1,
        backgroundColor: "#D51B20",
        padding: 15,
        borderRadius: 10,
    },
    submitBtnText: {
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});