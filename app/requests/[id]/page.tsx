// app/requests/[id]/page.tsx
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function RequestPage({
  params,
}: {
  params: { id: string };
}) {
  const requestId = parseInt(params.id);
  if (isNaN(requestId)) return notFound();

  const user = await getCurrentUser(); // может быть null (гость)

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      client: { select: { id: true, name: true, email: true } },
      master: { select: { id: true, name: true, email: true } },
      equipment: { select: { id: true, name: true, serialNumber: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!request) return notFound();

  // =============== ACCESS RULES ===============
  if (user?.role === "MASTER" && request.masterId !== user.userId) {
    return <div className="p-8 text-red-500">У вас нет доступа к этой заявке</div>;
  }

  if (user?.role === "CLIENT" && request.clientId !== user.userId) {
    return <div className="p-8 text-red-500">Эта заявка принадлежит другому клиенту</div>;
  }

  // Гость — может смотреть (если ты разрешаешь)
  // Если хочешь запретить гостю — просто добавь:
  // if (!user) return redirect("/login");

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold mb-6 text-slate-950">Заявка #{request.id}</h1>

      <div className="space-y-4 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-[0_28px_100px_-80px_rgba(2,6,23,0.65)] backdrop-blur">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-600 text-sm">Услуга / направление</p>
            <p className="text-lg font-medium text-slate-950">{(request as any).serviceName || "Не указано"}</p>
          </div>
          <div>
            <p className="text-slate-600 text-sm">Желаемая дата/время</p>
            <p className="text-lg font-medium text-slate-950">
              {(request as any).preferredAt
                ? format(new Date((request as any).preferredAt), "dd.MM.yyyy HH:mm", { locale: ru })
                : "Не указано"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-slate-600 text-sm">Жалобы / симптомы</p>
          <p className="text-lg text-slate-950">{(request as any).symptoms || "Не указаны"}</p>
        </div>
        <div>
          <p className="text-slate-600 text-sm">Описание обращения</p>
          <p className="text-lg text-slate-950">{request.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-600 text-sm">Клиент</p>
            <p className="text-slate-950">{request.client?.name}</p>
          </div>

          <div>
            <p className="text-slate-600 text-sm">Врач</p>
            <p className="text-slate-950">{request.master?.name || "Не назначен"}</p>
          </div>

          <div>
            <p className="text-slate-600 text-sm">Статус</p>
            <p className="text-slate-950">{request.status}</p>
          </div>

          <div>
            <p className="text-slate-600 text-sm">Дата создания</p>
            <p className="text-slate-950">
              {format(new Date(request.createdAt), "dd.MM.yyyy HH:mm", {
                locale: ru,
              })}
            </p>
          </div>
        </div>

        <div>
          <p className="text-slate-600 text-sm">Комментарии</p>

          <div className="mt-2 space-y-2">
            {request.comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {comment.author?.name || "Неизвестно"}
                  </span>
                  <span className="text-sm text-slate-600">
                    {format(new Date(comment.createdAt), "dd.MM.yyyy HH:mm", {
                      locale: ru,
                    })}
                  </span>
                </div>
                <p className="mt-1">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
