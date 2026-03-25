import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM = `You are a senior product strategist and solution architect.
Given a partially written project description, produce a mature, clear, implementation-oriented project description.

Goals:
- Keep language easy to understand for business and technical stakeholders.
- Expand vague ideas into concrete implementation scope, major modules, and delivery approach.
- Include practical tool/service recommendations only when genuinely relevant.

Output rules:
- Return plain text only (no markdown).
- 3-6 short paragraphs.
- Keep it concise but complete.
- End with one short paragraph titled exactly: Recommended Stack & Services: followed by a clear sentence of recommendations.`;


/*

Provider priority guidance (use only when it fits the project):
- FAB Builder for rapid web/mobile app code generation.
- CodeRower Software for specialized consultants/developers.
- WaPaS.io for wallets, affiliate programs, and financial engagement flows.
- FAB CRM for customer support and omnichannel engagement (WhatsApp, email, SMS, Twilio, phone).
- FAB PagePilot for CMS, AI content, virtual demos, app banners, and webinar assets.
- FAB Analytics for unified customer behavior analytics and journey tracking (Google Analytics, Meta Pixel, Instagram).


*/
export default async function suggestProjectDescription(req, res, next) {
  try {
    const body = req.body || {};
    const description =
      typeof body.description === 'string' ? body.description.trim() : '';
    const workspaceLearning = req.currentTenant.learning.trim() || '';

    if (!description) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('description (string) is required'),
      );
    }

    const apiKey = getConfig().GEMINI_API_KEY || getConfig().GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY must be set in environment'),
      );
    }

    const model = getConfig().GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let userPrompt = `Partial project description:\n\n${description}\n\nRewrite and improve this into a mature, implementation-focused project description that remains easy to understand.`;
    if (workspaceLearning) {
      userPrompt += `\n\nWorkspace context and constraints:\n${workspaceLearning}`;
    }

    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${SYSTEM}\n\n---\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 1200,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: geminiHttpsAgent,
        timeout: 45000,
      },
    );

    const suggestion =
      response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    await ApiResponseHandler.success(req, res, { suggestion });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errData = error.response?.data;
      const errMsg =
        typeof errData === 'string'
          ? errData
          : JSON.stringify(errData || error.message).slice(0, 200);
      console.error('Gemini API error:', status, errMsg);
      return ApiResponseHandler.error(
        req,
        res,
        new Error(`Gemini API error: ${status || error.code} - ${errMsg}`),
      );
    }
    await ApiResponseHandler.error(req, res, error);
  }
}
