'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, DollarSign, TrendingUp, Calculator } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

export default function DebtRestructuringPage() {
  const [debtAmount, setDebtAmount] = useState(10000000)
  const [interestRate, setInterestRate] = useState(12)
  const [newRate, setNewRate] = useState(8)
  const [haircutPercent, setHaircutPercent] = useState(30)
  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    const interestSavingRate = (interestRate - newRate) / 100
    const annualSavings = debtAmount * interestSavingRate
    const haircutAmount = debtAmount * (haircutPercent / 100)
    const newDebt = debtAmount - haircutAmount
    
    setResults({
      originalDebt: debtAmount,
      newDebt,
      haircutAmount,
      annualInterestSavings: annualSavings,
      totalSavings: haircutAmount + annualSavings * 5,
      newMonthlyPayment: (newDebt * (newRate / 100 / 12)) / (1 - Math.pow(1 + newRate / 100 / 12, -60)),
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
            <DollarSign className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Модуль 3: Финансовая Реструктуризация</h1>
              <p className="text-sm text-gray-600">Моделирование реструктуризации долга</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Параметры реструктуризации</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Текущая задолженность (руб)</Label>
                <Input type="number" value={debtAmount} onChange={e => setDebtAmount(Number(e.target.value))} />
              </div>
              <div>
                <Label>Текущая ставка (%)</Label>
                <Input type="number" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
              </div>
              <div>
                <Label>Новая ставка (%)</Label>
                <Input type="number" value={newRate} onChange={e => setNewRate(Number(e.target.value))} />
              </div>
              <div>
                <Label>Списание долга (haircut, %)</Label>
                <Input type="number" value={haircutPercent} onChange={e => setHaircutPercent(Number(e.target.value))} />
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
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Списание долга</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.haircutAmount, false)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Экономия на процентах (год)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.annualInterestSavings, false)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Общая экономия (5 лет)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(results.totalSavings, false)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Сравнение до/после</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Показатель</TableHead>
                      <TableHead>До реструктуризации</TableHead>
                      <TableHead>После реструктуризации</TableHead>
                      <TableHead>Изменение</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Общий долг</TableCell>
                      <TableCell>{formatCurrency(results.originalDebt, false)}</TableCell>
                      <TableCell>{formatCurrency(results.newDebt, false)}</TableCell>
                      <TableCell className="text-green-600">-{formatPercent(haircutPercent)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Процентная ставка</TableCell>
                      <TableCell>{interestRate}%</TableCell>
                      <TableCell>{newRate}%</TableCell>
                      <TableCell className="text-green-600">-{interestRate - newRate}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
