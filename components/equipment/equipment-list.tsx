'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter } from 'next/navigation'

interface Equipment {
  id: number
  name: string
  serialNumber: string
  purchaseDate: Date | null
  status: string
  client: { id: number; name: string; email: string }
  createdAt: Date
}

interface EquipmentListProps {
  initialEquipment: Equipment[]
  clients: { id: number; name: string; email: string }[]
}

export function EquipmentList({ initialEquipment, clients }: EquipmentListProps) {
  const [equipment, setEquipment] = useState(initialEquipment)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    purchaseDate: '',
    status: 'активна',
    clientId: ''
  })

  const handleCreate = async () => {
    if (!formData.name || !formData.serialNumber || !formData.clientId) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка')
      }

      toast({
        title: 'Успешно',
        description: 'Услуга добавлена'
      })

      setEquipment([data.equipment, ...equipment])
      setIsCreateOpen(false)
      setFormData({
        name: '',
        serialNumber: '',
        purchaseDate: '',
        status: 'активна',
        clientId: ''
      })
      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'активна':
        return 'bg-green-100 text-green-800'
      case 'временно недоступна':
        return 'bg-yellow-100 text-yellow-800'
      case 'скрыта':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Услуги</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить услугу
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Название услуги</TableHead>
              <TableHead>Код</TableHead>
              <TableHead>Ответственный</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.serialNumber}</TableCell>
                <TableCell>{item.client.name}</TableCell>
                <TableCell>
                  {format(new Date(item.createdAt), 'dd.MM.yyyy', { locale: ru })}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить услугу</DialogTitle>
            <DialogDescription>
              Заполните форму для добавления новой услуги
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название услуги *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Приём терапевта, УЗИ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Код услуги *</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="THERAPY-01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Ответственный *</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => setFormData({ ...formData, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите сотрудника" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="активна">Активна</SelectItem>
                  <SelectItem value="временно недоступна">Временно недоступна</SelectItem>
                  <SelectItem value="скрыта">Скрыта</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

