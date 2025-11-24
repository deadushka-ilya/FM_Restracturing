/**
 * Расчетные функции для модуля финансовой реструктуризации
 */

import {
  DebtRestructuringParams,
  DebtRestructuringResult,
  RestructuringType,
  DebtToEquityParams,
  RefinancingParams,
  RestructuringScenario,
} from '@/types/restructuring'
import { Debt, PaymentSchedule } from '@/types/debt'
import { addMonths } from 'date-fns'

/**
 * Расчет нового графика платежей при изменении условий
 */
export function calculateNewPaymentSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
  startDate: Date,
  gracePeriodMonths: number = 0
): PaymentSchedule[] {
  const monthlyRate = annualRate / 100 / 12
  const schedule: PaymentSchedule[] = []
  
  let remainingBalance = principal
  
  for (let month = 1; month <= termMonths; month++) {
    const date = addMonths(startDate, month)
    const interest = remainingBalance * monthlyRate
    
    let principalPayment = 0
    
    if (month > gracePeriodMonths) {
      // Аннуитетный платеж после grace period
      const paymentsRemaining = termMonths - gracePeriodMonths
      const annuityPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, paymentsRemaining)) /
        (Math.pow(1 + monthlyRate, paymentsRemaining) - 1)
      principalPayment = annuityPayment - interest
    }
    
    remainingBalance -= principalPayment
    
    schedule.push({
      date: date.toISOString().split('T')[0],
      principal: principalPayment,
      interest: interest,
      total: principalPayment + interest,
      balance: Math.max(0, remainingBalance),
    })
  }
  
  return schedule
}

/**
 * Расчет NPV потока платежей
 */
export function calculateNPV(payments: PaymentSchedule[], discountRate: number): number {
  return payments.reduce((npv, payment, index) => {
    const monthsFromNow = index + 1
    const discountFactor = Math.pow(1 + discountRate / 100 / 12, -monthsFromNow)
    return npv + payment.total * discountFactor
  }, 0)
}

/**
 * Реструктуризация долга: Пролонгация
 */
