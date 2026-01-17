import { NextResponse } from "next/server";
import { sendTelegramMessage, verifyTelegramInitData } from "../_utils";

type Body = {
  initData?: string;
  chatId?: string;
};

export async function POST(req: Request) {
  const botToken = process.env.BOT_TOKEN;
  const adminChatId = process.env.ADMIN_CHAT_ID;

  if (!botToken || !adminChatId) {
    return NextResponse.json({ ok: false, error: "Missing BOT_TOKEN or ADMIN_CHAT_ID" }, { status: 500 });
  }

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {};
  }

  const initData = body.initData || "";
  const valid = initData ? verifyTelegramInitData(initData, botToken) : false;

  // Extract user info if provided by Telegram in initDataUnsafe (sent from client as JSON in initData param is not possible)
  // We keep this endpoint minimal: it just notifies admin that WebApp was opened.
  const suffix = body.chatId ? `\nchatId: ${body.chatId}` : "";

  const text = valid
    ? `✅ WebApp opened (verified).${suffix}`
    : `⚠️ WebApp opened (NOT verified).${suffix}`;

  try {
    await sendTelegramMessage(botToken, adminChatId, text);
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
