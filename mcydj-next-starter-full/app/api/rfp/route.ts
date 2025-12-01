import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const to = process.env.EMAIL_TO || "contacto@mcydj.mx";
    await sendEmail(to, `Nueva RFP de ${data?.name || "anónimo"}`, `<pre>${JSON.stringify(data, null, 2)}</pre>`);
    return NextResponse.json({ ok: true });
  } catch (e:any) { return NextResponse.json({ error: e.message || "Error" }, { status: 400 }); }
}