export function restructureExtension(
  debt: Debt,
  newMaturityDate: string,
  gracePeriodMonths: number = 0
): DebtRestructuringResult {
  const originalSchedule = debt.paymentSchedule
  const originalTermMonths = originalSchedule.length
  
  const newMaturity = new Date(newMaturityDate)
  const startDate = new Date()
  const newTermMonths = Math.round(
    (newMaturity.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  
  const newSchedule = calculateNewPaymentSchedule(
    debt.outstandingAmount,
    debt.interestRate,
    newTermMonths,
    startDate,
    gracePeriodMonths
  )
  
  const originalTotalPayment = originalSchedule.reduce((sum, p) => sum + p.total, 0)
  const newTotalPayment = newSchedule.reduce((sum, p) => sum + p.total, 0)
  const interestSavings = originalTotalPayment - newTotalPayment
  
  // NPV savings
  const discountRate = 15 // Типичная ставка дисконтирования
  const originalNPV = calculateNPV(originalSchedule, discountRate)
  const newNPV = calculateNPV(newSchedule, discountRate)
  const npvSavings = originalNPV - newNPV
  
  // DSCR и ICR (упрощенный расчет)
  const avgMonthlyPaymentBefore = originalTotalPayment / originalTermMonths
  const avgMonthlyPaymentAfter = newTotalPayment / newTermMonths
  
  // Предполагаем EBITDA = 10M годовых
  const monthlyEBITDA = 10000000 / 12
  
  const beforeDSCR = monthlyEBITDA / avgMonthlyPaymentBefore
  const afterDSCR = monthlyEBITDA / avgMonthlyPaymentAfter
  
  const beforeICR = monthlyEBITDA / (originalSchedule[0]?.interest || 1)
  const afterICR = monthlyEBITDA / (newSchedule[0]?.interest || 1)
  
  const restructuredDebt: Debt = {
    ...debt,
    maturityDate: newMaturityDate,
    paymentSchedule: newSchedule,
  }
  
  return {
    originalDebt: debt,
    restructuredDebt,
    principalReduction: 0,
    interestSavings,
    totalSavings: interestSavings,
    npvSavings,
    newPaymentSchedule: newSchedule,
    beforeDSCR,
    afterDSCR,
    beforeICR,
    afterICR,
    creditorRecovery: debt.outstandingAmount,
    creditorLoss: 0,
    creditorLossPercent: 0,
    cashFlowRelief: avgMonthlyPaymentBefore - avgMonthlyPaymentAfter,
    debtServiceReduction: (avgMonthlyPaymentBefore - avgMonthlyPaymentAfter) * 12,
  }
}

/**
 * Реструктуризация долга: Изменение ставки
 */
export function restructureRateChange(
  debt: Debt,
  newRate: number
): DebtRestructuringResult {
  const termMonths = debt.paymentSchedule.length
  const startDate = new Date()
  
  const newSchedule = calculateNewPaymentSchedule(
    debt.outstandingAmount,
    newRate,
    termMonths,
    startDate
  )
  
  const originalTotalPayment = debt.paymentSchedule.reduce((sum, p) => sum + p.total, 0)
  const newTotalPayment = newSchedule.reduce((sum, p) => sum + p.total, 0)
  const interestSavings = originalTotalPayment - newTotalPayment
  
  const discountRate = 15
  const npvSavings = calculateNPV(debt.paymentSchedule, discountRate) - calculateNPV(newSchedule, discountRate)
  
  const avgMonthlyPaymentBefore = originalTotalPayment / termMonths
  const avgMonthlyPaymentAfter = newTotalPayment / termMonths
  const monthlyEBITDA = 10000000 / 12
  
  const restructuredDebt: Debt = {
    ...debt,
    interestRate: newRate,
    paymentSchedule: newSchedule,
  }
  
  return {
    originalDebt: debt,
    restructuredDebt,
    principalReduction: 0,
    interestSavings,
    totalSavings: interestSavings,
    npvSavings,
    newPaymentSchedule: newSchedule,
    beforeDSCR: monthlyEBITDA / avgMonthlyPaymentBefore,
    afterDSCR: monthlyEBITDA / avgMonthlyPaymentAfter,
    beforeICR: monthlyEBITDA / (debt.paymentSchedule[0]?.interest || 1),
    afterICR: monthlyEBITDA / (newSchedule[0]?.interest || 1),
    creditorRecovery: debt.outstandingAmount,
    creditorLoss: 0,
    creditorLossPercent: 0,
    cashFlowRelief: avgMonthlyPaymentBefore - avgMonthlyPaymentAfter,
    debtServiceReduction: (avgMonthlyPaymentBefore - avgMonthlyPaymentAfter) * 12,
  }
}

/**
 * Реструктуризация долга: Частичное списание (Haircut)
 */
export function restructureHaircut(
  debt: Debt,
  haircutPercent: number
): DebtRestructuringResult {
  const haircutAmount = debt.outstandingAmount * (haircutPercent / 100)
  const newPrincipal = debt.outstandingAmount - haircutAmount
  
  const termMonths = debt.paymentSchedule.length
  const startDate = new Date()
  
  const newSchedule = calculateNewPaymentSchedule(
    newPrincipal,
    debt.interestRate,
    termMonths,
    startDate
  )
  
  const originalTotalPayment = debt.paymentSchedule.reduce((sum, p) => sum + p.total, 0)
  const newTotalPayment = newSchedule.reduce((sum, p) => sum + p.total, 0)
  const totalSavings = originalTotalPayment - newTotalPayment
  
  const discountRate = 15
  const npvSavings = calculateNPV(debt.paymentSchedule, discountRate) - calculateNPV(newSchedule, discountRate)
  
  const avgMonthlyPaymentBefore = originalTotalPayment / termMonths
  const avgMonthlyPaymentAfter = newTotalPayment / termMonths
  const monthlyEBITDA = 10000000 / 12
  
  const restructuredDebt: Debt = {
    ...debt,
    principalAmount: newPrincipal,
    outstandingAmount: newPrincipal,
    paymentSchedule: newSchedule,
  }
  
  return {
    originalDebt: debt,
    restructuredDebt,
    principalReduction: haircutAmount,
    interestSavings: totalSavings - haircutAmount,
    totalSavings,
    npvSavings,
    newPaymentSchedule: newSchedule,
    beforeDSCR: monthlyEBITDA / avgMonthlyPaymentBefore,
    afterDSCR: monthlyEBITDA / avgMonthlyPaymentAfter,
    beforeICR: monthlyEBITDA / (debt.paymentSchedule[0]?.interest || 1),
    afterICR: monthlyEBITDA / (newSchedule[0]?.interest || 1),
    creditorRecovery: newPrincipal,
    creditorLoss: haircutAmount,
    creditorLossPercent: haircutPercent,
    cashFlowRelief: avgMonthlyPaymentBefore - avgMonthlyPaymentAfter,
    debtServiceReduction: (avgMonthlyPaymentBefore - avgMonthlyPaymentAfter) * 12,
  }
}

/**
 * Конвертация долга в капитал (Debt-to-Equity)
 */
export function calculateDebtToEquity(
  debtAmount: number,
  companyValuation: number,
  existingSharesCount: number
): DebtToEquityParams {
  // Новые акции = (Долг / Оценка) * Существующие акции / (1 - Долг/Оценка)
  const debtToValueRatio = debtAmount / companyValuation
  const newSharesIssued = (existingSharesCount * debtToValueRatio) / (1 - debtToValueRatio)
  const postConversionShares = existingSharesCount + newSharesIssued
  const newShareholderPercent = (newSharesIssued / postConversionShares) * 100
  const dilution = 100 - ((existingSharesCount / postConversionShares) * 100)
  
  return {
    debtAmount,
    companyValuation,
    existingSharesCount,
    conversionRatio: debtAmount / newSharesIssued,
    newSharesIssued,
    postConversionSharesCount: postConversionShares,
    newShareholderPercent,
    existingShareholderDilution: dilution,
  }
}

/**
 * Рефинансирование
 */
export function calculateRefinancing(
  existingDebts: Debt[],
  newLoanAmount: number,
  newRate: number,
  newTermMonths: number,
  totalCosts: number
): RefinancingParams {
  const totalExistingDebt = existingDebts.reduce((sum, d) => sum + d.outstandingAmount, 0)
  
  // Существующие ежемесячные платежи
  const existingMonthlyPayment = existingDebts.reduce((sum, debt) => {
    const avgPayment = debt.paymentSchedule.reduce((s, p) => s + p.total, 0) / debt.paymentSchedule.length
    return sum + avgPayment
  }, 0)
  
  // Новые ежемесячные платежи
  const newSchedule = calculateNewPaymentSchedule(newLoanAmount, newRate, newTermMonths, new Date())
  const newMonthlyPayment = newSchedule.reduce((s, p) => s + p.total, 0) / newTermMonths
  
  const monthlySavings = existingMonthlyPayment - newMonthlyPayment
  const breakEvenMonths = totalCosts / monthlySavings
  
  // NPV benefit
  const totalSavingsOverTerm = monthlySavings * newTermMonths - totalCosts
  const discountRate = 15
  const npvBenefit = (monthlySavings * 12) / (discountRate / 100) - totalCosts
  
  return {
    existingDebts,
    newLoanAmount,
    newInterestRate: newRate,
    newTermMonths,
    newLender: 'Новый кредитор',
    arrangementFees: totalCosts * 0.02,
    earlyRepaymentPenalties: totalCosts * 0.01,
    legalFees: totalCosts * 0.005,
    otherCosts: totalCosts * 0.005,
    totalCosts,
    netProceedsToCompany: newLoanAmount - totalExistingDebt - totalCosts,
    monthlySavings,
    breakEvenMonths,
    totalNPVBenefit: npvBenefit,
  }
}

/**
 * Создание комплексного сценария реструктуризации
 */
export function createRestructuringScenario(
  scenarioName: string,
  description: string,
  restructuringResults: DebtRestructuringResult[],
  ebitda: number,
  equity: number
): RestructuringScenario {
  const totalDebtBefore = restructuringResults.reduce(
    (sum, r) => sum + r.originalDebt.outstandingAmount,
    0
  )
  
  const totalDebtAfter = restructuringResults.reduce(
    (sum, r) => sum + r.restructuredDebt.outstandingAmount,
    0
  )
  
  const totalDebtReduction = totalDebtBefore - totalDebtAfter
  const totalNPVSavings = restructuringResults.reduce((sum, r) => sum + r.npvSavings, 0)
  
  // Net Debt (assuming cash = 2M)
  const cash = 2000000
  const netDebtBefore = totalDebtBefore - cash
  const netDebtAfter = totalDebtAfter - cash
  
  return {
    scenarioName,
    description,
    debts: [], // Заполняется из params
    totalDebtBefore,
    totalDebtAfter,
    totalDebtReduction,
    totalNPVSavings,
    netDebtToEbitdaBefore: netDebtBefore / ebitda,
    netDebtToEbitdaAfter: netDebtAfter / ebitda,
    debtToEquityBefore: totalDebtBefore / equity,
    debtToEquityAfter: totalDebtAfter / equity,
  }
}
