'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export function Disclaimer() {
  const [isAccepted, setIsAccepted] = useState(false)
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  if (!showDisclaimer) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <Card className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <div>
              <CardTitle className="text-2xl">Юридический дисклеймер</CardTitle>
              <CardDescription>Пожалуйста, внимательно ознакомьтесь с условиями использования</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-semibold">Информационно-аналитический характер</h3>
            <p className="text-gray-700">
              Веб-калькулятор «Реструктуризация бизнеса» предназначен исключительно для информационно-аналитических
              целей и предоставления предварительных расчетов финансовых показателей и сценариев реструктуризации.
            </p>

            <h3 className="text-lg font-semibold mt-4">Не является юридическим или финансовым заключением</h3>
            <p className="text-gray-700">
              Результаты расчетов калькулятора <strong>НЕ ЯВЛЯЮТСЯ</strong>:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Офертой или предложением о заключении каких-либо сделок</li>
              <li>Юридическим заключением или рекомендацией</li>
              <li>Аудиторским мнением или финансовой экспертизой</li>
              <li>Основанием для принятия решений без консультации специалистов</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">Применимое законодательство</h3>
            <p className="text-gray-700">
              Калькулятор учитывает положения российского законодательства:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Федеральный закон № 127-ФЗ «О несостоятельности (банкротстве)»</li>
              <li>Гражданский кодекс Российской Федерации</li>
              <li>Налоговый кодекс Российской Федерации</li>
              <li>Федеральный закон № 14-ФЗ «Об обществах с ограниченной ответственностью»</li>
              <li>Федеральный закон № 208-ФЗ «Об акционерных обществах»</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">Обязательная консультация специалистов</h3>
            <p className="text-gray-700">
              Решения о реструктуризации, инициировании процедур банкротства и других корпоративных действиях
              должны приниматься исключительно после консультации с:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Квалифицированными юристами по корпоративному праву и банкротству</li>
              <li>Аудиторами и финансовыми консультантами</li>
              <li>Арбитражными управляющими (при необходимости)</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">Ограничение ответственности</h3>
            <p className="text-gray-700">
              Разработчики и операторы калькулятора не несут ответственности за:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Решения, принятые на основе результатов работы калькулятора</li>
              <li>Убытки, возникшие в результате использования калькулятора</li>
              <li>Неточности расчетов, вызванные некорректными входными данными</li>
              <li>Изменения законодательства после публикации калькулятора</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">Конфиденциальность данных</h3>
            <p className="text-gray-700">
              По умолчанию все данные обрабатываются локально в браузере пользователя и не сохраняются на сервере.
              Если предусмотрено сохранение данных, пользователь должен дать явное согласие.
            </p>

            <h3 className="text-lg font-semibold mt-4">Актуальность информации</h3>
            <p className="text-gray-700">
              Калькулятор основан на действующем законодательстве на момент разработки. Пользователь самостоятельно
              несет ответственность за проверку актуальности применяемых норм и коэффициентов.
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <input
              type="checkbox"
              id="accept"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="accept" className="text-sm text-gray-700 cursor-pointer">
              Я ознакомлен(а) с юридическим дисклеймером и понимаю, что результаты работы калькулятора
              носят информационно-аналитический характер и не заменяют профессиональную юридическую
              и финансовую экспертизу.
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Отклонить
            </Button>
            <Button
              onClick={() => setShowDisclaimer(false)}
              disabled={!isAccepted}
            >
              Принять и продолжить
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
