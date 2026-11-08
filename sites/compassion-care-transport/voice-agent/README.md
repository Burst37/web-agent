# Conversational voice repair - staged

Selected voice: Ebony (Ashley), ElevenLabs vzb1D7zjti0h5u8StSra. Verified account metadata describes a middle-aged African-American female voice. Model: eleven_flash_v2_5; speed 1.06. Successful live TTS sample generated.

Intelligence: server-side Gemini chat route with multi-turn context and a source-backed transportation system prompt. GEMINI_API_KEY must be configured with the user's authorization. The existing ElevenLabs key can synthesize speech, but cannot create ElevenAgents because convai_write permission is absent.

Browser microphone recognition sends final transcript to the chat route. The reply is displayed and streamed through ElevenLabs. No browser/device synthetic speech fallback. Text mode remains available; voice mode releases the microphone and stops audio when closed or hidden. The frontend retains the latest ten messages in tab memory only.

Required server secrets: ELEVENLABS_API_KEY and GEMINI_API_KEY. Optional ELEVENLABS_VOICE_ID and CARE_CHAT_MODEL. Never place keys in source, ZIP, HTML or browser code.

Chat credential use is awaiting explicit authorization following an automatic approval rejection. No Gemini provider test is claimed. Phone answering and calendar remain disconnected.

Verification: six API tests passed with mocked conversation calls; ElevenLabs real TTS succeeded. Human microphone/audio end-to-end and real Gemini reply testing remain to complete after authorization. In-memory request limits are per-instance safeguards, not distributed rate limits.
