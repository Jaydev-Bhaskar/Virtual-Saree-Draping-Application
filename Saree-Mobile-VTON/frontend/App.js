import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, Image, TouchableOpacity, 
  ActivityIndicator, ScrollView, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// IMPORTANT: Replace with your machine's local IP address if testing on a physical device.
const API_URL = "http://10.0.2.2:8000/api/v1/try-on"; // 10.0.2.2 is localhost for Android Emulator

export default function App() {
  const [userImage, setUserImage] = useState(null);
  const [sareeImage, setSareeImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickUserImage = async (camera = false) => {
    let permissionResult;
    if (camera) {
      permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    } else {
      permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    }

    if (permissionResult.granted === false) {
      alert("Permission required to access camera/gallery!");
      return;
    }

    let result = camera ? await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    }) : await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setUserImage(result.assets[0].uri);
      setOutputImage(null); // Reset output when new image is uploaded
    }
  };

  const pickSareeImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSareeImage(result.assets[0].uri);
      setOutputImage(null);
    }
  };

  const performTryOn = async () => {
    if (!userImage || !sareeImage) {
      alert("Please upload both your image and a saree image.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('user_image', {
        uri: userImage,
        name: 'user.jpg',
        type: 'image/jpeg'
      });
      formData.append('saree_image', {
        uri: sareeImage,
        name: 'saree.jpg',
        type: 'image/jpeg'
      });
      formData.append('pallu_length', '0.6');
      formData.append('pleats_alignment', 'center');

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });

      // Convert Blob to Base64 for React Native Image component
      const reader = new FileReader();
      reader.onload = () => {
        setOutputImage(reader.result);
        setIsLoading(false);
      };
      reader.readAsDataURL(response.data);

    } catch (error) {
      setIsLoading(false);
      console.error(error);
      alert("Error generating try-on. Ensure backend is running.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saree Try-On</Text>
        <Text style={styles.headerSubtitle}>AI-Powered Virtual Draping</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Your Photo</Text>
        {userImage ? (
          <Image source={{ uri: userImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>No Image Selected</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={() => pickUserImage(true)}>
            <Text style={styles.buttonText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => pickUserImage(false)}>
            <Text style={styles.buttonText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>2. Saree Image</Text>
        {sareeImage ? (
          <Image source={{ uri: sareeImage }} style={styles.previewImage} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>Select a Saree</Text>
          </View>
        )}
        <TouchableOpacity style={styles.buttonMain} onPress={pickSareeImage}>
          <Text style={styles.buttonText}>Upload Saree</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E91E63" />
            <Text style={styles.loadingText}>Draping Saree & Adjusting Folds...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.buttonTryOn, (!userImage || !sareeImage) && styles.buttonDisabled]} 
            onPress={performTryOn}
            disabled={!userImage || !sareeImage}
          >
            <Text style={styles.buttonTryOnText}>✨ Apply Virtual Try-On</Text>
          </TouchableOpacity>
        )}
      </View>

      {outputImage && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Result (Near Real-Life)</Text>
          <Image source={{ uri: outputImage }} style={styles.resultImage} />
          <TouchableOpacity style={styles.buttonShare}>
            <Text style={styles.buttonText}>Save & Share</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Premium light background
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFCDD2',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#FFF',
    margin: 15,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  placeholderBox: {
    width: '100%',
    height: 150,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#FAFAFA'
  },
  placeholderText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonMain: {
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#9C27B0',
    fontWeight: '600',
    fontSize: 16,
  },
  actionContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  buttonTryOn: {
    backgroundColor: '#E91E63',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#BDBDBD',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonTryOnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '500',
  },
  resultImage: {
    width: '100%',
    height: 400,
    borderRadius: 15,
    marginBottom: 15,
  },
  buttonShare: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  }
});
