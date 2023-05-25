import React, { useState, useEffect } from "react";
import { Button, View } from "react-native";
import Voice from "react-native-voice";
import Tts from "react-native-tts";
import { PorcupineManager } from "@picovoice/porcupine-react-native";
import * as FileSystem from "react-native-fs";

const ACCESS_KEY_PATH = "./src/PPN Data/serial_key.txt";
const OK_CHEFF_PPN_PATH = "./src/PPN Data/okCheff.ppn";

async function readAccessKey() {
  try {
    const key = await FileSystem.readFile(ACCESS_KEY_PATH, "utf8");
    return key.trim(); // Remove any trailing or leading whitespace
  } catch (err) {
    console.error("Could not read access key:", err);
    return null;
  }
}

export default function App() {
  const [porcupineManager, setPorcupineManager] = useState(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    setupPorcupine();
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
      porcupineManager?.delete();
    };
  }, []);

  const setupPorcupine = async () => {
    const accessKey = await readAccessKey();
    if (!accessKey) return;
    const manager = await PorcupineManager.fromKeywordPaths(
      accessKey,
      [OK_CHEFF_PPN_PATH],
      onWakeWordDetected
    );
    setPorcupineManager(manager);
  };

  const startListening = () => {
    setIsListening(true);
    porcupineManager?.start();
  };

  const onWakeWordDetected = () => {
    porcupineManager?.stop();
    Voice.start("en-US");
  };

  const onSpeechResults = async (e) => {
    Voice.stop();
    const text = e.value[0]; // this will be the user's spoken input
    const response = await processUserInput(text); // this function processes the user's input and returns a string
    Tts.speak(response);
    setIsListening(false);
  };

  return (
    <View>
      <Button
        title="Start Listening"
        onPress={startListening}
        disabled={isListening}
      />
    </View>
  );
}
