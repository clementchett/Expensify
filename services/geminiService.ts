import { GoogleGenAI } from "@google/genai";
import { Expense } from '../types';
import { calculateTotalAnnual } from './expenseUtils';

const apiKey = process.env.API_KEY || '';

export const analyzeExpenses = async (expenses: Expense[]): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Unable to fetch AI insights.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare a summary of the data for the model
  const summary = expenses.map(e => ({
    name: e.name,
    category: e.category,
    frequency: e.frequency,
    amount: e.amount,
    annualTotal: calculateTotalAnnual(e)
  }));

  const totalBudget = summary.reduce((acc, curr) => acc + curr.annualTotal, 0);

  const prompt = `
    You are a financial advisor. Analyze the following expense list for a personal budget.
    Currency: INR
    Total Annual Budget: ₹${totalBudget}
    Expenses: ${JSON.stringify(summary, null, 2)}

    Please provide a concise analysis (max 3 bullet points) covering:
    1. The biggest cost drivers and category breakdown.
    2. Any unusual frequency patterns or potential optimization.
    3. A brief tip for saving money based on these categories.
    
    Keep the tone professional yet encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to analyze expenses. Please try again later.";
  }
};
