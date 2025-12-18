"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

interface Service {
  id: string | number;
  price: string | number;
  name?: string; // если есть другие поля
}
interface RequestModalProps {
    service : Service
}
export function RequestModal({  service }: RequestModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [data, setData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceName: service.name || "",
    preferredAt: "",
    symptoms: "",
    description: "",
  })
  async function submit() {
    setLoading(true)

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        serviceId: String(service.id),
        price: service.price,
      }),
    })

    setLoading(false)

    if (res.ok) {
      toast({ title: "Заявка отправлена",
        description: "Мы свяжемся с вами в ближайшее время.",
      })
      setOpen(false)
    } else {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="mt-6 w-full">
        Записаться
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Электронная заявка в медцентр</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Ваше имя"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
            <Input
              placeholder="Телефон"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
            />
            <Input
              placeholder="Email (для уведомлений)"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />

            <Input
              placeholder="Услуга / направление (например, терапевт, УЗИ)"
              value={data.serviceName}
              onChange={(e) => setData({ ...data, serviceName: e.target.value })}
            />

            <Input
              type="datetime-local"
              placeholder="Желаемая дата и время"
              value={data.preferredAt}
              onChange={(e) => setData({ ...data, preferredAt: e.target.value })}
            />

            <Input
              placeholder="Жалобы / симптомы (кратко)"
              value={data.symptoms}
              onChange={(e) => setData({ ...data, symptoms: e.target.value })}
            />

            <textarea
              className="w-full border border-gray-400 rounded-lg p-2"
              placeholder="Опишите обращение (что беспокоит, пожелания)"
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
            />

            <Button onClick={submit} disabled={loading} className="w-full">
              {loading ? "Отправка..." : "Отправить заявку"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
