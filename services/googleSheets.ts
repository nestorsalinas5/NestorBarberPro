import { GoogleGenAI } from "https://aistudiocdn.com/google-genai-sdk@0.0.3";
import type { Booking } from '../types';

// FIX: Aligned with Gemini API guidelines by removing `as string`. Assumes API_KEY is set in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates syncing a booking to a Google Sheet by using the Gemini API
 * to format the booking data into a CSV row.
 * @param booking - The booking object containing all appointment details.
 * @returns A promise that resolves to a string formatted as a CSV row.
 */
export const syncBookingToSheet = async (booking: Omit<Booking, 'id' | 'status' | 'time'> & { time: string }): Promise<string> => {
  const { service, date, time, customer } = booking;
  
  // Format the date as YYYY-MM-DD
  const formattedDate = date.toISOString().split('T')[0];

  const prompt = `You are an API endpoint that receives booking information in JSON format. 
Your task is to convert this information into a single, comma-separated CSV row that can be appended to a Google Sheet.
The required columns are: ID_RESERVA, FECHA, HORA, SERVICIO, DURACION_MIN, PRECIO_PYG, NOMBRE_CLIENTE, EMAIL_CLIENTE, TELEFONO_CLIENTE, ESTADO.
- Generate a unique booking ID using random letters and numbers (e.g., 8-character alphanumeric).
- The FECHA must be in YYYY-MM-DD format.
- Wrap the SERVICIO and NOMBRE_CLIENTE in double quotes to handle potential commas.
- The ESTADO should always be 'Confirmada'.
- Do not add headers or any other explanatory text, only the single CSV row.

Booking Data:
${JSON.stringify({
  date: formattedDate,
  time: time,
  serviceName: service.name,
  duration: service.duration,
  price: service.price,
  customerName: customer.name,
  customerEmail: customer.email,
  customerPhone: customer.phone || 'N/A'
}, null, 2)}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
          temperature: 0.2, // Low temperature for deterministic output
      }
    });
    
    // Return the generated CSV row, trimming any extra whitespace.
    return response.text.trim();
  } catch (error) {
    console.error("Error generating Google Sheet row:", error);
    throw new Error("Failed to format booking for Google Sheets.");
  }
};
