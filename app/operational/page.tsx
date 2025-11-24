'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, FileText, Calculator } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

export default function OperationalPage() {
  const [currentCosts, setCurrentCosts] = useState({
    personnel: 15000000,
    rent: 3000000,
    marketing: 2000000,
    other: 5000000,
  })
  const [reductionPercent, setReductionPercent] = useState({
    personnel: 20,
    rent: 15,
    marketing: 30,
    other: 10,
  })
  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    const totalCurrent = Object.values(currentCosts).reduce((a, b) => a + b, 0)
    const savings = {
      personnel: currentCosts.personnel * (reductionPercent.personnel / 100),
      rent: currentCosts.rent * (reductionPercent.rent / 100),
      marketing: currentCosts.marketing * (reductionPercent.marketing / 100),
      other: currentCosts.other * (reductionPercent.other / 100),
    }
    const totalSavings = Object.values(savings).reduce((a, b) => a + b, 0)
    const newTotal = totalCurrent - totalSavings

    setResults({
      totalCurrent,
      totalSavings,
      newTotal,
      savingsPercent: (totalSavings / totalCurrent) * 100,
      annualSavings: totalSavings,
      ebitdaImprovement: totalSavings,
      savings,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Модуль 4: Операционная Реструктуризация</h1>
              <p className="text-sm text-gray-600">Turnaround и оптимизация затрат</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Текущие операционные расходы (годовые)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Персонал (ФОТ + налоги)</Label>
                <Input type="number" value={currentCosts.personnel} 
                  onChange={e => setCurrentCosts({...currentCosts, personnel: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Сокращение (%)</Label>
                <Input type="number" value={reductionPercent.personnel}
                  onChange={e => setReductionPercent({...reductionPercent, personnel: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Аренда и коммунальные</Label>
                <Input type="number" value={currentCosts.rent}
                  onChange={e => setCurrentCosts({...currentCosts, rent: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Сокращение (%)</Label>
                <Input type="number" value={reductionPercent.rent}
                  onChange={e => setReductionPercent({...reductionPercent, rent: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Маркетинг и реклама</Label>
                <Input type="number" value={currentCosts.marketing}
                  onChange={e => setCurrentCosts({...currentCosts, marketing: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Сокращение (%)</Label>
                <Input type="number" value={reductionPercent.marketing}
                  onChange={e => setReductionPercent({...reductionPercent, marketing: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Прочие расходы</Label>
                <Input type="number" value={currentCosts.other}
                  onChange={e => setCurrentCosts({...currentCosts, other: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Сокращение (%)</Label>
                <Input type="number" value={reductionPercent.other}
                  onChange={e => setReductionPercent({...reductionPercent, other: Number(e.target.value)})} />
              </div>
            </div>
            <Button onClick={calculate} className="mt-4">
              <Calculator className="h-4 w-4 mr-2" />
              Рассчитать эффект
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Текущие расходы</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(results.totalCurrent, false)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Экономия</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.totalSavings, false)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Новые расходы</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.newTotal, false)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Улучшение EBITDA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{formatCurrency(results.ebitdaImprovement, false)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Детализация экономии по статьям</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Статья расходов</TableHead>
                      <TableHead>Текущие</TableHead>
                      <TableHead>Сокращение</TableHead>
                      <TableHead>Экономия</TableHead>
                      <TableHead>После оптимизации</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(currentCosts).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {key === 'personnel' && 'Персонал'}
                          {key === 'rent' && 'Аренда'}
                          {key === 'marketing' && 'Маркетинг'}
                          {key === 'other' && 'Прочее'}
                        </TableCell>
                        <TableCell>{formatCurrency(value, false)}</TableCell>
                        <TableCell>{reductionPercent[key as keyof typeof reductionPercent]}%</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(results.savings[key], false)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(value - results.savings[key], false)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-blue-50 font-bold">
                      <TableCell>ИТОГО</TableCell>
                      <TableCell>{formatCurrency(results.totalCurrent, false)}</TableCell>
                      <TableCell>{formatPercent(results.savingsPercent)}</TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(results.totalSavings, false)}
                      </TableCell>
                      <TableCell>{formatCurrency(results.newTotal, false)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Рекомендации по реализации</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Сокращение персонала проводить с соблюдением ТК РФ (ст. 180-181)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Пересмотр договоров аренды и переговоры с арендодателями</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Оптимизация маркетинговых каналов с фокусом на ROI</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Централизация закупок и пересмотр договоров с поставщиками</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
