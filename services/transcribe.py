import sys
import json
import os
from faster_whisper import WhisperModel

def transcribe(audio_path):
    if not os.path.exists(audio_path):
        print(json.dumps({"error": "File not found"}))
        return

    try:
        print(json.dumps({"status": "loading_model"}))
        # standard, small, medium, large-v2, large-v3
        # Switch to 'tiny' for maximum speed on CPU
        model_size = "tiny" 
        
        # Run on GPU with FP16 if available, else CPU with INT8
        import torch
        device = "cuda" if torch.cuda.is_available() else "cpu"
        compute_type = "float16" if device == "cuda" else "int8"
        
        print(json.dumps({"status": "starting_transcription", "device": device, "model": model_size}))

        model = WhisperModel(model_size, device=device, compute_type=compute_type)

        segments, info = model.transcribe(audio_path, word_timestamps=True)
        
        words_list = []
        full_text = []

        print(json.dumps({"status": "processing_segments"}))

        for segment in segments:
            for word in segment.words:
                words_list.append({
                    "word": word.word.strip(),
                    "start": word.start,
                    "end": word.end
                })
            full_text.append(segment.text.strip())

        output = {
            "text": " ".join(full_text),
            "words": words_list
        }

        print(json.dumps(output))

    except Exception as e:
        error_out = {"error": str(e)}
        print(json.dumps(error_out))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)
    
    transcribe(sys.argv[1])
