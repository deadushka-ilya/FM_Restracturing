'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CashWallChart } from '@/components/liquidity/cash-wall-chart'
import { PaymentWaterfall } from '@/components/liquidity/payment-waterfall'
import { calculateCashWall, calculatePaymentWaterfall } from '@/modules/liquidity/advanced-calculations'
import { LiquidityStatus, PaymentPriority } from '@/types/scenario'
import { ChevronLeft, Sparkles } from 'lucide-react'

export default function AdvancedFeaturesPage() {
  // Демо-данные для Cash Wall
  const demoCashWallData = calculateCashWall(
    [
      3500000, 3200000, 2800000, 2600000, 2400000, 2200000, 2000000,
      1800000, 2100000, 2500000, 2800000, 3100000, 3400000,
    ],
    {
      minCashRequired: 2500000,
      operationalDays: 7,
      dailyBurnRate: 350000,
    }
  )

  // Демо-данные для Payment Waterfall
  const demoWaterfallPayments = calculatePaymentWaterfall(
    5000000, // Доступно 5M
    [
      {
        priority: PaymentPriority.TIER_1_LEGAL_COSTS,
        name: 'Вознаграждение арбитражного управляющего',
        amount: 500000,
      },
      {
        priority: PaymentPriority.TIER_2_PAYROLL,
        name: 'Зарплата за текущий месяц',
        amount: 2000000,
      },
      {
        priority: PaymentPriority.TIER_3_UTILITIES,
        name: 'ЖКХ, аренда, охрана',
        amount: 800000,
      },
      {
        priority: PaymentPriority.TIER_4_SECURED_CREDITORS,
        name: 'ВТБ (залог недвижимость)',
        amount: 1500000,
      },
      {
        priority: PaymentPriority.TIER_5_UNSECURED_CREDITORS,
        name: 'Поставщики (незалоговые)',
        amount: 1200000,
      },
      {
        priority: PaymentPriority.TIER_6_SUBORDINATED,
        name: 'Займ учредителя',
        amount: 500000,
      },
    ]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            На главную
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Продвинутые возможности
            </h1>
          </div>
          
          <p className="text-lg text-gray-600">
            Демонстрация новых инструментов: Cash Wall, Payment Waterfall и расширенная аналитика
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">🎯 Что нового?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Cash Wall</strong> - визуализация ликвидности с RAG индикаторами</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Payment Waterfall</strong> - очередность платежей по ФЗ-127</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Collection Matrix</strong> - профили сбора платежей</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>AP Aging</strong> - управление кредиторской задолженностью</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>PIK Interest</strong> - капитализация процентов</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-lg">📚 Методология</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Restructuring Playbook (Section 8.1, 21.2)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>ФЗ-127 Статья 134 (приоритеты)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>13-Week Cash Flow (TWCF) модель</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Russian Tax System (ЕНС)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span>Best practices от Mary (Business Analyst)</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Cash Wall Demo */}
        <div className="mb-8">
          <CashWallChart data={demoCashWallData} />
        </div>

        {/* Payment Waterfall Demo */}
        <div className="mb-8">
          <PaymentWaterfall
            availableCash={5000000}
            payments={demoWaterfallPayments}
          />
        </div>

        {/* Integration Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle>🔗 Интеграция с модулями</CardTitle>
            <CardDescription>
              Эти компоненты уже интегрированы в существующие модули калькулятора
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">Модуль Ликвидности (TWCF)</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Cash Wall визуализация</li>
                  <li>Collection Matrix расчеты</li>
                  <li>AP Aging с DPO stretching</li>
                  <li>RCF (револьверная линия)</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">Модуль Ликвидации</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Payment Waterfall таблица</li>
                  <li>Приоритеты по ФЗ-127</li>
                  <li>Recovery Rate расчет</li>
                  <li>Распределение дефицита</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">Реструктуризация Долга</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>PIK Interest расчет</li>
                  <li>Мораторий на платежи</li>
                  <li>Капитализация процентов</li>
                  <li>Сценарное моделирование</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-2">Сравнение Сценариев</h4>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Base vs Downside vs Restructuring</li>
                  <li>Side-by-side метрики</li>
                  <li>Автоматические корректировки</li>
                  <li>Рекомендации по выбору</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
