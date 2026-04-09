import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { create, all } from 'mathjs';

const math = create(all);

// Simple verification helper that attempts to evaluate the model's `calculation`
// or the original question and compare against the reported `answer`.
function tryParseNumber(v) {
  if (v === null || v === undefined) return null;
  const n = Number(String(v).replace(/[^0-9eE.+-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function toDegreeAwareExpression(expr) {
  // convert sin90 or sin 90 to sin(90 deg) to evaluate as degrees
  return expr.replace(/\b(sin|cos|tan)\s*\(?\s*([0-9.]+)\s*\)?/gi, (m, fn, num) => {
    return `${fn}(${num} deg)`;
  });
}

function verifySolution(p, question) {
  try {
    const reported = p.answer;
    const reportedNum = tryParseNumber(reported);

    // prefer machine-calculation if provided
    let calcExpr = p.calculation || '';
    if (!calcExpr || calcExpr.trim() === '') {
      // try using the raw question as an expression
      calcExpr = question || '';
    }
    calcExpr = String(calcExpr).trim();
    if (!calcExpr) return { valid: null, reason: 'no-calculation' };

    // make degree-friendly for trig like sin90 -> sin(90 deg)
    const evalExpr = toDegreeAwareExpression(calcExpr);
    let expected;
    try {
      expected = math.evaluate(evalExpr);
    } catch (e) {
      return { valid: null, reason: 'cannot-evaluate', error: String(e) };
    }

    const expectedNum = tryParseNumber(expected);
    if (expectedNum === null || reportedNum === null) {
      // not numeric - can't validate
      return { valid: null, reason: 'non-numeric', expected: String(expected) };
    }

    const diff = Math.abs(expectedNum - reportedNum);
    const valid = diff < 1e-6;
    return { valid, expected: expectedNum, reported: reportedNum, diff };
  } catch (e) {
    return { valid: null, reason: 'verification-error', error: String(e) };
  }
}

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const USE_MOCK = String(process.env.USE_MOCK || '').toLowerCase() === 'true';

if (!API_KEY && !USE_MOCK) {
  console.warn("Warning: ANTHROPIC_API_KEY is not set in environment and USE_MOCK is not enabled. Set ANTHROPIC_API_KEY or enable USE_MOCK=true.");
}

// Serve the frontend HTML at root
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "mathai-doubt-solver.html"));
});

