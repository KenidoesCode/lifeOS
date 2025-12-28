class VoiceModule(reactContext: ReactApplicationContext)
  : ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "VoiceModule"

  @ReactMethod
  fun startListening(promise: Promise) {
    val recognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)

    val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,
      RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)

    recognizer.setRecognitionListener(object : RecognitionListener {
      override fun onResults(results: Bundle) {
        val text = results.getStringArrayList(
          SpeechRecognizer.RESULTS_RECOGNITION
        )?.get(0)
        promise.resolve(text)
      }

      override fun onError(error: Int) {
        promise.reject("VOICE_ERROR", "Speech failed")
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
