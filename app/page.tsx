'use client'

import { useState } from 'react'
import { Disclaimer } from '@/components/layout/disclaimer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Scale,
  Calculator,
  Building2,
  Activity,
  Sparkles
} from 'lucide-react'

export default function Home() {
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  const modules = [
    {
      id: 'diagnostic',
      title: 'Диагностика и Базовая Оценка',
      description: 'Анализ финансового состояния, расчет коэффициентов, признаки банкротства по ФЗ-127',
      icon: BarChart3,
      status: 'available',
      link: '/diagnostic',
    },
    {
      id: 'liquidity',
      title: 'Управление Ликвидностью (TWCF)',
      description: '13-недельная модель денежного потока, стресс-тесты, залоговая база',
      icon: TrendingDown,
      status: 'available',
      link: '/liquidity',
    },
    {
      id: 'debt',
      title: 'Финансовая Реструктуризация',
      description: 'Реструктуризация долга, конвертация в капитал, рефинансирование',
      icon: DollarSign,
      status: 'available',
      link: '/debt-restructuring',
    },
    {
      id: 'operational',
      title: 'Операционная Реструктуризация',
      description: 'Turnaround, Transformation, SOTP-оценка, продажа активов',
      icon: FileText,
      status: 'available',
      link: '/operational',
    },
    {
      id: 'liquidation',
      title: 'Моделирование Ликвидации',
      description: 'Waterfall по ФЗ-127, ликвидационная стоимость, Recovery Rate',
      icon: Scale,
      status: 'available',
      link: '/liquidation',
    },
  ]

  return (
    <>
      {showDisclaimer && <Disclaimer />}
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <Calculator className="h-10 w-10 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Калькулятор Реструктуризации Бизнеса
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Инструмент для оперативной диагностики и моделирования стратегий корпоративной реструктуризации (РФ)
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Info Banner */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    О калькуляторе
                  </h3>
                  <p className="text-blue-800 mb-3">
                    Веб-инструмент для анализа финансового состояния российских компаний и моделирования
                    стратегий реструктуризации с учетом законодательства РФ:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1 ml-5 list-disc">
                    <li>ФЗ-127 «О несостоятельности (банкротстве)»</li>
                    <li>ГК РФ, ФЗ-14 «Об ООО», ФЗ-208 «Об АО»</li>
                    <li>НК РФ (налоговое законодательство)</li>
                    <li>Очередность удовлетворения требований кредиторов</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feature Banners */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Presets Banner */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <Building2 className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-base font-semibold text-green-900">
                      Готовые примеры
                    </h3>
                  </div>
                  <p className="text-sm text-green-800">
                    10 пресетов компаний из различных отраслей
                  </p>
                  <Button 
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                    onClick={() => window.location.href = '/presets'}
                  >
                    Смотреть пресеты
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Scenario Comparison Banner */}
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Activity className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="text-base font-semibold text-purple-900">
                      Сценарии
                    </h3>
                  </div>
                  <p className="text-sm text-purple-800">
                    Сравните Base, Downside и Restructuring
                  </p>
                  <Button 
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    onClick={() => window.location.href = '/scenario-comparison'}
                  >
                    Сравнить
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Features Banner */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-blue-900">
                      Новые возможности
                    </h3>
                  </div>
                  <p className="text-sm text-blue-800">
                    Cash Wall, Payment Waterfall, Collection Matrix
                  </p>
                  <Button 
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                    onClick={() => window.location.href = '/advanced-features'}
                  >
                    Подробнее
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modules Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Модули калькулятора</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => {
                const Icon = module.icon
                const isAvailable = module.status === 'available'
                
                return (
                  <Card 
                    key={module.id} 
                    className={`relative ${!isAvailable ? 'opacity-75' : 'hover:shadow-lg transition-shadow cursor-pointer'}`}
                  >
                    {!isAvailable && (
                      <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                        Скоро
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isAvailable ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Icon className={`h-5 w-5 ${isAvailable ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {module.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        className="w-full"
                        variant={isAvailable ? 'default' : 'outline'}
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable && module.link !== '#') {
                            window.location.href = module.link
                          }
                        }}
                      >
                        {isAvailable ? 'Открыть модуль' : 'Ожидается'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Target Audience */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Целевая аудитория</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Собственники и руководители</h4>
                  <p className="text-sm text-gray-600">
                    ООО, АО, групп компаний, нуждающиеся в оценке финансового состояния и планировании реструктуризации
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Финансовые директора</h4>
                  <p className="text-sm text-gray-600">
                    Антикризисные управляющие, внутренние аналитики, специалисты по реструктуризации
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Кредиторы</h4>
                  <p className="text-sm text-gray-600">
                    Банки, лизинговые компании, поставщики, анализирующие возможность восстановления платежеспособности
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Консультанты</h4>
                  <p className="text-sm text-gray-600">
                    Профессиональные консультанты по реструктуризации и банкротству, юристы, аудиторы
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer Link */}
          <div className="text-center text-sm text-gray-600">
            <button 
              onClick={() => setShowDisclaimer(true)}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              Показать юридический дисклеймер
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-sm text-gray-600 text-center">
              © 2024 Калькулятор Реструктуризации Бизнеса. Все расчеты носят информационно-аналитический характер.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
