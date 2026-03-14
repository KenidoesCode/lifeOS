import Foundation
import Speech
import AVFoundation
import React

@objc(VoiceModule)
class VoiceModule: NSObject, RCTBridgeModule {
  static func moduleName() -> String! { "VoiceModule" }
  static func requiresMainQueueSetup() -> Bool { true }

  private let audioEngine = AVAudioEngine()
  private let recognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
  private var request: SFSpeechAudioBufferRecognitionRequest?
  private var task: SFSpeechRecognitionTask?

  @objc(startListening:rejecter:)
  func startListening(_ resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    SFSpeechRecognizer.requestAuthorization { status in
      if status != .authorized {
        reject("NO_PERMISSION", "Speech permission denied", nil)
        return
      }

      DispatchQueue.main.async {
        self.request = SFSpeechAudioBufferRecognitionRequest()
        guard let request = self.request else {
          reject("REQUEST_ERROR", "Could not create recognition request", nil)
          return
        }

        let inputNode = self.audioEngine.inputNode

        self.task?.cancel()
        self.task = self.recognizer?.recognitionTask(with: request) { result, error in
          if let error = error {
            reject("VOICE_ERROR", error.localizedDescription, error)
            self.stop(inputNode: inputNode)
            return
          }

          if let result = result, result.isFinal {
            resolve(result.bestTranscription.formattedString)
            self.stop(inputNode: inputNode)
          }
        }

        let format = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
          request.append(buffer)
        }

        do {
          self.audioEngine.prepare()
          try self.audioEngine.start()
        } catch {
          reject("AUDIO_ERROR", "Could not start audio engine", error)
          self.stop(inputNode: inputNode)
        }
      }
    }
  }

  private func stop(inputNode: AVAudioInputNode) {
    if audioEngine.isRunning {
      audioEngine.stop()
    }
    inputNode.removeTap(onBus: 0)
    request?.endAudio()
    task?.cancel()
    task = nil
    request = nil
  }
}
