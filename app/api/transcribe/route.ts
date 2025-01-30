import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Force WASM backend
    const { pipeline, env } = await import('@xenova/transformers')
    env.backends.onnx.wasm.numThreads = 1
    env.useBrowserCache = false
    env.backends.onnx.useNodePolyfills = false
    
    const arrayBuffer = await audioFile.arrayBuffer()
    const audioData = new Float32Array(arrayBuffer)
    
    const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
      quantized: true,
      revision: 'main',
      wasmSettings: {
        numThreads: 1,
        proxy: false
      }
    })

    const result = await transcriber(audioData, {
      chunk_length_s: 30,
      stride_length_s: 5
    })

    const text = Array.isArray(result) 
      ? result[0]?.text || '' 
      : 'text' in result ? result.text : ''
      
    return NextResponse.json({ text })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    )
  }
} 