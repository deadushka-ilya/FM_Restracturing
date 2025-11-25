'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScenarioSwitcher } from '@/components/scenario/scenario-switcher'
import { ScenarioType } from '@/types/scenario'
import { BASE_SCENARIO, DOWNSIDE_SCENARIO, RESTRUCTURING_SCENARIO } from '@/constants/scenario-defaults'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { ChevronLeft, TrendingDown, TrendingUp, Activity, ArrowRight } from 'lucide-react'

export default function ScenarioComparisonPage() {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>(ScenarioType.BASE)

  // Симуляция расчета метрик для каждого сценария
  const calculateScenarioMetrics = (scenarioType: ScenarioType) => {
    const baseRevenue = 50000000 // 50M базовая выручка
    const baseCosts = 42000000 // 42M базовые затраты
    const baseDebt = 11000000 // 11M базовый долг

    let revenueMultiplier = 1.0
    let costMultiplier = 1.0
    let collectionMultiplier = 1.0

    switch (scenarioType) {
      case ScenarioType.BASE:
        revenueMultiplier = 1.0
        costMultiplier = 1.0
        collectionMultiplier = 1.0
        break
      case ScenarioType.DOWNSIDE:
        revenueMultiplier = 0.7 // -30%
        costMultiplier = 1.0
        collectionMultiplier = 0.85
        break
      case ScenarioType.RESTRUCTURING:
        revenueMultiplier = 0.85 // -15%
        costMultiplier = 0.8 // -20%
        collectionMultiplier = 0.9
        break
    }

    const revenue = baseRevenue * revenueMultiplier
    const costs = baseCosts * costMultiplier
    const ebitda = revenue - costs
    const ebitdaMargin = (ebitda / revenue) * 100

    // Упрощенный расчет кэш флоу
    const operatingCashFlow = ebitda * 0.85
    const capex = scenarioType === ScenarioType.DOWNSIDE ? 1000000 : 
                   scenarioType === ScenarioType.RESTRUCTURING ? 500000 : 2000000
    const debtService = baseDebt * 0.15 // 15% годовых
    const freeCashFlow = operatingCashFlow - capex - debtService

    // Ликвидность
    const beginningCash = 2000000
    const endingCash = beginningCash + freeCashFlow
    
    // Коэффициенты
    const netDebtToEbitda = ebitda > 0 ? (baseDebt - endingCash) / ebitda : 999
    const dscr = debtService > 0 ? operatingCashFlow / debtService : 999

    return {
      revenue,
      costs,
      ebitda,
      ebitdaMargin,
      operatingCashFlow,
      capex,
      debtService,
      freeCashFlow,
      beginningCash,
      endingCash,
      netDebtToEbitda,
      dscr,
      revenueChange: (revenueMultiplier - 1) * 100,
      costChange: (costMultiplier - 1) * 100,
    }
  }

  const baseMetrics = calculateScenarioMetrics(ScenarioType.BASE)
  const downsideMetrics = calculateScenarioMetrics(ScenarioType.DOWNSIDE)
  const restructuringMetrics = calculateScenarioMetrics(ScenarioType.RESTRUCTURING)

  const getStatusIcon = (value: number, threshold: number, reverse: boolean = false) => {
    const isGood = reverse ? value < threshold : value > threshold
    if (isGood) {
      return <TrendingUp className="h-4 w-4 text-green-600" />
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getValueColor = (value: number, baseValue: number) => {
    if (value > baseValue) return 'text-green-600'
    if (value < baseValue) return 'text-red-600'
    return 'text-gray-900'
  }

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
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Сравнение сценариев
            </h1>
          </div>
          
          <p className="text-lg text-gray-600">
            Сравните ключевые метрики для базового, кризисного и реструктуризационного сценариев
          </p>
        </div>

        {/* Scenario Switcher */}
        <div className="mb-8">
          <ScenarioSwitcher
            currentScenario={activeScenario}
            onScenarioChange={setActiveScenario}
          />
        </div>

        {/* Comparison Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Сравнительная таблица метрик</CardTitle>
            <CardDescription>
              Ключевые финансовые показатели по всем сценариям
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/4">Показатель</TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span>Base</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        <span>Downside</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span>Restructuring</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Выручка */}
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-semibold">Выручка (годовая)</TableCell>
                    <TableCell className="text-center">{formatCurrency(baseMetrics.revenue)}</TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className={getValueColor(downsideMetrics.revenue, baseMetrics.revenue)}>
                          {formatCurrency(downsideMetrics.revenue)}
                        </div>
                        <div className="text-xs text-red-600">
                          {formatPercent(downsideMetrics.revenueChange / 100)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className={getValueColor(restructuringMetrics.revenue, baseMetrics.revenue)}>
                          {formatCurrency(restructuringMetrics.revenue)}
                        </div>
                        <div className="text-xs text-red-600">
                          {formatPercent(restructuringMetrics.revenueChange / 100)}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Затраты */}
                  <TableRow>
                    <TableCell className="font-semibold">Операционные затраты</TableCell>
                    <TableCell className="text-center">{formatCurrency(baseMetrics.costs)}</TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(downsideMetrics.costs, baseMetrics.costs)}>
                        {formatCurrency(downsideMetrics.costs)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-green-600">
                          {formatCurrency(restructuringMetrics.costs)}
                        </div>
                        <div className="text-xs text-green-600">
                          {formatPercent(restructuringMetrics.costChange / 100)}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* EBITDA */}
                  <TableRow className="bg-blue-50 font-semibold">
                    <TableCell>EBITDA</TableCell>
                    <TableCell className="text-center">{formatCurrency(baseMetrics.ebitda)}</TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(downsideMetrics.ebitda, baseMetrics.ebitda)}>
                        {formatCurrency(downsideMetrics.ebitda)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(restructuringMetrics.ebitda, baseMetrics.ebitda)}>
                        {formatCurrency(restructuringMetrics.ebitda)}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* EBITDA Margin */}
                  <TableRow>
                    <TableCell className="font-semibold">EBITDA Margin</TableCell>
                    <TableCell className="text-center">{formatPercent(baseMetrics.ebitdaMargin / 100)}</TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(downsideMetrics.ebitdaMargin, baseMetrics.ebitdaMargin)}>
                        {formatPercent(downsideMetrics.ebitdaMargin / 100)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(restructuringMetrics.ebitdaMargin, baseMetrics.ebitdaMargin)}>
                        {formatPercent(restructuringMetrics.ebitdaMargin / 100)}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Operating Cash Flow */}
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-semibold">Операционный Cash Flow</TableCell>
                    <TableCell className="text-center">{formatCurrency(baseMetrics.operatingCashFlow)}</TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(downsideMetrics.operatingCashFlow, baseMetrics.operatingCashFlow)}>
                        {formatCurrency(downsideMetrics.operatingCashFlow)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(restructuringMetrics.operatingCashFlow, baseMetrics.operatingCashFlow)}>
                        {formatCurrency(restructuringMetrics.operatingCashFlow)}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Capex */}
                  <TableRow>
                    <TableCell className="font-semibold">Капвложения (Capex)</TableCell>
                    <TableCell className="text-center">{formatCurrency(baseMetrics.capex)}</TableCell>
                    <TableCell className="text-center">
                      <div className="text-green-600">
                        {formatCurrency(downsideMetrics.capex)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-green-600">
                        {formatCurrency(restructuringMetrics.capex)}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Free Cash Flow */}
                  <TableRow className="bg-green-50 font-semibold">
                    <TableCell>Свободный Cash Flow</TableCell>
                    <TableCell className="text-center">{formatCurrency(baseMetrics.freeCashFlow)}</TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(downsideMetrics.freeCashFlow, baseMetrics.freeCashFlow)}>
                        {formatCurrency(downsideMetrics.freeCashFlow)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(restructuringMetrics.freeCashFlow, baseMetrics.freeCashFlow)}>
                        {formatCurrency(restructuringMetrics.freeCashFlow)}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Ending Cash */}
                  <TableRow>
                    <TableCell className="font-semibold">Остаток ДС (конец года)</TableCell>
                    <TableCell className="text-center">{formatCurrency(baseMetrics.endingCash)}</TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(downsideMetrics.endingCash, baseMetrics.endingCash)}>
                        {formatCurrency(downsideMetrics.endingCash)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={getValueColor(restructuringMetrics.endingCash, baseMetrics.endingCash)}>
                        {formatCurrency(restructuringMetrics.endingCash)}
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Net Debt/EBITDA */}
                  <TableRow className="bg-amber-50">
                    <TableCell className="font-semibold">Net Debt / EBITDA</TableCell>
                    <TableCell className="text-center">{formatNumber(baseMetrics.netDebtToEbitda)}x</TableCell>
                    <TableCell className="text-center">
                      <div className={downsideMetrics.netDebtToEbitda > baseMetrics.netDebtToEbitda ? 'text-red-600' : 'text-green-600'}>
                        {formatNumber(downsideMetrics.netDebtToEbitda)}x
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={restructuringMetrics.netDebtToEbitda > baseMetrics.netDebtToEbitda ? 'text-red-600' : 'text-green-600'}>
                        {formatNumber(restructuringMetrics.netDebtToEbitda)}x
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* DSCR */}
                  <TableRow>
                    <TableCell className="font-semibold">DSCR (Debt Service Coverage)</TableCell>
                    <TableCell className="text-center">{formatNumber(baseMetrics.dscr)}x</TableCell>
                    <TableCell className="text-center">
                      <div className={downsideMetrics.dscr < baseMetrics.dscr ? 'text-red-600' : 'text-green-600'}>
                        {formatNumber(downsideMetrics.dscr)}x
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={restructuringMetrics.dscr < baseMetrics.dscr ? 'text-red-600' : 'text-green-600'}>
                        {formatNumber(restructuringMetrics.dscr)}x
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Base</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3">
                Стабильное состояние с положительным cash flow и приемлемыми ковенантами.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>✅ DSCR &gt; 1.0 (здоровый уровень)</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span>✅ Положительный FCF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <CardTitle className="text-lg">Downside</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3">
                Критическая ситуация с риском нарушения ковенантов и кассовых разрывов.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-red-600 mt-0.5" />
                  <span>⚠️ Высокий Net Debt/EBITDA</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-red-600 mt-0.5" />
                  <span>⚠️ Возможен отрицательный FCF</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Restructuring</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-3">
                Оптимизация затрат позволяет сохранить положительный cash flow даже при падении выручки.
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>✅ Улучшение EBITDA margin</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>✅ Сохранение ликвидности</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