app.post("/solve", async (req, res) => {
  try {
    const { topic, question } = req.body;

    if (!question) return res.status(400).json({ error: "Missing question" });

    // If mock mode enabled, short-circuit and return a deterministic mock + validation
    if (USE_MOCK) {
      const qText = (question || '').toString();
      const inferredTopic = topic || 'Algebra';
      const mockObj = { topic: inferredTopic, steps: [], answer: '', tip: '', calculation: '' };

      if (/sin\s*\(?\s*90\s*\)?/i.test(qText)) {
        mockObj.topic = 'Trigonometry';
        mockObj.steps.push({ title: 'Interpret', explanation: 'Interpret the expression as sine of 90 degrees.', math: 'sin(90°) = 1' });
        mockObj.answer = '1';
        mockObj.calculation = 'sin(90 deg)';
        mockObj.tip = 'Angles without units are interpreted as degrees in this mock.';
      } else {
        const arithmeticMatch = qText.match(/^\s*([0-9.]+)\s*([+\-\*\/])\s*([0-9.]+)\s*$/);
        if (arithmeticMatch) {
          const a = parseFloat(arithmeticMatch[1]);
          const op = arithmeticMatch[2];
          const b = parseFloat(arithmeticMatch[3]);
          let resVal = null;
          switch (op) {
            case '+': resVal = a + b; break;
            case '-': resVal = a - b; break;
            case '*': resVal = a * b; break;
            case '/': resVal = (b !== 0) ? (a / b) : 'Infinity'; break;
          }
          mockObj.steps.push({ title: 'Interpret', explanation: `We interpret the expression ${qText} as arithmetic addition/subtraction.`, math: `${a} ${op} ${b} = ${resVal}` });
          mockObj.answer = String(resVal);
          mockObj.calculation = `${a}${op}${b}`;
          mockObj.tip = 'Remember order of operations.';
        } else {
          mockObj.steps.push({ title: 'Approach', explanation: `This is a mock response for: ${qText}`, math: '' });
          mockObj.answer = '—';
          mockObj.tip = 'Provide a numeric or clearer question for the mock responder.';
        }
      }

      const mock = { content: [ { text: '```json\n' + JSON.stringify(mockObj) + '\n```' } ] };
      const verification = verifySolution(mockObj, question);
      return res.json({ content: mock.content, _parsed: mockObj, _validation: verification });
    }

    const systemPrompt = `You are an expert math tutor. Return ONLY JSON (no extra text) matching this schema:\n{"topic":"","steps":[{"title":"","explanation":"","math":""}],"answer":"","calculation":"","confidence":0.0,"tip":""}\nThe field \"calculation\" must be a machine-evaluable expression (e.g. 2+2 or sin(90 deg)). \"confidence\" must be a number between 0 and 1 indicating model confidence.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Topic: ${topic}\nProblem: ${question}`
          }
        ]
      })
    });

    // Read response as text first so we can surface clear errors when parsing fails
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (!response.ok) {
      // If the upstream auth failed, provide a useful mock response so the
      // frontend can be tested locally without a working Anthropic key.
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const errType = parsed?.error?.type || parsed?.type || null;
        if (errType === 'authentication_error' || USE_MOCK) {
            // Create a simple dynamic mock response driven by the incoming question
            const qText = (question || '').toString();
            const inferredTopic = topic || 'Algebra';
            const mockObj = { topic: inferredTopic, steps: [], answer: '', tip: '' };

            if (/sin\s*\(?\s*90\s*\)?/i.test(qText)) {
              mockObj.topic = 'Trigonometry';
              mockObj.steps.push({ title: 'Interpret', explanation: 'Interpret the expression as sine of 90 degrees.', math: 'sin(90°) = 1' });
              mockObj.answer = '1';
              mockObj.tip = 'Angles without units are interpreted as degrees in this mock.';
            } else {
              const arithmeticMatch = qText.match(/^\s*([0-9.]+)\s*([+\-\*\/])\s*([0-9.]+)\s*$/);
              if (arithmeticMatch) {
                const a = parseFloat(arithmeticMatch[1]);
                const op = arithmeticMatch[2];
                const b = parseFloat(arithmeticMatch[3]);
                let resVal = null;
                switch (op) {
                  case '+': resVal = a + b; break;
                  case '-': resVal = a - b; break;
                  case '*': resVal = a * b; break;
                  case '/': resVal = (b !== 0) ? (a / b) : 'Infinity'; break;
                }
                mockObj.steps.push({ title: 'Interpret', explanation: `We interpret the expression ${qText} as arithmetic addition/subtraction.`, math: `${a} ${op} ${b} = ${resVal}` });
                mockObj.answer = String(resVal);
                mockObj.tip = 'Remember order of operations.';
              } else {
                mockObj.steps.push({ title: 'Approach', explanation: `This is a mock response for: ${qText}`, math: '' });
                mockObj.answer = '—';
                mockObj.tip = 'Provide a numeric or clearer question for the mock responder.';
              }
            }

            const mock = { content: [ { text: '```json\n' + JSON.stringify(mockObj) + '\n```' } ] };
            const verification = verifySolution(mockObj, question);
            return res.json({ content: mock.content, _parsed: mockObj, _validation: verification });
          }
      } catch (e) {
        // fallthrough to return error string
      }

      // Ensure error is a string when sent to client
      const err = typeof data === 'string' ? data : JSON.stringify(data);
      return res.status(response.status || 500).json({ error: err });
    }

    // Try to extract and validate the AI JSON payload from the response
    try {
      const raw = (data.content?.map?.(b => b.text || '').join('') ?? '').replace(/```json|```/g, '').trim();
      const p = JSON.parse(raw);
      const verification = verifySolution(p, question);
      return res.json({ content: data.content, _parsed: p, _validation: verification });
    } catch (e) {
      // If parsing fails, return original data
      return res.json(data);
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));