'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScenarioType } from '@/types/scenario'
import { ArrowRight, TrendingDown, TrendingUp, Activity } from 'lucide-react'

interface ScenarioSwitcherProps {
  currentScenario: ScenarioType
  onScenarioChange: (scenario: ScenarioType) => void
}

export function ScenarioSwitcher({ currentScenario, onScenarioChange }: ScenarioSwitcherProps) {
  const scenarios = [
    {
      type: ScenarioType.BASE,
      name: 'Базовый',
      shortName: 'Base',
      description: 'Текущее состояние бизнеса без существенных изменений',
      icon: Activity,
      color: 'blue',
      highlights: [
        'Выручка: 100% (плановая)',
        'Затраты: текущий уровень',
        'Сбор платежей: стандартный',
      ],
    },
    {
      type: ScenarioType.DOWNSIDE,
      name: 'Кризисный',
      shortName: 'Downside',
      description: 'Падение выручки, задержка платежей, кризисная ситуация',
      icon: TrendingDown,
      color: 'red',
      highlights: [
        'Выручка: -30% (падение)',
        'Задержка платежей клиентов',
        'Поставщики требуют предоплату',
      ],
    },
    {
      type: ScenarioType.RESTRUCTURING,
      name: 'Реструктуризация',
      shortName: 'Restructuring',
      description: 'Активное управление изменениями и оптимизация',
      icon: TrendingUp,
      color: 'green',
      highlights: [
        'Выручка: -15% (умеренное падение)',
        'Затраты: -20% (оптимизация)',
        'Реструктуризация долга',
      ],
    },
  ]

  const getColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: {
        border: isActive ? 'border-blue-500' : 'border-blue-200',
        bg: isActive ? 'bg-blue-50' : 'bg-white',
        icon: 'text-blue-600',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      red: {
        border: isActive ? 'border-red-500' : 'border-red-200',
        bg: isActive ? 'bg-red-50' : 'bg-white',
        icon: 'text-red-600',
        button: 'bg-red-600 hover:bg-red-700',
      },
      green: {
        border: isActive ? 'border-green-500' : 'border-green-200',
        bg: isActive ? 'bg-green-50' : 'bg-white',
        icon: 'text-green-600',
        button: 'bg-green-600 hover:bg-green-700',
      },
    }
    return colors[color as keyof typeof colors]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Выбор сценария</h2>
        <p className="text-gray-600">
          Переключайтесь между сценариями для сравнения различных стратегий реструктуризации
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon
          const isActive = currentScenario === scenario.type
          const colors = getColorClasses(scenario.color, isActive)

          return (
            <Card
              key={scenario.type}
              className={`transition-all ${colors.border} ${colors.bg} ${
                isActive ? 'shadow-lg ring-2 ring-offset-2' : 'hover:shadow-md'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${isActive ? 'bg-white' : 'bg-gray-50'}`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white text-gray-700 border">
                      Активен
                    </span>
                  )}
                </div>
                <CardTitle className="text-xl">{scenario.name}</CardTitle>
                <CardDescription className="text-sm">
                  {scenario.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {scenario.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
                <Button
                  className={`w-full ${isActive ? colors.button + ' text-white' : ''}`}
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => onScenarioChange(scenario.type)}
                  disabled={isActive}
                >
                  {isActive ? 'Текущий сценарий' : `Переключить на ${scenario.shortName}`}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Activity className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                💡 Как работает переключение сценариев
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>При смене сценария автоматически корректируются все операционные драйверы</li>
                <li>Расчеты TWCF, диагностики и реструктуризации пересчитываются мгновенно</li>
                <li>Вы можете сравнить результаты всех трех сценариев на странице "Сравнение"</li>
                <li>Изменения применяются ко всем модулям калькулятора</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
