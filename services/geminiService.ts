import { GoogleGenAI, Type } from "@google/genai";
import { PaletteResponse } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PALETTE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    palette: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hex: { type: Type.STRING, description: "The 6-digit hex code of the color, starting with #" },
          name: { type: Type.STRING, description: "A creative name for the color" },
          description: { type: Type.STRING, description: "A brief description of the color's presence or mood" }
        },
        required: ["hex", "name", "description"]
      }
    }
  }
};

export const extractColorsFromImage = async (base64Images: string[]): Promise<PaletteResponse> => {
  try {
    const imageParts = base64Images.map(img => {
      // Remove data URL prefix if present to get raw base64
      const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
      return {
        inlineData: {
          mimeType: "image/png", 
          data: base64Data
        }
      };
    });

    const promptText = base64Images.length > 1 
      ? "Analyze this collection of images. First, identify the primary subject or object in each image (e.g., a specific rock, a plant, an animal, a product). CRITICAL: Ignore background elements such as the sky, ground, shadows, or generic surroundings. Extract a unified main color palette consisting of 5 to 10 distinct, dominant colors strictly from these identified subjects. For each color, provide the Hex code, a creative name, and a very short description of its specific location on the object."
      : "Analyze this image. First, identify the primary subject or object (e.g., a specific rock, a plant, an animal). CRITICAL: Ignore background elements such as the sky, ground, shadows, or generic surroundings. Extract a main color palette consisting of 5 to 10 distinct, dominant colors strictly from this subject. For each color, provide the Hex code, a creative name, and a very short description of its specific location on the object.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          ...imageParts,
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PALETTE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as PaletteResponse;

  } catch (error) {
    console.error("Error extracting colors:", error);
    throw error;
  }
};

export const extractColorsFromLocation = async (location: string, focusDescription?: string): Promise<PaletteResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Analyze the real-world satellite imagery of the following location: "${location}".
            ${focusDescription ? `\nFocus specifically on: ${focusDescription}` : ''}
            
            Visualize the location from a top-down satellite view at maximum zoom (Zoom Level 20+).
            Focus on the specific details visible at this location such as:
            - Rooftop materials (shingles, metal, clay tile, concrete)
            - Pavement surfaces (asphalt, concrete, dirt paths)
            - Natural vegetation (trees, grass, soil types)
            - Water bodies
            - Shadows and lighting conditions typical for satellite imagery.
            
            Extract a main color palette consisting of 5 to 10 distinct, dominant colors that would be visible in this specific satellite view.
            For each color, provide the Hex code, a creative name, and a short description of what feature it represents in the satellite image.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PALETTE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as PaletteResponse;

  } catch (error) {
    console.error("Error analyzing location:", error);
    throw new Error("Failed to analyze location. Please check the address and try again.");
  }
};

export const extractColorsFromStreetLocation = async (location: string, focusDescription?: string): Promise<PaletteResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Analyze the real-world appearance of the following location: "${location}".
            ${focusDescription ? `\nFocus specifically on: ${focusDescription}` : ''}
            
            Visualize this location from a Street View perspective (Eye-level, standing at the curb looking at the property).
            
            CRITICAL: Ignore the roof. Focus on the vertical facade and street-level details such as:
            - Exterior wall materials (Brick, Stucco, Wood Siding, Stone)
            - Front Door and Entryway colors
            - Window frames, shutters, and trim
            - Front yard landscaping (hedges, flower beds, fences)
            - Driveway and walkway textures at ground level
            
            Extract a main color palette consisting of 5 to 10 distinct, dominant colors that characterize the "Curb Appeal" of this location.
            For each color, provide the Hex code, a creative name, and a short description of what feature it represents (e.g., "Front Door Red", "Limestone Facade").`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PALETTE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as PaletteResponse;

  } catch (error) {
    console.error("Error analyzing street location:", error);
    throw new Error("Failed to analyze street view. Please check the address and try again.");
  }
};

export const extractColorsFromHybrid = async (base64Images: string[], location: string, focusDescription?: string): Promise<PaletteResponse> => {
  try {
    const imageParts = base64Images.map(img => {
      const base64Data = img.replace(/^data:image\/\w+;base64,/, "");
      return {
        inlineData: {
          mimeType: "image/png", 
          data: base64Data
        }
      };
    });

    const promptText = `
      Perform a Hybrid Design Analysis.
      
      Input 1: The attached images (Mood Board / Inspiration).
      CRITICAL NOTE for Input 1: Isolate the main object/subject in these images. Ignore background noise like sky, grass, or walls.
      
      Input 2: Real-world satellite imagery of location: "${location}".
      ${focusDescription ? `\nFocus specifically on: ${focusDescription}` : ''}

      Task:
      1. Analyze the visual style and colors of the *main subjects* in the attached inspiration images.
      2. Mentalize/Visualize the satellite imagery of the provided location at high zoom (roofs, landscape, pavement).
      3. Generate a cohesive color palette (5-10 colors) that bridges these two inputs. 
      
      The palette should be suitable for a design project at this location that honors the site's physical context (satellite view) while achieving the aesthetic goals of the inspiration object(s).

      For each color, explain why it was chosen (e.g., "Pulled from the rock's mineral streak to contrast with the location's slate roof").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          ...imageParts,
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PALETTE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as PaletteResponse;

  } catch (error) {
    console.error("Error extracting hybrid colors:", error);
    throw error;
  }
};

export const getCoordinatesFromLocation = async (location: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            text: `Convert this address/location into GPS coordinates (Latitude, Longitude): "${location}". 
            Only return the numbers separated by a comma (e.g. 40.7128,-74.0060). Do not add any text.`
          }
        ]
      }
    });

    return response.text?.trim() || location;
  } catch (error) {
    console.error("Error getting coordinates:", error);
    return location;
  }
};