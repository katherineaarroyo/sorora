import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function AboutUsScreen() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Who We Are */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="shield-checkmark"
            size={36}
            color="#000"
            style={{ marginRight: 6, marginTop: 18 }}
          />
          <Text style={styles.header}>{"Who We Are"}</Text>
        </View>
        <Text style={styles.message}>
          {
            "Sorora is a women-led foundation, created by women, for the protection of women. "
          }
        </Text>
        <Text style={styles.message}>
          {
            "Our mission is simple: to help women feel secure, connected, and safe."
          }
        </Text>

        {/* Our Story */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons
            name="heart"
            size={36}
            color="#000"
            style={{ marginRight: 6, marginTop: 18 }}
          />
          <Text style={styles.header}>{"Our Story"}</Text>
        </View>
        <Text style={styles.message}>
          {
            "Sorora was founded by Hemali Chudasama, Ashwini Gamage, Melanie Gonzales, and Saron Daniel"
          }
          {"— four recent high school graduates from Cobourg, Ontario."}
        </Text>
        <Text style={styles.message}>
          {
            "Originally known as 'Keep Her Safe', Sorora was created from our own experiences of feeling unsafe."
          }
        </Text>

        {/* Our Mission */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MaterialCommunityIcons
            name="bullseye-arrow"
            size={36}
            color="#000"
            style={{ marginRight: 6, marginTop: 18 }}
          />
          <Text style={styles.header}>{"Our Mission"}</Text>
        </View>
        <Text style={styles.message}>
          {"At Sorora, we believe everyone deserves to feel safe. "}
        </Text>
        <Text style={styles.message}>
          {
            "With support from the Cobourg Police and Nventure through the Police Tech Accelerator,"
          }
          {
            " we developed Sorora to be simple, fast, and reliable. In moments of danger, every second matters."
          }
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: "#F8EDED",
  },
  // headers
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 16,
  },

  // Warning text styling
  message: {
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
});
