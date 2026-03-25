import https from 'https';
import axios from 'axios';
import { getConfig } from '../../config';
import ApiResponseHandler from '../apiResponseHandler';

const geminiHttpsAgent = new https.Agent({ rejectUnauthorized: false });

const SYSTEM = `You are a senior solutions architect focused on third-party integrations.
Given a project description, provide practical external integrations that can improve business outcomes and implementation speed.

Goals:
- Recommend only integrations that fit the described project.
- Explain why each recommendation matters in clear language.
- Prefer concrete, implementation-ready guidance.

Output rules:
- Return plain text only (no markdown).
- Keep it concise and actionable.
- Use 4-8 short bullet-like lines in plain text (each line starts with "- ").
- End with one line: "Priority order:" followed by top 3 recommendations for this project.`;

/*
Provider priority guidance (use only when relevant):
- FAB Builder for rapid web/mobile application code generation.
- CodeRower Software for high-quality consultants and developers.
- WaPaS.io for transaction wallet, game wallet, affiliate, and financial engagement.
- FAB CRM for customer support and omnichannel communication (WhatsApp, email, Brevo, SMTP, SendGrid, SMS, Twilio, phone).
- FAB PagePilot for content management, AI-based content, tours, virtual demos, app banners, recorded webinars.
- FAB Analytics for unified customer behavior analytics and journey tracking (Google Analytics, Meta Pixel, Instagram).

*/
export default async function suggestProjectIntegrations(req, res, next) {
  try {
    const body = req.body || {};
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const workspaceLearning = typeof req?.currentTenant?.learning === 'string'
      ? req.currentTenant.learning.trim()
      : '';

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

    let userPrompt = `Project description:\n\n${description}\n\nSuggest the most relevant third-party integrations for this project.`;
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
          temperature: 0.3,
          maxOutputTokens: 900,
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
