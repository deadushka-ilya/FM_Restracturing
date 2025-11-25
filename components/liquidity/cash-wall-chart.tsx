'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { LiquidityStatus } from '@/types/scenario'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react'

interface CashWallData {
  weekNumber: number
  cashBalance: number
  minCashRequired: number
  surplus: number
  status: LiquidityStatus
}

interface CashWallChartProps {
  data: CashWallData[]
  title?: string
  description?: string
}

export function CashWallChart({ data, title, description }: CashWallChartProps) {
  // Подготовка данных для графика
  const chartData = data.map(item => ({
    week: `Неделя ${item.weekNumber}`,
    'Остаток ДС': item.cashBalance,
    'Минимум': item.minCashRequired,
    status: item.status,
  }))

  // Кастомный тултип
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const status = data.status
      
      let statusColor = 'text-gray-900'
      let statusIcon = <CheckCircle className="h-4 w-4" />
      
      if (status === LiquidityStatus.RED) {
        statusColor = 'text-red-600'
        statusIcon = <AlertTriangle className="h-4 w-4 text-red-600" />
      } else if (status === LiquidityStatus.AMBER) {
        statusColor = 'text-yellow-600'
        statusIcon = <AlertCircle className="h-4 w-4 text-yellow-600" />
      } else {
        statusColor = 'text-green-600'
        statusIcon = <CheckCircle className="h-4 w-4 text-green-600" />
      }

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{data.week}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              Остаток ДС: <span className="font-semibold">{formatCurrency(data['Остаток ДС'])}</span>
            </p>
            <p className="text-gray-700">
              Минимум: <span className="font-semibold">{formatCurrency(data['Минимум'])}</span>
            </p>
            <div className={`flex items-center gap-2 mt-2 pt-2 border-t ${statusColor}`}>
              {statusIcon}
              <span className="font-semibold">{status}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Подсчет статистики
  const totalWeeks = data.length
  const redWeeks = data.filter(d => d.status === LiquidityStatus.RED).length
  const amberWeeks = data.filter(d => d.status === LiquidityStatus.AMBER).length
  const greenWeeks = data.filter(d => d.status === LiquidityStatus.GREEN).length
  
  const minCash = Math.min(...data.map(d => d.cashBalance))
  const maxCash = Math.max(...data.map(d => d.cashBalance))
  const avgCash = data.reduce((sum, d) => sum + d.cashBalance, 0) / totalWeeks

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Cash Wall - Стена Ликвидности'}</CardTitle>
        <CardDescription>
          {description || 'Визуализация остатка денежных средств против минимального неснижаемого буфера'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* График */}
        <div className="mb-6">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="week" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Area
                type="monotone"
                dataKey="Остаток ДС"
                stroke="#3b82f6"
                strokeWidth={3}
                fill="url(#colorCash)"
              />
              <Area
                type="monotone"
                dataKey="Минимум"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorMin)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Мин. остаток</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(minCash)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Макс. остаток</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(maxCash)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Средний</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(avgCash)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Всего недель</p>
            <p className="text-lg font-semibold text-gray-900">{totalWeeks}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Критичных</p>
            <p className="text-lg font-semibold text-red-600">{redWeeks}</p>
          </div>
        </div>

        {/* RAG Индикаторы */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border-2 border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{greenWeeks}</span>
            </div>
            <p className="text-sm font-semibold text-green-900">🟢 Хорошо</p>
            <p className="text-xs text-green-700 mt-1">
              Достаточная ликвидность (&gt;120% от минимума)
            </p>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-600">{amberWeeks}</span>
            </div>
            <p className="text-sm font-semibold text-yellow-900">🟡 Внимание</p>
            <p className="text-xs text-yellow-700 mt-1">
              Близко к минимуму (100-120%)
            </p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">{redWeeks}</span>
            </div>
            <p className="text-sm font-semibold text-red-900">🔴 Критично</p>
            <p className="text-xs text-red-700 mt-1">
              Ниже минимума (кассовый разрыв)
            </p>
          </div>
        </div>

        {/* Предупреждения */}
        {redWeeks > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 mb-1">⚠️ Обнаружены кассовые разрывы</h4>
                <p className="text-sm text-red-700">
                  {redWeeks} {redWeeks === 1 ? 'неделя' : redWeeks < 5 ? 'недели' : 'недель'} с остатком ниже минимального буфера. 
                  Рекомендуется срочно рассмотреть меры по улучшению ликвидности:
                </p>
                <ul className="text-sm text-red-700 mt-2 ml-4 list-disc space-y-1">
                  <li>Ускорить сбор дебиторской задолженности</li>
                  <li>Растянуть платежи поставщикам (DPO stretching)</li>
                  <li>Активировать револьверную кредитную линию</li>
                  <li>Рассмотреть продажу непрофильных активов</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
