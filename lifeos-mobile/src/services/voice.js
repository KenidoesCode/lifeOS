import Voice from "@react-native-voice/voice";

export async function startSpeechToText() {
  return new Promise((resolve, reject) => {
    let finalText = "";

    Voice.onSpeechResults = (e) => {
      finalText = e.value?.[0] || "";
    };

    Voice.onSpeechEnd = async () => {
      await Voice.stop();
      resolve(finalText);
    };

    Voice.onSpeechError = (e) => {
      reject(e.error);
    };

    Voice.start("en-US");
  });
}
