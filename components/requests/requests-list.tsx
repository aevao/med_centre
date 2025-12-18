"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Request {
  id: number;
  description: string;
  equipmentType: string | null;
  serviceName?: string | null;
  preferredAt?: Date | string | null;
  symptoms?: string | null;
  status: string;
  createdAt: Date;
  completedAt: Date | null;
  client: { id: number; name: string; email: string } | null;
  clientName: string;
  master: { id: number; name: string; email: string } | null;
  equipment: { id: number; name: string; serialNumber: string } | null;
}

interface RequestsListProps {
  initialRequests: Request[];
  userRole: string;
  userId: number;
  masters: { id: number; name: string; email: string }[];
}

export default function RequestsList({
  initialRequests,
  userRole,
  userId,
  masters,
}: RequestsListProps) {
  const [requests, setRequests] = useState<Request[]>(initialRequests || []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedMaster, setSelectedMaster] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    description: "",
    serviceName: "",
    preferredAt: "",
    symptoms: "",
    price: "",
  });

  const filteredRequests =
    filterStatus === "all"
      ? requests
      : requests.filter((r) => r.status === filterStatus);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка");
      }

      toast({
        title: "Успешно",
        description: "Заявка создана",
      });

      setRequests([data.request, ...requests]);
      setIsCreateOpen(false);
      setFormData({
        description: "",
        serviceName: "",
        preferredAt: "",
        symptoms: "",
        price: "",
      });
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении статуса");
      }

      const data = await response.json();
      setRequests(requests.map((r) => (r.id === requestId ? data.request : r)));

      toast({
        title: "Успешно",
        description: "Статус обновлён",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMasterChange = async (requestId: number, newMaster: number) => {
    try {
      const response = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterId: newMaster }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при обновлении мастера");
      }

      const data = await response.json();
      setRequests(requests.map((r) => (r.id === requestId ? data.request : r)));

      toast({
        title: "Успешно",
        description: "Врач назначен",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "новая":
        return "bg-gray-100 text-gray-800";
      case "в работе":
        return "bg-blue-100 text-blue-800";
      case "завершена":
        return "bg-green-100 text-green-800";
      case "отменена":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <div className="mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Фильтр по статусу" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="новая">Новая</SelectItem>
            <SelectItem value="в работе">В работе</SelectItem>
            <SelectItem value="завершена">Завершена</SelectItem>
            <SelectItem value="отменена">Отменена</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Обращение</TableHead>
              <TableHead>Пациент</TableHead>
              <TableHead>Врач</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell className="max-w-md truncate">
                  {request.serviceName ? `${request.serviceName}: ${request.description}` : request.description}
                </TableCell>
                <TableCell>{request.clientName}</TableCell>
                {userRole === "ADMIN" ? (
                  <TableCell>
                    <Select
                      value={request.master ? request.master.id.toString() : "" }
                      onValueChange={(value) => handleMasterChange(request.id, parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="назначьте врача" />
                      </SelectTrigger>
                      <SelectContent>
                        {masters.map((master) => (
                          <SelectItem
                            key={master.id}
                            value={master.id.toString()}
                          >
                            {master.name} 
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                ) : request.master?.name ? (
                  request.master.name
                ) : (
                  "-"
                ) }

                <TableCell>
                  {userRole === "ADMIN" || userRole === "MASTER" ? (
                    <Select
                      value={request.status}
                      onValueChange={(value) =>
                        handleStatusChange(request.id, value)
                      }
                    >
                      <SelectTrigger
                        className={`w-[150px] ${getStatusColor(
                          request.status
                        )}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="новая">Новая</SelectItem>
                        <SelectItem value="в работе">В работе</SelectItem>
                        <SelectItem value="завершена">Завершена</SelectItem>
                        <SelectItem value="отменена">Отменена</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(request.createdAt), "dd.MM.yyyy HH:mm", {
                    locale: ru,
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setIsViewOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать заявку в медцентр</DialogTitle>
            <DialogDescription>
              Заполните форму для создания новой заявки (запись/обращение)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Услуга / направление</Label>
              <Input
                id="serviceName"
                value={formData.serviceName}
                onChange={(e) =>
                  setFormData({ ...formData, serviceName: e.target.value })
                }
                placeholder="Терапевт, кардиолог, УЗИ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredAt">Желаемая дата и время</Label>
              <Input
                id="preferredAt"
                type="datetime-local"
                value={formData.preferredAt}
                onChange={(e) =>
                  setFormData({ ...formData, preferredAt: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="symptoms">Жалобы / симптомы</Label>
              <Input
                id="symptoms"
                value={formData.symptoms}
                onChange={(e) =>
                  setFormData({ ...formData, symptoms: e.target.value })
                }
                placeholder="Кратко опишите, что беспокоит..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание обращения</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Подробности, пожелания, противопоказания..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipmentPrice">Стоимость (опционально)</Label>
              <Input
                id="equipmentPrice"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="Например, 1500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedRequest && (
        <RequestViewDialog
          request={selectedRequest}
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
          userRole={userRole}
          userId={userId}
        />
      )}
    </>
  );
}

// Диалог просмотра заявки с комментариями
function RequestViewDialog({
  request,
  open,
  onOpenChange,
  userRole,
  userId,
}: {
  request: Request;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: string;
  userId: number;
}) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/requests/${request.id}`);
      const data = await response.json();
      if (data.request?.comments) {
        setComments(data.request.comments);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  React.useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, request.id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/requests/${request.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newComment }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при добавлении комментария");
      }

      const data = await response.json();
      setComments([data.comment, ...comments]);
      setNewComment("");
      toast({
        title: "Успешно",
        description: "Комментарий добавлен",
      });
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Заявка #{request.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Услуга / направление</Label>
              <p className="mt-1">{(request as any).serviceName || "Не указано"}</p>
            </div>
            <div>
              <Label>Желаемая дата/время</Label>
              <p className="mt-1">
                {(request as any).preferredAt
                  ? format(new Date((request as any).preferredAt), "dd.MM.yyyy HH:mm", { locale: ru })
                  : "Не указано"}
              </p>
            </div>
          </div>
          <div>
            <Label>Жалобы / симптомы</Label>
            <p className="mt-1">{(request as any).symptoms || "Не указаны"}</p>
          </div>
          <div>
            <Label>Описание обращения</Label>
            <p className="mt-1">{request.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Пациент</Label>
              <p className="mt-1">{request.client?.name}</p>
            </div>
            <div>
              <Label>Врач</Label>
              <p className="mt-1">{request.master?.name || "Не назначен"}</p>
            </div>
            <div>
              <Label>Статус</Label>
              <p className="mt-1">{request.status}</p>
            </div>
            <div>
              <Label>Дата создания</Label>
              <p className="mt-1">
                {format(new Date(request.createdAt), "dd.MM.yyyy HH:mm", {
                  locale: ru,
                })}
              </p>
            </div>
          </div>

          <div>
            <Label>Комментарии</Label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{comment.author?.name}</span>
                    <span className="text-sm text-gray-500">
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

          {(userRole === "ADMIN" ||
            userRole === "MASTER" ||
            (userRole === "CLIENT" && request.client?.id === userId)) && (
            <div>
              <Label>Добавить комментарий</Label>
              <div className="mt-2 flex space-x-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Введите комментарий..."
                />
                <Button onClick={handleAddComment} disabled={loading}>
                  Отправить
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
