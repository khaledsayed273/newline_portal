import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // ========== Bunny Video Proxy ==========
  // جلب رابط الفيديو المؤمن من Bunny.net عبر API نيولاين
  // كاش للتوكن
  let cachedToken: string | null = null;
  let tokenExpiry = 0;
  let cachedVideos: any[] = [];
  let videosCacheTime = 0;

  async function getTasheelToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
    const resp = await fetch('https://api.new-line.sa/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({ email: 'jza.o@new-line.sa', password: '101010' }),
    });
    const data = await resp.json() as any;
    cachedToken = data?.tokens?.access_token;
    tokenExpiry = Date.now() + 14 * 60 * 1000; // 14 minutes
    return cachedToken!;
  }

  async function getTasheelVideos(): Promise<any[]> {
    // كاش لمدة 3 دقائق (token صالح لساعة)
    if (cachedVideos.length > 0 && Date.now() < videosCacheTime) return cachedVideos;
    const token = await getTasheelToken();
    const resp = await fetch('https://api.new-line.sa/v1/trainings', {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    const data = await resp.json() as any;
    cachedVideos = [
      ...(data?.supervisor?.videos || []),
      ...(data?.drivers?.videos || []),
    ];
    videosCacheTime = Date.now() + 3 * 60 * 1000; // 3 minutes
    return cachedVideos;
  }

  app.get('/api/bunny-token/:videoId', async (req, res) => {
    try {
      const { videoId } = req.params;
      const videos = await getTasheelVideos();
      // البحث بالـ UUID في حقل url
      const video = videos.find((v: any) => v.url === videoId || v.url?.includes(videoId));
      if (video?.video_url) {
        return res.json({
          embedUrl: video.video_url,
          tasheelUrl: `https://tasheel.new-line.sa/trainings`,
          title: video.title,
        });
      }
      // إذا لم يوجد في القائمة، نعيد المحاولة بدون كاش
      videosCacheTime = 0;
      const freshVideos = await getTasheelVideos();
      const freshVideo = freshVideos.find((v: any) => v.url === videoId || v.url?.includes(videoId));
      if (freshVideo?.video_url) {
        return res.json({
          embedUrl: freshVideo.video_url,
          tasheelUrl: `https://tasheel.new-line.sa/trainings`,
          title: freshVideo.title,
        });
      }
      return res.status(404).json({ error: 'Video not found', videoId });
    } catch (err) {
      console.error('Bunny proxy error:', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
