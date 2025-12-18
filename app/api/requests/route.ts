import sgMail from '@sendgrid/mail'
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { pushRequestToOneC } from "@/lib/integrations/oneC";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendRequestEmail(to: string, request: any) {
  const url = `https://yourdomain.com/request/${request.id}`;

  const html = `
    <h2>Ваша заявка принята</h2>
    <p>Здравствуйте ${request.clientName},</p>
    <p>Мы получили вашу заявку:</p>
    <ul>
      <li>Описание: ${request.description}</li>
      <li>Сумма: ${request.price}</li>
      <li>Статус: ${request.status}</li>
    </ul>
    <p>Вы можете отслеживать статус вашей заявки по ссылке: <a href="${url}">${url}</a></p>
    <p>Спасибо, что выбрали наш сервис!</p>
  `;

  await transporter.sendMail({
    from: '"Сервис" <no-reply@yourdomain.com>',
    to,
    subject: "Ваша заявка принята",
    html,
  });
}



sgMail.setApiKey(process.env.SENDGRID_API_KEY!)


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, description, serviceName, preferredAt, symptoms, equipmentType, equipmentId, price } = body;

    if (!name || !phone || !description) {
      return NextResponse.json({ error: "Имя, телефон и описание обращения обязательны" }, { status: 400 });
    }
    // Создаём заявку без регистрации пользователя
    const createdRequest = await prisma.request.create({
      data: {
        description,
        serviceName: serviceName || null,
        preferredAt: preferredAt ? new Date(preferredAt) : null,
        symptoms: symptoms || null,
        equipmentType: equipmentType || null,
        equipmentId: equipmentId ? parseInt(equipmentId) : null,
        price: price || "",
        clientName: name,
        clientPhone: phone,
        clientEmail: email || null,
      },
    });

    // Пуш в 1С (не влияет на ответ, если 1С недоступна/не настроена)
    void pushRequestToOneC(
      {
        id: createdRequest.id,
        status: createdRequest.status,
        createdAt: createdRequest.createdAt.toISOString(),
        serviceName: createdRequest.serviceName,
        preferredAt: createdRequest.preferredAt ? createdRequest.preferredAt.toISOString() : null,
        symptoms: createdRequest.symptoms,
        description: createdRequest.description,
        price: createdRequest.price,
        clientName: createdRequest.clientName,
        clientPhone: createdRequest.clientPhone,
        clientEmail: createdRequest.clientEmail,
      },
      "created"
    );

    // Отправка письма, если email указан
    if (email) {
      const url = `${process.env.APP_URL}/requests/${createdRequest.id}`;
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM!,
        subject: "Ваша заявка в медцентр принята",
        html: `
          <h2>Здравствуйте, ${name}!</h2>
          <p>Мы получили вашу заявку в медицинский центр:</p>
          <ul>
            <li>ID заявки: ${createdRequest.id}</li>
            <li>Услуга/направление: ${createdRequest.serviceName || "не указано"}</li>
            <li>Желаемая дата/время: ${createdRequest.preferredAt ? new Date(createdRequest.preferredAt).toLocaleString("ru-RU") : "не указано"}</li>
            <li>Симптомы: ${createdRequest.symptoms || "не указаны"}</li>
            <li>Описание: ${description}</li>
            <li>Стоимость: ${price || "не указана"}</li>
            <li>Статус: ${createdRequest.status}</li>
          </ul>
          <p>Вы можете отслеживать статус вашей заявки по ссылке:
          <a href="${url}">${url}</a></p>
          <p>Спасибо! Мы свяжемся с вами для подтверждения записи.</p>
        `,
      };
      await sgMail.send(msg);
    }

    return NextResponse.json({ request: createdRequest }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Ошибка при создании заявки" }, { status: 500 });
  }
}




// --- GET: получение заявок ---
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const clientId = searchParams.get("clientId");
    const masterId = searchParams.get("masterId");

    const where: any = {};
    if (status) where.status = status;
    if (clientId) where.clientId = parseInt(clientId);
    if (masterId) where.masterId = parseInt(masterId);

    const requestsRaw = await prisma.request.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, email: true } },
        master: { select: { id: true, name: true, email: true } },
        equipment: { select: { id: true, name: true, serialNumber: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Преобразуем к типу Request[], чтобы client точно не null
    const requests = requestsRaw.map((r) => ({
      ...r,
      client: r.client!, // TypeScript понимает, что client не null
      clientName: r.client?.name || "Не указан",
    }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Get requests error:", error);
    return NextResponse.json(
      { error: "Ошибка при получении заявок" },
      { status: 500 }
    );
  }
}