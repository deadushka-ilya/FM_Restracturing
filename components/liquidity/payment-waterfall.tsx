'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PaymentPriority } from '@/types/scenario'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface WaterfallPayment {
  priority: PaymentPriority
  name: string
  amount: number
  paid: number
  shortfall: number
}

interface PaymentWaterfallProps {
  availableCash: number
  payments: WaterfallPayment[]
  title?: string
  description?: string
}

export function PaymentWaterfall({ availableCash, payments, title, description }: PaymentWaterfallProps) {
  const totalRequired = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = payments.reduce((sum, p) => sum + p.paid, 0)
  const totalShortfall = payments.reduce((sum, p) => sum + p.shortfall, 0)
  const paymentRate = totalRequired > 0 ? (totalPaid / totalRequired) * 100 : 0

  const getPriorityColor = (priority: PaymentPriority) => {
    switch (priority) {
      case PaymentPriority.TIER_1_LEGAL_COSTS:
        return 'bg-purple-50 border-l-4 border-purple-500'
      case PaymentPriority.TIER_2_PAYROLL:
        return 'bg-red-50 border-l-4 border-red-500'
      case PaymentPriority.TIER_3_UTILITIES:
        return 'bg-orange-50 border-l-4 border-orange-500'
      case PaymentPriority.TIER_4_SECURED_CREDITORS:
        return 'bg-yellow-50 border-l-4 border-yellow-500'
      case PaymentPriority.TIER_5_UNSECURED_CREDITORS:
        return 'bg-blue-50 border-l-4 border-blue-500'
      case PaymentPriority.TIER_6_SUBORDINATED:
        return 'bg-gray-50 border-l-4 border-gray-500'
      default:
        return 'bg-white'
    }
  }

  const getPaymentStatusIcon = (payment: WaterfallPayment) => {
    const paymentRate = payment.amount > 0 ? (payment.paid / payment.amount) * 100 : 0
    
    if (paymentRate >= 100) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (paymentRate > 0) {
      return <AlertTriangle className="h-5 w-5 text-yellow-600" />
    } else {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getPriorityName = (priority: PaymentPriority) => {
    const names: Record<PaymentPriority, string> = {
      [PaymentPriority.TIER_1_LEGAL_COSTS]: 'Tier 1: Судебные расходы, АУ',
      [PaymentPriority.TIER_2_PAYROLL]: 'Tier 2: Зарплата (текущая)',
      [PaymentPriority.TIER_3_UTILITIES]: 'Tier 3: ЖКХ, эксплуатация',
      [PaymentPriority.TIER_4_SECURED_CREDITORS]: 'Tier 4: Залоговые кредиторы',
      [PaymentPriority.TIER_5_UNSECURED_CREDITORS]: 'Tier 5: Незалоговые кредиторы',
      [PaymentPriority.TIER_6_SUBORDINATED]: 'Tier 6: Субординированные',
    }
    return names[priority] || 'Неизвестный приоритет'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Payment Waterfall - Очередность по ФЗ-127'}</CardTitle>
        <CardDescription>
          {description || 'Распределение платежей по приоритетам согласно ст. 134 ФЗ-127 "О несостоятельности (банкротстве)"'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Сводка */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-semibold mb-1">Доступно ДС</p>
            <p className="text-xl font-bold text-blue-900">{formatCurrency(availableCash)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold mb-1">Требуется всего</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(totalRequired)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-xs text-green-600 font-semibold mb-1">Оплачено</p>
            <p className="text-xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
            <p className="text-xs text-green-700 mt-1">{formatPercent(paymentRate / 100)}</p>
          </div>
          <div className={`p-4 rounded-lg border ${totalShortfall > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-xs font-semibold mb-1 ${totalShortfall > 0 ? 'text-red-600' : 'text-gray-600'}`}>Дефицит</p>
            <p className={`text-xl font-bold ${totalShortfall > 0 ? 'text-red-900' : 'text-gray-900'}`}>
              {formatCurrency(totalShortfall)}
            </p>
          </div>
        </div>

        {/* Таблица Waterfall */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">Статус</TableHead>
                <TableHead>Приоритет / Категория</TableHead>
                <TableHead className="text-right">Требуется</TableHead>
                <TableHead className="text-right">Оплачено</TableHead>
                <TableHead className="text-right">% оплаты</TableHead>
                <TableHead className="text-right">Дефицит</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => {
                const paymentRate = payment.amount > 0 ? (payment.paid / payment.amount) * 100 : 0
                
                return (
                  <TableRow key={index} className={getPriorityColor(payment.priority)}>
                    <TableCell>
                      {getPaymentStatusIcon(payment)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-gray-900">{getPriorityName(payment.priority)}</p>
                        <p className="text-sm text-gray-600">{payment.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={payment.paid > 0 ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                        {formatCurrency(payment.paid)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={
                        paymentRate >= 100 ? 'text-green-600 font-semibold' :
                        paymentRate > 0 ? 'text-yellow-600 font-semibold' :
                        'text-red-600 font-semibold'
                      }>
                        {formatPercent(paymentRate / 100)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.shortfall > 0 ? (
                        <span className="text-red-600 font-semibold">
                          {formatCurrency(payment.shortfall)}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* Легенда приоритетов */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">📋 Очередность удовлетворения требований по ФЗ-127</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded mt-1"></div>
              <div>
                <span className="font-semibold">Tier 1:</span> Судебные расходы, вознаграждение АУ (внеочередные)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-red-500 rounded mt-1"></div>
              <div>
                <span className="font-semibold">Tier 2:</span> Зарплата, компенсации (1-я очередь)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded mt-1"></div>
              <div>
                <span className="font-semibold">Tier 3:</span> ЖКХ, эксплуатационные платежи (текущие)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded mt-1"></div>
              <div>
                <span className="font-semibold">Tier 4:</span> Залоговые кредиторы (3-я очередь)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded mt-1"></div>
              <div>
                <span className="font-semibold">Tier 5:</span> Незалоговые кредиторы (3-я очередь)
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded mt-1"></div>
              <div>
                <span className="font-semibold">Tier 6:</span> Субординированные обязательства
              </div>
            </div>
          </div>
        </div>

        {/* Предупреждение о дефиците */}
        {totalShortfall > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">⚠️ Недостаточно средств для полной оплаты</h4>
                <p className="text-sm text-red-700">
                  Дефицит: <span className="font-semibold">{formatCurrency(totalShortfall)}</span>
                </p>
                <p className="text-sm text-red-700 mt-2">
                  Часть кредиторов не получит полную оплату. Средства распределены по приоритетам согласно ФЗ-127.
                  Рассмотрите дополнительные меры по улучшению ликвидности.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
