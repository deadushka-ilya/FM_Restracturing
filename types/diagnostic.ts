/**
 * Финансовые коэффициенты для диагностики
 */

/**
 * Коэффициенты ликвидности
 */
export interface LiquidityRatios {
  // Коэффициент текущей ликвидности (Current Ratio)
  currentRatio: number
  
  // Коэффициент быстрой ликвидности (Quick Ratio)
  quickRatio: number
  
  // Коэффициент абсолютной ликвидности (Cash Ratio)
  cashRatio: number
  
  // Чистый оборотный капитал
  netWorkingCapital: number
}

/**
 * Коэффициенты финансового рычага
 */
export interface LeverageRatios {
  // Чистый долг / EBITDA
  netDebtToEbitda: number
  
  // Общий долг / Собственный капитал
  debtToEquity: number
  
  // Долг / Активы
  debtToAssets: number
  
  // Собственный капитал / Активы
  equityToAssets: number
  
  // Чистый долг
  netDebt: number
}

/**
 * Коэффициенты покрытия долга
 */
export interface CoverageRatios {
  // Коэффициент покрытия процентов (ICR - Interest Coverage Ratio)
  interestCoverageRatio: number
  
  // Коэффициент покрытия обслуживания долга (DSCR - Debt Service Coverage Ratio)
  debtServiceCoverageRatio: number
  
  // Денежный поток на обслуживание долга / Обслуживание долга
  cfadsToDebtService: number
  
  // Обеспеченность обязательств активами
  assetCoverageRatio: number
}

/**
 * Коэффициенты рентабельности
 */
export interface ProfitabilityRatios {
  // Рентабельность активов (ROA)
  returnOnAssets: number
  
  // Рентабельность собственного капитала (ROE)
  returnOnEquity: number
  
  // Рентабельность продаж (ROS)
  returnOnSales: number
  
  // EBITDA маржа
  ebitdaMargin: number
  
  // Операционная маржа
  operatingMargin: number
}

/**
 * Операционные показатели
 */
export interface OperationalMetrics {
  // Оборачиваемость дебиторской задолженности (дни)
  daysReceivablesOutstanding: number
  
  // Оборачиваемость кредиторской задолженности (дни)
  daysPayablesOutstanding: number
  
  // Оборачиваемость запасов (дни)
  daysInventoryOutstanding: number
  
  // Операционный цикл
  operatingCycle: number
  
  // Финансовый цикл (Cash Conversion Cycle)
  cashConversionCycle: number
}

/**
 * Признаки банкротства по ФЗ-127
 */
export interface BankruptcyIndicators {
  // Неплатежеспособность
  hasInsolvencyIndicator: boolean
  insolvencyDescription: string
  overdueObligationsAmount: number
  overdueObligationsDays: number
  
  // Недостаточность имущества
  hasAssetDeficiency: boolean
  assetDeficiencyAmount: number
  
  // Критические показатели
  hasNegativeEquity: boolean
  hasNegativeCashFlow: boolean
  hasCriticalLiquidity: boolean
  
  // Риски субсидиарной ответственности
  subsidiaryLiabilityRisks: string[]
}

/**
 * Z-Score модели (вероятность банкротства)
 */
export interface BankruptcyProbability {
  // Altman Z-Score (модифицированная для рынков РФ)
  altmanZScore: number
  altmanInterpretation: 'Безопасная зона' | 'Серая зона' | 'Зона бедствия'
  
  // Таффлера модель
  tafflerZScore: number
  tafflerInterpretation: 'Низкая вероятность' | 'Средняя вероятность' | 'Высокая вероятность'
  
  // Модель Сайфуллина-Кадыкова (для РФ)
  saifullinKadykovScore: number
  saifullinKadykovInterpretation: 'Благополучное' | 'Удовлетворительное' | 'Неудовлетворительное' | 'Кризисное'
  
  // Общий вердикт
  overallRisk: 'Низкий' | 'Средний' | 'Высокий' | 'Критический'
}

/**
 * Полный набор диагностических показателей
 */
export interface DiagnosticResults {
  calculationDate: string
  
  // EBITDA и нормализации
  reportedEbitda: number
  adjustedEbitda: number
  adjustments: {
    description: string
    amount: number
    taxEffect?: number
  }[]
  
  // Коэффициенты
  liquidityRatios: LiquidityRatios
  leverageRatios: LeverageRatios
  coverageRatios: CoverageRatios
  profitabilityRatios: ProfitabilityRatios
  operationalMetrics: OperationalMetrics
  
  // Признаки банкротства
  bankruptcyIndicators: BankruptcyIndicators
  bankruptcyProbability: BankruptcyProbability
  
  // Общая оценка
  overallHealth: 'Отличное' | 'Хорошее' | 'Удовлетворительное' | 'Плохое' | 'Критическое'
  recommendations: string[]
}

/**
 * Входные данные для расчета нормализованной EBITDA
 */
export interface EbitdaAdjustment {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: 'one_time' | 'non_recurring' | 'fx_effect' | 'accounting_change' | 'other'
  taxEffect?: number
  period: string
}
