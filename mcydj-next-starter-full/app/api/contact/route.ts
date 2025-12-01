import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
const schema = z.object({ name: z.string().min(2), company: z.string().optional().default(""), email: z.string().email(), phone: z.string().optional().default(""), message: z.string().min(5) });
export async function POST(req: Request) {
  try {
    const body = await req.json(); const data = schema.parse(body);
    const to = process.env.EMAIL_TO || "contacto@mcydj.mx";
    await sendEmail(to, `Nuevo contacto de ${data.name}`, `<div><p><b>Nombre:</b> ${data.name}</p><p><b>Empresa:</b> ${data.company}</p><p><b>Email:</b> ${data.email}</p><p><b>Tel:</b> ${data.phone}</p><p><b>Mensaje:</b><br/>${data.message}</p></div>`);
    return NextResponse.json({ ok: true });
  } catch (e:any) { return NextResponse.json({ error: e.message || "Error" }, { status: 400 }); }
}
