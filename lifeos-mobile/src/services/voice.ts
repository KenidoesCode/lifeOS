import { NativeModules } from "react-native";

export async function startSpeechToText() {
  return await NativeModules.VoiceModule.startListening();
}
