import Voice, { type SpeechErrorEvent, type SpeechResultsEvent } from "@react-native-voice/voice";

export async function startSpeechToText(): Promise<string> {
  return new Promise((resolve, reject) => {
    let finalText = "";

    const cleanup = async () => {
      try {
        await Voice.stop();
      } catch {
        // ignore
      }
      try {
        await Voice.destroy();
      } catch {
        // ignore
      }
      try {
        Voice.removeAllListeners();
      } catch {
        // ignore
      }
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      finalText = e.value?.[0] || "";
    };

    Voice.onSpeechEnd = async () => {
      await cleanup();
      resolve(finalText);
    };

    Voice.onSpeechError = async (e: SpeechErrorEvent) => {
      await cleanup();
      reject(e.error);
    };

    Voice.start("en-US").catch(async (err) => {
      await cleanup();
      reject(err);
    });
  });
}
