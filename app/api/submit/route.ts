import { NextResponse } from "next/server";
import { sendTelegramMessage, verifyTelegramInitData } from "../_utils";

type Body = {
  initData?: string;
  chatId?: string;
  color?: string;
  animal?: string;
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

  const lines: string[] = [];
  lines.push(valid ? "✅ Form submit (verified)." : "⚠️ Form submit (NOT verified).");
  if (body.chatId) lines.push(`chatId: ${body.chatId}`);
  if (typeof body.color === "string") lines.push(`color: ${body.color}`);
  if (typeof body.animal === "string") lines.push(`animal: ${body.animal}`);

  try {
    await sendTelegramMessage(botToken, adminChatId, lines.join("\n"));
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
