import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import Header from './components/Header';


function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [emotion, setEmotion] = useState<string>('Carregando...');

  const emotionMap: { [key: string]: string } = {
    happy: '😃 Você está feliz. Aproveite!',
    sad: '😢 Você está um pouco triste hoje.',
    angry: '😡 Por que a expressão brava?',
    surprised: '😲 Parece que há alguma surpresa por aí!',
    fearful: '😨 Do que você tem medo?',
    disgusted: '🤢 Sua expressão é enjoada.',
    neutral: '😐 Está com uma expressão neutra.',
  };

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (error) {
        console.error('Erro ao acessar a webcam:', error);
      }
    }

    async function loadModels() {
      
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');

      detectFaces();
    }

    async function detectFaces() {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const displaySize = { width: video.videoWidth, height: video.videoHeight };

        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

          if (resizedDetections[0]?.expressions) {
            const expressions = resizedDetections[0].expressions;
            const maxExpression = Object.entries(expressions).reduce((a, b) =>
              a[1] > b[1] ? a : b
            )[0];
            setEmotion(maxExpression);
          }
        }, 100);
      }
    }

    setupWebcam();
    loadModels();
  }, []);

  return (
    <main className="min-h-screen flex flex-col lg:flex-row md:justify-between gap-14 xl:gap-40 p-10 items-center container mx-auto">
      <Header />
      <section className="flex flex-col gap-6 flex-1 w-full">
        <div className="bg-white rounded-xl p-2">
          <div className="relative flex items-center justify-center aspect-video w-full">
            {/* Webcam */}
            <video
              ref={videoRef}
              className="aspect-video rounded-lg bg-gray-300 w-full"
            ></video>
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            ></canvas>
            {/* Webcam */}
          </div>
        </div>
        <div
          className={`bg-white rounded-xl px-8 py-6 flex gap-6 lg:gap-20 items-center h-[200px] justify-center`}
        >
         <p className="text-4xl text-center flex justify-center items-center text-custom-color">
          <span
           dangerouslySetInnerHTML={{
          __html:
           emotionMap[emotion]?.replace(
            /(Feliz|Triste|Brava|Surpresa|Medo|Enjoada|Neutra)/,
            '<strong class="font-bold">$1</strong>'
          ) || 'Carregando...',
           }}
          />
        </p>
      </div>
    </section>
    </main>
  );
}

export default App;
