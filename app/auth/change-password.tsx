import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ChangePasswordProps {}

const ChangePassword: React.FC<ChangePasswordProps> = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const styles = themedStyles("light");
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şifre Değiştir</Text>
      <TextInput
        style={styles.input}
        placeholder="Eski Şifre"
        placeholderTextColor={"#666"}
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Yeni Şifre"
        placeholderTextColor={"#666"}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Şifreyi Güncelle</Text>
      </TouchableOpacity>
    </View>
  );
};

const themedStyles = (_theme: "light") =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 24,
      marginHorizontal: "1%",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#181818",
      marginBottom: 32,
    },
    input: {
      width: 320,
      padding: 12,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      backgroundColor: "#fafafa",
      color: "#181818",
      fontSize: 16,
    },
    button: {
      marginTop: 24,
      backgroundColor: "#181818",
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default ChangePassword;
