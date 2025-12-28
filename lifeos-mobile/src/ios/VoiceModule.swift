import Speech
import AVFoundation

@objc(VoiceModule)
class VoiceModule: NSObject {

  let audioEngine = AVAudioEngine()
  let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
  var request: SFSpeechAudioBufferRecognitionRequest?
  var task: SFSpeechRecognitionTask?

  @objc
  func startListening(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: RCTPromiseRejectBlock) {

    SFSpeechRecognizer.requestAuthorization { status in
      if status != .authorized {
        reject("NO_PERMISSION", "Speech permission denied", nil)
        return
      }

      self.request = SFSpeechAudioBufferRecognitionRequest()
      let inputNode = self.audioEngine.inputNode

      self.task = self.recognizer?.recognitionTask(with: self.request!) { result, error in
        if let result = result, result.isFinal {
          resolve(result.bestTranscription.formattedString)
          self.audioEngine.stop()
          inputNode.removeTap(onBus: 0)
        }
      }

      let format = inputNode.outputFormat(forBus: 0)
      inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) {
        (buffer, _) in
        self.request?.append(buffer)
      }

      self.audioEngine.prepare()
      try? self.audioEngine.start()
    }
  }
}
