'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Scale, Calculator, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

export default function LiquidationPage() {
  const [assets, setAssets] = useState({
    realEstate: 20000000,
    equipment: 5000000,
    inventory: 3000000,
    receivables: 4000000,
  })
  const [claims, setClaims] = useState({
    secured: 15000000,
    salaries: 2000000,
    taxes: 3000000,
    unsecured: 10000000,
  })
  const [costs, setCosts] = useState(2000000)
  const [results, setResults] = useState<any>(null)

  const calculate = () => {
    // Ликвидационная стоимость с дисконтами
    const liquidationValues = {
      realEstate: assets.realEstate * 0.7,
      equipment: assets.equipment * 0.4,
      inventory: assets.inventory * 0.6,
      receivables: assets.receivables * 0.7,
    }
    const totalLiquidationValue = Object.values(liquidationValues).reduce((a, b) => a + b, 0)
    const netProceeds = totalLiquidationValue - costs

    // Waterfall по ФЗ-127
    let remaining = netProceeds
    const distribution: any = {}

    // Внеочередные (судебные расходы уже учтены в costs)
    distribution.outOfQueue = costs

    // 1-я очередь (вред жизни/здоровью) - для примера 0
    distribution.firstPriority = 0
    
    // 2-я очередь (зарплата)
    distribution.secondPriority = Math.min(remaining, claims.salaries)
    remaining -= distribution.secondPriority

    // 3-я очередь (обеспеченные, налоги, необеспеченные)
    const thirdPriorityClaims = claims.secured + claims.taxes + claims.unsecured
    distribution.secured = Math.min(remaining * (claims.secured / thirdPriorityClaims), claims.secured)
    distribution.taxes = Math.min((remaining - distribution.secured) * (claims.taxes / (claims.taxes + claims.unsecured)), claims.taxes)
    distribution.unsecured = remaining - distribution.secured - distribution.taxes

    const totalClaims = Object.values(claims).reduce((a, b) => a + b, 0)
    const recoveryRates = {
      secured: (distribution.secured / claims.secured) * 100,
      salaries: (distribution.secondPriority / claims.salaries) * 100,
      taxes: (distribution.taxes / claims.taxes) * 100,
      unsecured: (distribution.unsecured / claims.unsecured) * 100,
    }

    setResults({
      liquidationValues,
      totalBookValue: Object.values(assets).reduce((a, b) => a + b, 0),
      totalLiquidationValue,
      liquidationDiscount: ((Object.values(assets).reduce((a, b) => a + b, 0) - totalLiquidationValue) / Object.values(assets).reduce((a, b) => a + b, 0)) * 100,
      costs,
      netProceeds,
      totalClaims,
      distribution,
      recoveryRates,
      shortfall: totalClaims - netProceeds,
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
            <Scale className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">Модуль 5: Моделирование Ликвидации</h1>
              <p className="text-sm text-gray-600">Waterfall по ФЗ-127 и Recovery Rate</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-1" />
              <div>
                <p className="text-sm text-amber-800">
                  <strong>Важно:</strong> Данный расчет носит оценочный характер. Реальный процесс ликвидации
                  регулируется ФЗ-127 и требует участия арбитражного управляющего.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Активы (балансовая стоимость)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Недвижимость</Label>
                <Input type="number" value={assets.realEstate}
                  onChange={e => setAssets({...assets, realEstate: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Оборудование</Label>
                <Input type="number" value={assets.equipment}
                  onChange={e => setAssets({...assets, equipment: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Запасы</Label>
                <Input type="number" value={assets.inventory}
                  onChange={e => setAssets({...assets, inventory: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Дебиторская задолженность</Label>
                <Input type="number" value={assets.receivables}
                  onChange={e => setAssets({...assets, receivables: Number(e.target.value)})} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Требования кредиторов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Обеспеченные залогом</Label>
                <Input type="number" value={claims.secured}
                  onChange={e => setClaims({...claims, secured: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Зарплата (2-я очередь)</Label>
                <Input type="number" value={claims.salaries}
                  onChange={e => setClaims({...claims, salaries: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Налоги и взносы</Label>
                <Input type="number" value={claims.taxes}
                  onChange={e => setClaims({...claims, taxes: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Необеспеченные (поставщики, банки)</Label>
                <Input type="number" value={claims.unsecured}
                  onChange={e => setClaims({...claims, unsecured: Number(e.target.value)})} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Расходы на процедуру</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Label>Судебные расходы, вознаграждение управляющего, торги</Label>
              <Input type="number" value={costs}
                onChange={e => setCosts(Number(e.target.value))} />
            </div>
            <Button onClick={calculate} className="mt-4">
              <Calculator className="h-4 w-4 mr-2" />
              Рассчитать Waterfall
            </Button>
          </CardContent>
        </Card>

        {results && (
          <div className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Балансовая стоимость</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(results.totalBookValue, false)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Ликвидационная стоимость</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatCurrency(results.totalLiquidationValue, false)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Дисконт {formatPercent(results.liquidationDiscount)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>К распределению</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(results.netProceeds, false)}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-red-200">
                <CardHeader className="pb-3">
                  <CardDescription>Непокрытые требования</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(results.shortfall, false)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Waterfall - Распределение по очередности (ФЗ-127)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Очередь</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead className="text-right">Требования</TableHead>
                      <TableHead className="text-right">Выплачено</TableHead>
                      <TableHead className="text-right">Recovery Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Внеочередные</TableCell>
                      <TableCell>Судебные расходы, управляющий</TableCell>
                      <TableCell className="text-right">{formatCurrency(costs, false)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(results.distribution.outOfQueue, false)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">2-я очередь</TableCell>
                      <TableCell>Зарплата, авторские вознаграждения</TableCell>
                      <TableCell className="text-right">{formatCurrency(claims.salaries, false)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(results.distribution.secondPriority, false)}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatPercent(results.recoveryRates.salaries)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3-я очередь</TableCell>
                      <TableCell>Обеспеченные залогом</TableCell>
                      <TableCell className="text-right">{formatCurrency(claims.secured, false)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(results.distribution.secured, false)}</TableCell>
                      <TableCell className="text-right font-medium text-amber-600">
                        {formatPercent(results.recoveryRates.secured)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3-я очередь</TableCell>
                      <TableCell>Налоги и взносы</TableCell>
                      <TableCell className="text-right">{formatCurrency(claims.taxes, false)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(results.distribution.taxes, false)}</TableCell>
                      <TableCell className="text-right font-medium text-amber-600">
                        {formatPercent(results.recoveryRates.taxes)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">3-я очередь</TableCell>
                      <TableCell>Необеспеченные</TableCell>
                      <TableCell className="text-right">{formatCurrency(claims.unsecured, false)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(results.distribution.unsecured, false)}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        {formatPercent(results.recoveryRates.unsecured)}
                      </TableCell>
                    </TableRow>
                    <TableRow className="bg-gray-50 font-bold">
                      <TableCell colSpan={2}>ИТОГО</TableCell>
                      <TableCell className="text-right">{formatCurrency(results.totalClaims, false)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(results.netProceeds, false)}</TableCell>
                      <TableCell className="text-right">
                        {formatPercent((results.netProceeds / results.totalClaims) * 100)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ликвидационная стоимость активов</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Актив</TableHead>
                      <TableHead className="text-right">Балансовая</TableHead>
                      <TableHead className="text-right">Дисконт</TableHead>
                      <TableHead className="text-right">Ликвидационная</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Недвижимость</TableCell>
                      <TableCell className="text-right">{formatCurrency(assets.realEstate, false)}</TableCell>
                      <TableCell className="text-right">30%</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(results.liquidationValues.realEstate, false)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Оборудование</TableCell>
                      <TableCell className="text-right">{formatCurrency(assets.equipment, false)}</TableCell>
                      <TableCell className="text-right">60%</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(results.liquidationValues.equipment, false)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Запасы</TableCell>
                      <TableCell className="text-right">{formatCurrency(assets.inventory, false)}</TableCell>
                      <TableCell className="text-right">40%</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(results.liquidationValues.inventory, false)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Дебиторская задолженность</TableCell>
                      <TableCell className="text-right">{formatCurrency(assets.receivables, false)}</TableCell>
                      <TableCell className="text-right">30%</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(results.liquidationValues.receivables, false)}</TableCell>
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
