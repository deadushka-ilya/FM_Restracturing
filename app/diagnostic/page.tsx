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
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { CompanyInfo, BalanceSheet, IncomeStatement, CashFlowStatement, LegalForm, BankruptcyStatus } from '@/types/company'
import { Debt, DebtSummary } from '@/types/debt'
import { DiagnosticResults } from '@/types/diagnostic'
import { 
  calculateEbitda,
  calculateLiquidityRatios,
  calculateLeverageRatios,
  calculateCoverageRatios,
  calculateProfitabilityRatios,
  calculateOperationalMetrics,
  calculateBankruptcyIndicators,
  calculateBankruptcyProbability,
} from '@/modules/diagnostic/calculations'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'

export default function DiagnosticPage() {
  const [step, setStep] = useState<'input' | 'results'>('input')
  const [companyInfo, setCompanyInfo] = useState<Partial<CompanyInfo>>({
    legalForm: LegalForm.OOO,
    bankruptcyStatus: BankruptcyStatus.NONE,
  })
  const [balance, setBalance] = useState<Partial<BalanceSheet>>({})
  const [income, setIncome] = useState<Partial<IncomeStatement>>({})
  const [cashFlow, setCashFlow] = useState<Partial<CashFlowStatement>>({})
  const [results, setResults] = useState<DiagnosticResults | null>(null)

  const handleCalculate = () => {
    // Создаем тестовые данные для демонстрации
    const testBalance: BalanceSheet = {
      date: new Date().toISOString(),
      // Внеоборотные активы
      intangibleAssets: Number(balance.intangibleAssets) || 0,
      fixedAssets: Number(balance.fixedAssets) || 10000000,
      constructionInProgress: Number(balance.constructionInProgress) || 0,
      profitableInvestments: Number(balance.profitableInvestments) || 0,
      financialInvestments: Number(balance.financialInvestments) || 0,
      deferredTaxAssets: Number(balance.deferredTaxAssets) || 0,
      otherNonCurrentAssets: Number(balance.otherNonCurrentAssets) || 0,
      // Оборотные активы
      inventory: Number(balance.inventory) || 3000000,
      materialReserves: 0,
      workInProgress: 0,
      finishedGoods: 0,
      vat: Number(balance.vat) || 500000,
      receivables: Number(balance.receivables) || 5000000,
      receivablesLongTerm: 0,
      financialInvestmentsShortTerm: 0,
      cash: Number(balance.cash) || 2000000,
      otherCurrentAssets: 0,
      // Капитал
      authorizedCapital: Number(balance.authorizedCapital) || 1000000,
      ownShares: 0,
      revaluation: 0,
      additionalCapital: 0,
      reserveCapital: 0,
      retainedEarnings: Number(balance.retainedEarnings) || 5000000,
      // Долгосрочные обязательства
      loansLongTerm: Number(balance.loansLongTerm) || 8000000,
      deferredTaxLiabilities: 0,
      estimatedLiabilitiesLongTerm: 0,
      otherLiabilitiesLongTerm: 0,
      // Краткосрочные обязательства
      loansShortTerm: Number(balance.loansShortTerm) || 3000000,
      payables: Number(balance.payables) || 3500000,
      payablesToSuppliers: 0,
      payablesToPersonnel: 0,
      payablesToGovernment: 0,
      payablesToFunds: 0,
      incomeReceivedInAdvance: 0,
      estimatedLiabilitiesShortTerm: 0,
      otherLiabilitiesShortTerm: 0,
    }

    const testIncome: IncomeStatement = {
      date: new Date().toISOString(),
      period: 'year',
      revenue: Number(income.revenue) || 50000000,
      costOfSales: Number(income.costOfSales) || 30000000,
      grossProfit: Number(income.grossProfit) || 20000000,
      commercialExpenses: Number(income.commercialExpenses) || 5000000,
      administrativeExpenses: Number(income.administrativeExpenses) || 8000000,
      operatingProfit: Number(income.operatingProfit) || 7000000,
      incomeFromParticipation: 0,
      percentReceivable: 0,
      percentPayable: Number(income.percentPayable) || 1200000,
      otherIncome: 0,
      otherExpenses: 0,
      profitBeforeTax: Number(income.profitBeforeTax) || 5800000,
      currentIncomeTax: Number(income.currentIncomeTax) || 1160000,
      deferredIncomeTax: 0,
      otherTax: 0,
      netProfit: Number(income.netProfit) || 4640000,
    }

    const testCashFlow: CashFlowStatement = {
      date: new Date().toISOString(),
      period: 'year',
      cashFromOperations: Number(cashFlow.cashFromOperations) || 6000000,
      cashFromCustomers: 0,
      cashToSuppliers: 0,
      cashToEmployees: 0,
      interestPaid: 0,
      incomeTaxPaid: 0,
      otherOperatingCash: 0,
      cashFromInvesting: -1000000,
      purchaseOfFixedAssets: 0,
      saleOfFixedAssets: 0,
      purchaseOfInvestments: 0,
      saleOfInvestments: 0,
      cashFromFinancing: -4000000,
      proceedsFromLoans: 0,
      repaymentOfLoans: 3000000,
      proceedsFromEquity: 0,
      dividendsPaid: 0,
      netCashFlow: 1000000,
      cashBeginning: 1000000,
      cashEnding: 2000000,
    }

    const testDebts: Debt[] = []
    const testDebtSummary: DebtSummary = {
      totalDebt: 11000000,
      securedDebt: 5000000,
      unsecuredDebt: 6000000,
      subordinatedDebt: 0,
      bankLoans: 8000000,
      leasing: 0,
      tradePayables: 3000000,
      taxDebt: 0,
      otherDebt: 0,
      currentDebt: 3000000,
      longTermDebt: 8000000,
      overdueDebt: 0,
      overdueMore90Days: 0,
      totalPenalties: 0,
      debtByCurrency: {
        RUB: 11000000,
        USD: 0,
        EUR: 0,
        CNY: 0,
      },
      weightedAverageRate: 12,
    }

    // Расчет показателей
    const ebitda = calculateEbitda(testIncome)
    const liquidityRatios = calculateLiquidityRatios(testBalance)
    const leverageRatios = calculateLeverageRatios(testBalance, testDebtSummary, ebitda)
    const coverageRatios = calculateCoverageRatios(testIncome, testCashFlow, testDebtSummary, ebitda)
    const profitabilityRatios = calculateProfitabilityRatios(testBalance, testIncome, ebitda)
    const operationalMetrics = calculateOperationalMetrics(testBalance, testIncome)
    const bankruptcyIndicators = calculateBankruptcyIndicators(testBalance, testDebts, testCashFlow)
    const bankruptcyProbability = calculateBankruptcyProbability(testBalance, testIncome, leverageRatios)

    const diagnosticResults: DiagnosticResults = {
      calculationDate: new Date().toISOString(),
      reportedEbitda: ebitda,
      adjustedEbitda: ebitda,
      adjustments: [],
      liquidityRatios,
      leverageRatios,
      coverageRatios,
      profitabilityRatios,
      operationalMetrics,
      bankruptcyIndicators,
      bankruptcyProbability,
      overallHealth: bankruptcyProbability.overallRisk === 'Низкий' ? 'Хорошее' :
                     bankruptcyProbability.overallRisk === 'Средний' ? 'Удовлетворительное' :
                     bankruptcyProbability.overallRisk === 'Высокий' ? 'Плохое' : 'Критическое',
      recommendations: [
        'Рекомендуется провести детальный анализ дебиторской задолженности',
        'Рассмотреть возможность реструктуризации долгосрочных обязательств',
        'Оптимизировать управление оборотным капиталом',
      ],
    }

    setResults(diagnosticResults)
    setStep('results')
  }

  const getRatioStatus = (value: number, thresholds: { good: number, warning: number, critical: number }, reverse: boolean = false) => {
    if (reverse) {
      if (value <= thresholds.good) return { icon: CheckCircle, color: 'text-green-600', label: 'Хорошо' }
      if (value <= thresholds.warning) return { icon: AlertTriangle, color: 'text-yellow-600', label: 'Внимание' }
      return { icon: XCircle, color: 'text-red-600', label: 'Критично' }
    } else {
      if (value >= thresholds.good) return { icon: CheckCircle, color: 'text-green-600', label: 'Хорошо' }
      if (value >= thresholds.warning) return { icon: AlertTriangle, color: 'text-yellow-600', label: 'Внимание' }
      return { icon: XCircle, color: 'text-red-600', label: 'Критично' }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Модуль 1: Диагностика и Базовая Оценка
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Анализ финансового состояния компании и признаки банкротства по ФЗ-127
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'input' && (
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>Информация о компании</CardTitle>
                <CardDescription>Основные данные организации</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="companyName">Наименование</Label>
                    <Input
                      id="companyName"
                      value={companyInfo.name || ''}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                      placeholder="ООО «Пример»"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inn">ИНН</Label>
                    <Input
                      id="inn"
                      value={companyInfo.inn || ''}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, inn: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor="legalForm">Организационно-правовая форма</Label>
                    <Select
                      id="legalForm"
                      value={companyInfo.legalForm}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, legalForm: e.target.value as LegalForm })}
                    >
                      {Object.values(LegalForm).map((form) => (
                        <option key={form} value={form}>{form}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="bankruptcyStatus">Статус в процедуре банкротства</Label>
                    <Select
                      id="bankruptcyStatus"
                      value={companyInfo.bankruptcyStatus}
                      onChange={(e) => setCompanyInfo({ ...companyInfo, bankruptcyStatus: e.target.value as BankruptcyStatus })}
                    >
                      {Object.values(BankruptcyStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Sheet */}
            <Card>
              <CardHeader>
                <CardTitle>Бухгалтерский баланс (упрощенный)</CardTitle>
                <CardDescription>Форма 1 РСБУ - основные статьи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h4 className="font-semibold text-sm text-gray-700">Внеоборотные активы</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fixedAssets">Основные средства</Label>
                    <Input
                      id="fixedAssets"
                      type="number"
                      value={balance.fixedAssets || ''}
                      onChange={(e) => setBalance({ ...balance, fixedAssets: Number(e.target.value) })}
                      placeholder="10000000"
                    />
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-gray-700 mt-6">Оборотные активы</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="inventory">Запасы</Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={balance.inventory || ''}
                      onChange={(e) => setBalance({ ...balance, inventory: Number(e.target.value) })}
                      placeholder="3000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="receivables">Дебиторская задолженность</Label>
                    <Input
                      id="receivables"
                      type="number"
                      value={balance.receivables || ''}
                      onChange={(e) => setBalance({ ...balance, receivables: Number(e.target.value) })}
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cash">Денежные средства</Label>
                    <Input
                      id="cash"
                      type="number"
                      value={balance.cash || ''}
                      onChange={(e) => setBalance({ ...balance, cash: Number(e.target.value) })}
                      placeholder="2000000"
                    />
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-gray-700 mt-6">Капитал и резервы</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="authorizedCapital">Уставный капитал</Label>
                    <Input
                      id="authorizedCapital"
                      type="number"
                      value={balance.authorizedCapital || ''}
                      onChange={(e) => setBalance({ ...balance, authorizedCapital: Number(e.target.value) })}
                      placeholder="1000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retainedEarnings">Нераспределенная прибыль</Label>
                    <Input
                      id="retainedEarnings"
                      type="number"
                      value={balance.retainedEarnings || ''}
                      onChange={(e) => setBalance({ ...balance, retainedEarnings: Number(e.target.value) })}
                      placeholder="5000000"
                    />
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-gray-700 mt-6">Обязательства</h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="loansLongTerm">Долгосрочные займы</Label>
                    <Input
                      id="loansLongTerm"
                      type="number"
                      value={balance.loansLongTerm || ''}
                      onChange={(e) => setBalance({ ...balance, loansLongTerm: Number(e.target.value) })}
                      placeholder="8000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loansShortTerm">Краткосрочные займы</Label>
                    <Input
                      id="loansShortTerm"
                      type="number"
                      value={balance.loansShortTerm || ''}
                      onChange={(e) => setBalance({ ...balance, loansShortTerm: Number(e.target.value) })}
                      placeholder="3000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payables">Кредиторская задолженность</Label>
                    <Input
                      id="payables"
                      type="number"
                      value={balance.payables || ''}
                      onChange={(e) => setBalance({ ...balance, payables: Number(e.target.value) })}
                      placeholder="3500000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Income Statement */}
            <Card>
              <CardHeader>
                <CardTitle>Отчет о финансовых результатах (упрощенный)</CardTitle>
                <CardDescription>Форма 2 РСБУ - основные статьи</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="revenue">Выручка</Label>
                    <Input
                      id="revenue"
                      type="number"
                      value={income.revenue || ''}
                      onChange={(e) => setIncome({ ...income, revenue: Number(e.target.value) })}
                      placeholder="50000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="costOfSales">Себестоимость продаж</Label>
                    <Input
                      id="costOfSales"
                      type="number"
                      value={income.costOfSales || ''}
                      onChange={(e) => setIncome({ ...income, costOfSales: Number(e.target.value) })}
                      placeholder="30000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commercialExpenses">Коммерческие расходы</Label>
                    <Input
                      id="commercialExpenses"
                      type="number"
                      value={income.commercialExpenses || ''}
                      onChange={(e) => setIncome({ ...income, commercialExpenses: Number(e.target.value) })}
                      placeholder="5000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="administrativeExpenses">Управленческие расходы</Label>
                    <Input
                      id="administrativeExpenses"
                      type="number"
                      value={income.administrativeExpenses || ''}
                      onChange={(e) => setIncome({ ...income, administrativeExpenses: Number(e.target.value) })}
                      placeholder="8000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operatingProfit">Операционная прибыль</Label>
                    <Input
                      id="operatingProfit"
                      type="number"
                      value={income.operatingProfit || ''}
                      onChange={(e) => setIncome({ ...income, operatingProfit: Number(e.target.value) })}
                      placeholder="7000000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="percentPayable">Проценты к уплате</Label>
                    <Input
                      id="percentPayable"
                      type="number"
                      value={income.percentPayable || ''}
                      onChange={(e) => setIncome({ ...income, percentPayable: Number(e.target.value) })}
                      placeholder="1200000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Движение денежных средств (упрощенный)</CardTitle>
                <CardDescription>ОДДС - основные показатели</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="cashFromOperations">Денежный поток от операционной деятельности</Label>
                    <Input
                      id="cashFromOperations"
                      type="number"
                      value={cashFlow.cashFromOperations || ''}
                      onChange={(e) => setCashFlow({ ...cashFlow, cashFromOperations: Number(e.target.value) })}
                      placeholder="6000000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                Отмена
              </Button>
              <Button onClick={handleCalculate}>
                <TrendingUp className="h-4 w-4 mr-2" />
                Рассчитать показатели
              </Button>
            </div>
          </div>
        )}

        {step === 'results' && results && (
          <div className="space-y-6">
            {/* Overall Status */}
            <Card className={`border-2 ${
              results.overallHealth === 'Отличное' || results.overallHealth === 'Хорошее' ? 'border-green-200 bg-green-50' :
              results.overallHealth === 'Удовлетворительное' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}>
              <CardHeader>
                <CardTitle className="text-2xl">Общая оценка финансового состояния</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${
                    results.overallHealth === 'Отличное' || results.overallHealth === 'Хорошее' ? 'text-green-700' :
                    results.overallHealth === 'Удовлетворительное' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {results.overallHealth}
                  </div>
                  <div className="text-sm text-gray-700">
                    <p>Риск банкротства: <strong>{results.bankruptcyProbability.overallRisk}</strong></p>
                    <p className="mt-1">Altman Z-Score: {results.bankruptcyProbability.altmanZScore.toFixed(2)} ({results.bankruptcyProbability.altmanInterpretation})</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liquidity Ratios */}
            <Card>
              <CardHeader>
                <CardTitle>Коэффициенты ликвидности</CardTitle>
                <CardDescription>Оценка способности компании погашать краткосрочные обязательства</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Показатель</TableHead>
                      <TableHead>Значение</TableHead>
                      <TableHead>Норматив</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Коэффициент текущей ликвидности</TableCell>
                      <TableCell>{results.liquidityRatios.currentRatio.toFixed(2)}</TableCell>
                      <TableCell>&gt; 2.0</TableCell>
                      <TableCell>
                        {(() => {
                          const status = getRatioStatus(results.liquidityRatios.currentRatio, { good: 2.0, warning: 1.5, critical: 1.0 })
                          const Icon = status.icon
                          return (
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${status.color}`} />
                              <span className={status.color}>{status.label}</span>
                            </div>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Коэффициент быстрой ликвидности</TableCell>
                      <TableCell>{results.liquidityRatios.quickRatio.toFixed(2)}</TableCell>
                      <TableCell>&gt; 1.0</TableCell>
                      <TableCell>
                        {(() => {
                          const status = getRatioStatus(results.liquidityRatios.quickRatio, { good: 1.0, warning: 0.8, critical: 0.5 })
                          const Icon = status.icon
                          return (
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${status.color}`} />
                              <span className={status.color}>{status.label}</span>
                            </div>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Чистый оборотный капитал</TableCell>
                      <TableCell>{formatCurrency(results.liquidityRatios.netWorkingCapital, false)}</TableCell>
                      <TableCell>&gt; 0</TableCell>
                      <TableCell>
                        {results.liquidityRatios.netWorkingCapital > 0 ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">Положительный</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-red-600">Отрицательный</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Leverage Ratios */}
            <Card>
              <CardHeader>
                <CardTitle>Коэффициенты финансового рычага</CardTitle>
                <CardDescription>Оценка долговой нагрузки компании</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Показатель</TableHead>
                      <TableHead>Значение</TableHead>
                      <TableHead>Норматив</TableHead>
                      <TableHead>Статус</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Net Debt / EBITDA</TableCell>
                      <TableCell>{results.leverageRatios.netDebtToEbitda.toFixed(2)}x</TableCell>
                      <TableCell>&lt; 3.5x</TableCell>
                      <TableCell>
                        {(() => {
                          const status = getRatioStatus(results.leverageRatios.netDebtToEbitda, { good: 2.0, warning: 3.5, critical: 5.0 }, true)
                          const Icon = status.icon
                          return (
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${status.color}`} />
                              <span className={status.color}>{status.label}</span>
                            </div>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Debt / Equity</TableCell>
                      <TableCell>{results.leverageRatios.debtToEquity.toFixed(2)}</TableCell>
                      <TableCell>&lt; 2.0</TableCell>
                      <TableCell>
                        {(() => {
                          const status = getRatioStatus(results.leverageRatios.debtToEquity, { good: 1.0, warning: 2.0, critical: 3.0 }, true)
                          const Icon = status.icon
                          return (
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${status.color}`} />
                              <span className={status.color}>{status.label}</span>
                            </div>
                          )
                        })()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bankruptcy Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Признаки банкротства по ФЗ-127</CardTitle>
                <CardDescription>Анализ признаков неплатежеспособности и недостаточности имущества</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-4 rounded-lg ${results.bankruptcyIndicators.hasInsolvencyIndicator ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {results.bankruptcyIndicators.hasInsolvencyIndicator ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-700">Признак неплатежеспособности выявлен</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-700">Признаков неплатежеспособности не выявлено</span>
                      </>
                    )}
                  </h4>
                  <p className={results.bankruptcyIndicators.hasInsolvencyIndicator ? 'text-red-700' : 'text-green-700'}>
                    {results.bankruptcyIndicators.insolvencyDescription}
                  </p>
                </div>

                <div className={`p-4 rounded-lg ${results.bankruptcyIndicators.hasAssetDeficiency ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    {results.bankruptcyIndicators.hasAssetDeficiency ? (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-red-700">Недостаточность имущества</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-700">Имущества достаточно для покрытия обязательств</span>
                      </>
                    )}
                  </h4>
                  {results.bankruptcyIndicators.hasAssetDeficiency && (
                    <p className="text-red-700">
                      Дефицит: {formatCurrency(results.bankruptcyIndicators.assetDeficiencyAmount, false)}
                    </p>
                  )}
                </div>

                {results.bankruptcyIndicators.subsidiaryLiabilityRisks.length > 0 && (
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="text-amber-700">Риски субсидиарной ответственности</span>
                    </h4>
                    <ul className="list-disc pl-6 text-amber-700">
                      {results.bankruptcyIndicators.subsidiaryLiabilityRisks.map((risk, index) => (
                        <li key={index}>{risk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Рекомендации</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep('input')}>
                ← Вернуться к вводу данных
              </Button>
              <div className="flex gap-3">
                <Button variant="outline">
                  Экспорт в Excel
                </Button>
                <Button variant="outline">
                  Экспорт в PDF
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
