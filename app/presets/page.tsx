'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { companyPresets, getIndustries } from '@/constants/company-presets'
import { formatCurrency } from '@/lib/utils'
import { ChevronLeft, Building2, TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default function PresetsPage() {
  const router = useRouter()
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  
  const industries = getIndustries()
  const filteredPresets = selectedIndustry === 'all' 
    ? companyPresets 
    : companyPresets.filter(p => p.industry === selectedIndustry)

  const handleLoadPreset = (presetId: string) => {
    // Сохраняем ID пресета в localStorage для загрузки в модуле диагностики
    localStorage.setItem('selectedPreset', presetId)
    router.push('/diagnostic')
  }

  const getSituationIcon = (situation: string) => {
    if (situation.includes('банкрот') || situation.includes('просрочка') || situation.includes('кризис')) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />
    } else if (situation.includes('стабильн') || situation.includes('прибыльн')) {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    } else {
      return <TrendingDown className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (preset: any) => {
    const situation = preset.situation.toLowerCase()
    if (situation.includes('банкрот') || situation.includes('просрочка') || situation.includes('кризис')) {
      return 'border-red-200 bg-red-50'
    } else if (situation.includes('стабильн') || situation.includes('прибыльн')) {
      return 'border-green-200 bg-green-50'
    } else {
      return 'border-yellow-200 bg-yellow-50'
    }
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
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Пресеты компаний
            </h1>
          </div>
          
          <p className="text-lg text-gray-600">
            Готовые примеры компаний из различных отраслей для быстрого тестирования калькулятора
          </p>
        </div>

        {/* Industry Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedIndustry === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedIndustry('all')}
            >
              Все отрасли ({companyPresets.length})
            </Button>
            {industries.map(industry => {
              const count = companyPresets.filter(p => p.industry === industry).length
              return (
                <Button
                  key={industry}
                  variant={selectedIndustry === industry ? 'default' : 'outline'}
                  onClick={() => setSelectedIndustry(industry)}
                >
                  {industry} ({count})
                </Button>
              )
            })}
          </div>
        </div>

        {/* Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => {
            const totalAssets = preset.balance.totalAssets || 0
            const totalRevenue = preset.income.revenue || 0
            const netIncome = preset.income.netProfit || 0
            const totalDebt = preset.debts.reduce((sum, debt) => sum + debt.principal, 0)
            const overdueDebt = preset.debts
              .filter(d => d.overdueAmount && d.overdueAmount > 0)
              .reduce((sum, debt) => sum + (debt.overdueAmount || 0), 0)

            return (
              <Card 
                key={preset.id} 
                className={`transition-all hover:shadow-lg ${getStatusColor(preset)}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{preset.name}</CardTitle>
                      <CardDescription className="text-sm font-medium text-blue-600">
                        {preset.industry}
                      </CardDescription>
                    </div>
                    {getSituationIcon(preset.situation)}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{preset.description}</p>
                </CardHeader>

                <CardContent>
                  {/* Ситуация */}
                  <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                      Текущая ситуация
                    </h4>
                    <p className="text-sm text-gray-700">{preset.situation}</p>
                  </div>

                  {/* Ключевые показатели */}
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Активы:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(totalAssets)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Выручка:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(totalRevenue)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Чистая прибыль:</span>
                      <span className={`text-sm font-semibold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(netIncome)}
                      </span>
                    </div>
                    
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Общий долг:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(totalDebt)}
                        </span>
                      </div>
                      
                      {overdueDebt > 0 && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Просрочено:</span>
                          <span className="text-sm font-semibold text-red-600">
                            {formatCurrency(overdueDebt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Дополнительная информация */}
                  <div className="flex gap-2 text-xs text-gray-500 mb-4">
                    <span>Сотрудников: {preset.companyInfo.employeeCount}</span>
                    <span>•</span>
                    <span>Год основания: {preset.companyInfo.foundedYear}</span>
                  </div>

                  {/* Кнопка загрузки */}
                  <Button 
                    className="w-full"
                    onClick={() => handleLoadPreset(preset.id)}
                  >
                    Загрузить данные
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredPresets.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Нет компаний в выбранной отрасли</p>
          </Card>
        )}

        {/* Info Footer */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Как использовать пресеты
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Выберите компанию из интересующей отрасли</li>
                  <li>Нажмите кнопку "Загрузить данные" для автоматического заполнения форм</li>
                  <li>Данные будут загружены в модуль "Финансовая диагностика"</li>
                  <li>Вы можете изменить любые параметры после загрузки</li>
                  <li>Все пресеты содержат реалистичные данные согласно отраслевой специфике</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
