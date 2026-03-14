import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class VoiceModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "VoiceModule"

  @ReactMethod
  fun startListening(promise: Promise) {
    val recognizer = SpeechRecognizer.createSpeechRecognizer(reactContext)

    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
      putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
      putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
      putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
      putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
    }

    recognizer.setRecognitionListener(object : RecognitionListener {
      override fun onResults(results: Bundle) {
        val text = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
        promise.resolve(text ?: "")
        recognizer.destroy()
      }

      override fun onError(error: Int) {
        promise.reject("VOICE_ERROR", "Speech recognition failed ($error)")
        recognizer.destroy()
      }

      override fun onReadyForSpeech(params: Bundle?) {}
      override fun onBeginningOfSpeech() {}
      override fun onRmsChanged(rmsdB: Float) {}
      override fun onBufferReceived(buffer: ByteArray?) {}
      override fun onEndOfSpeech() {}
      override fun onPartialResults(partialResults: Bundle?) {}
      override fun onEvent(eventType: Int, params: Bundle?) {}
    })

    recognizer.startListening(intent)
  }
}

class VoicePackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(VoiceModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
