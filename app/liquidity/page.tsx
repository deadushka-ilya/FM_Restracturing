'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Droplets,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calculator,
} from 'lucide-react'
import {
  TWCFModel,
  WeeklyCashInflows,
  WeeklyCashOutflows,
  StressScenario,
  StressTestParameters,
  BorrowingBase,
} from '@/types/liquidity'
import {
  generateEmptyTWCF,
  calculateTWCF,
  runStressTest,
  calculateBorrowingBase,
} from '@/modules/liquidity/calculations'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'

export default function LiquidityPage() {
  const [step, setStep] = useState<'input' | 'results'>('input')
  const [initialCash, setInitialCash] = useState(2000000)
  const [minimumCash, setMinimumCash] = useState(500000)
  const [model, setModel] = useState<TWCFModel | null>(null)
  const [stressScenario, setStressScenario] = useState<StressScenario>(StressScenario.BASE)
  const [selectedWeek, setSelectedWeek] = useState(1)

  // Тестовые данные
  const generateTestModel = () => {
    const startDate = new Date()
    const baseModel = generateEmptyTWCF(startDate, initialCash)

    // Заполняем тестовыми данными
    const weeklyRevenue = 4000000 // 4 млн в неделю
    const weeklyExpenses = 3500000 // 3.5 млн в неделю

    const inflows: WeeklyCashInflows[] = baseModel.weeklyInflows.map((week, index) => {
      const variability = 0.8 + Math.random() * 0.4 // +/- 20%
      const revenueWithVat = weeklyRevenue * variability
      const vatAmount = revenueWithVat * 0.2
      const revenueNet = revenueWithVat - vatAmount

      return {
        ...week,
        revenueWithVat,
        revenueVatAmount: vatAmount,
        revenueNetOfVat: revenueNet,
        receivablesCollection: index > 2 ? weeklyRevenue * 0.3 : 0, // Дебиторка с задержкой
        vatRefund: index === 4 ? 800000 : 0, // Возврат НДС на 4 неделе
        otherInflows: 100000,
        totalInflows: revenueWithVat + (index > 2 ? weeklyRevenue * 0.3 : 0) + 
                       (index === 4 ? 800000 : 0) + 100000,
      }
    })

    const outflows: WeeklyCashOutflows[] = baseModel.weeklyOutflows.map((week, index) => {
      const variability = 0.9 + Math.random() * 0.2
      const suppliersPayment = weeklyExpenses * 0.5 * variability
      const suppliersVat = suppliersPayment * 0.2
      const salaries = weeklyExpenses * 0.25
      const ndfl = salaries * 0.13
      const socialContrib = salaries * 0.3

      const totalOutflows =
        suppliersPayment +
        salaries +
        ndfl +
        socialContrib +
        (index % 4 === 0 ? 300000 : 0) + // Аренда раз в месяц
        (index === 3 ? 500000 : 0) + // НДС к уплате
        (index === 6 ? 400000 : 0) + // Налог на прибыль
        200000 + // Обслуживание долга
        (index === 8 ? 1000000 : 0) + // Крупный CAPEX
        100000 // Прочие

      return {
        ...week,
        suppliersPayment,
        suppliersVatAmount: suppliersVat,
        salaries,
        ndflTax: ndfl,
        socialContributions: socialContrib,
        rentPayment: index % 4 === 0 ? 300000 : 0,
        vatPayment: index === 3 ? 500000 : 0,
        incomeTaxPayment: index === 6 ? 400000 : 0,
        principalPayment: 150000,
        interestPayment: 50000,
        capexPayment: index === 8 ? 1000000 : 0,
        otherOutflows: 100000,
        totalOutflows,
        currentPaymentsAmount: salaries + ndfl + socialContrib + 
          (index % 4 === 0 ? 300000 : 0),
      }
    })

    const calculatedModel = calculateTWCF(inflows, outflows, initialCash, minimumCash)
    setModel(calculatedModel)
    setStep('results')
  }

  const runStress = () => {
    if (!model) return

    const params: StressTestParameters = {
      scenario: stressScenario,
      revenueDelayWeeks: 2,
      revenueDropPercent: 25,
    }

    const stressResult = runStressTest(model, params)
    setModel(stressResult.stressModel)
  }

  const borrowingBase = model
    ? calculateBorrowingBase(5000000, 3000000, 10000000, 0.85, 0.65, 0.75)
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => (window.location.href = '/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Droplets className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Модуль 2: Управление Ликвидностью (TWCF)
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                13-недельная модель денежного потока и стресс-тестирование
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'input' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Параметры модели</CardTitle>
                <CardDescription>Настройка 13-недельной модели денежного потока</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="initialCash">Начальный остаток денежных средств (руб)</Label>
                    <Input
                      id="initialCash"
                      type="number"
                      value={initialCash}
                      onChange={(e) => setInitialCash(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimumCash">Минимально необходимый остаток (руб)</Label>
                    <Input
                      id="minimumCash"
                      type="number"
                      value={minimumCash}
                      onChange={(e) => setMinimumCash(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Демонстрационный режим:</strong> Для демонстрации будет создана модель с
                    тестовыми данными. В полной версии здесь будет детальный ввод поступлений и выплат
                    по каждой неделе.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => (window.location.href = '/')}>
                Отмена
              </Button>
              <Button onClick={generateTestModel}>
                <Calculator className="h-4 w-4 mr-2" />
                Создать модель TWCF
              </Button>
            </div>
          </div>
        )}

        {step === 'results' && model && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Начальный остаток</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(model.initialCashBalance, false)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Итого поступлений</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(model.totalInflows, false)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Итого выплат</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(model.totalOutflows, false)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Конечный остаток</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${model.finalCashBalance > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(model.finalCashBalance, false)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Warnings */}
            {model.weeksWithShortfall > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-red-700">Кассовые разрывы выявлены</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-red-700">
                    <p>
                      <strong>Недель с разрывом:</strong> {model.weeksWithShortfall} из 13
                    </p>
                    <p>
                      <strong>Максимальный разрыв:</strong> {formatCurrency(model.maxShortfallAmount, false)}
                    </p>
                    <p>
                      <strong>Требуется финансирование:</strong>{' '}
                      {formatCurrency(model.totalFinancingRequired, false)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stress Testing */}
            <Card>
              <CardHeader>
                <CardTitle>Стресс-тестирование</CardTitle>
                <CardDescription>Анализ устойчивости ликвидности при негативных сценариях</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="stressScenario">Сценарий</Label>
                    <Select
                      id="stressScenario"
                      value={stressScenario}
                      onChange={(e) => setStressScenario(e.target.value as StressScenario)}
                    >
                      {Object.values(StressScenario).map((scenario) => (
                        <option key={scenario} value={scenario}>
                          {scenario}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={runStress} className="w-full">
                      Применить стресс-тест
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Описание сценариев:</strong>
                  </p>
                  <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc pl-5">
                    <li>
                      <strong>Задержка поступлений:</strong> Отсрочка получения выручки на 2 недели
                    </li>
                    <li>
                      <strong>Снижение выручки:</strong> Падение продаж на 25%
                    </li>
                    <li>
                      <strong>Комбинированный:</strong> Задержка + снижение выручки
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Cash Flow Table */}
            <Card>
              <CardHeader>
                <CardTitle>Недельный денежный поток</CardTitle>
                <CardDescription>Детализация по 13 неделям</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Неделя</TableHead>
                        <TableHead>Дата</TableHead>
                        <TableHead className="text-right">Начальный остаток</TableHead>
                        <TableHead className="text-right">Поступления</TableHead>
                        <TableHead className="text-right">Выплаты</TableHead>
                        <TableHead className="text-right">Чистый поток</TableHead>
                        <TableHead className="text-right">Конечный остаток</TableHead>
                        <TableHead>Статус</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {model.weeklyBalances.map((week) => (
                        <TableRow
                          key={week.week}
                          className={week.hasCashShortfall ? 'bg-red-50' : ''}
                        >
                          <TableCell className="font-medium">{week.week}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(week.startDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(week.openingBalance, false)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(week.totalInflows, false)}
                          </TableCell>
                          <TableCell className="text-right text-red-600">
                            {formatCurrency(week.totalOutflows, false)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${
                              week.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {week.netCashFlow >= 0 ? '+' : ''}
                            {formatCurrency(week.netCashFlow, false)}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              week.closingBalance >= minimumCash
                                ? 'text-blue-600'
                                : 'text-red-600'
                            }`}
                          >
                            {formatCurrency(week.closingBalance, false)}
                          </TableCell>
                          <TableCell>
                            {week.hasCashShortfall ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <TrendingDown className="h-4 w-4" />
                                <span className="text-xs">Разрыв</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-green-600">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs">OK</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Borrowing Base */}
            {borrowingBase && (
              <Card>
                <CardHeader>
                  <CardTitle>Borrowing Base (Залоговая база)</CardTitle>
                  <CardDescription>
                    Оценка доступного обеспечения для кредитных линий
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Актив</TableHead>
                        <TableHead className="text-right">Стоимость</TableHead>
                        <TableHead className="text-right">Advance Rate</TableHead>
                        <TableHead className="text-right">Borrowing Base</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Дебиторская задолженность</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(borrowingBase.eligibleReceivables, false)}
                        </TableCell>
                        <TableCell className="text-right">
                          {(borrowingBase.receivablesAdvanceRate * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(borrowingBase.receivablesBorrowingBase, false)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Запасы</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(borrowingBase.eligibleInventory, false)}
                        </TableCell>
                        <TableCell className="text-right">
                          {(borrowingBase.inventoryAdvanceRate * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(borrowingBase.inventoryBorrowingBase, false)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Оборудование</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(borrowingBase.eligibleEquipment, false)}
                        </TableCell>
                        <TableCell className="text-right">
                          {(borrowingBase.equipmentAdvanceRate * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(borrowingBase.equipmentBorrowingBase, false)}
                        </TableCell>
                      </TableRow>
                      <TableRow className="bg-blue-50 font-bold">
                        <TableCell>Итого Borrowing Base</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-right text-blue-700">
                          {formatCurrency(borrowingBase.totalBorrowingBase, false)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* VAT Position */}
            <Card>
              <CardHeader>
                <CardTitle>Позиция по НДС</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-600">НДС начислен (с продаж)</p>
                    <p className="text-xl font-bold">{formatCurrency(model.vatPosition.vatCollected, false)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">НДС к вычету (по покупкам)</p>
                    <p className="text-xl font-bold">{formatCurrency(model.vatPosition.vatDeductible, false)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">НДС к уплате</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(model.vatPosition.vatPayable, false)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">НДС к возмещению</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(model.vatPosition.vatRefundable, false)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep('input')}>
                ← Вернуться к настройкам
              </Button>
              <div className="flex gap-3">
                <Button variant="outline">Экспорт в Excel</Button>
                <Button variant="outline">Экспорт в PDF</Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
