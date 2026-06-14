import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Helper to safely get the Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured. Please add it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Complaint Search Grounding API
app.post("/api/complaint-grounding", async (req, res) => {
  try {
    const { productName, companyName, productModel } = req.body;
    if (!productName || !companyName) {
      return res.status(400).json({ error: "Product Name and Company Name are required." });
    }

    const ai = getGeminiClient();
    const prompt = `Search for official complaint details, tech specs, known issues, and customer support channels for the product: "${productName}" (Model: "${productModel || "unknown"}") manufactured by "${companyName}". 
    Provide a well-structured summary of:
    1. Typical issues or complaints reported for this product.
    2. Official customer service contact channels (phone, email, support portal link).
    3. Suggested corrective action or response timeline.
    Include Google search grounding source web URLs transparently so the user can click and reference them.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    // Grab grounding metadata if available to return exact source web matches
    const searchChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = searchChunks.map((chunk: any) => ({
      title: chunk.web?.title || "Search Reference",
      url: chunk.web?.uri || "",
    })).filter((s: any) => s.url);

    res.json({ text, sources });
  } catch (err: any) {
    console.error("Grounding error:", err.message);
    res.status(500).json({ error: err.message || "Failed to search product details." });
  }
});

// 2. AI Product Image Mockup API using gemini-3.1-flash-image with Imagen fallback
app.post("/api/generate-product-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const ai = getGeminiClient();
    let base64Image = "";

    try {
      // Primary search-backed image creation
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: `A clean, professional product illustration/mockup of ${prompt}. Studio lighting, elegant design representation, white clean background.` }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: "512px",
          },
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData?.data) {
            base64Image = part.inlineData.data;
            break;
          }
        }
      }
    } catch (primaryErr: any) {
      console.warn("Primary gemini-3.1-flash-image failed, trying imagen-4.0 fallback...", primaryErr.message);
      
      // Fallback 1: Imagen-4
      try {
        const imagenResponse = await ai.models.generateImages({
          model: "imagen-4.0-generate-001",
          prompt: `A clean, professional product illustration of ${prompt}, studio lighting, simple clean presentation`,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: "1:1",
          },
        });
        
        if (imagenResponse.generatedImages?.[0]?.image?.imageBytes) {
          base64Image = imagenResponse.generatedImages[0].image.imageBytes;
        }
      } catch (fallbackErr: any) {
        console.error("All image generation endpoints failed:", fallbackErr.message);
        throw new Error("Unable to build image. Check if your API key has Image Generation permissions enabled.");
      }
    }

    if (!base64Image) {
      throw new Error("No image data returned from Gemini API");
    }

    res.json({ imageUrl: `data:image/jpeg;base64,${base64Image}` });
  } catch (err: any) {
    console.error("Image generator error:", err.message);
    res.status(500).json({ error: err.message || "Failed to generate AI product image." });
  }
});

// Setup Vite Dev server or Serve production assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Product Complaint Manager Server running on http://localhost:${PORT}`);
  });
}

startServer();
