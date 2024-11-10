import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, MinusCircle } from 'lucide-react';
import type { LoanApplication, Income, DebtItem } from '../types/calculator';

const LoanCalculator: React.FC = () => {
  const { register, control, watch } = useForm<LoanApplication>({
    defaultValues: {
      type: 'personal',
      incomes: [{ source: 'Primary Employment', amount: 0, frequency: 'monthly' }],
      debts: [],
      downPayment: 0,
      term: 5,
      interestRate: 5,
    },
  });

  const { fields: incomeFields, append: appendIncome, remove: removeIncome } = 
    useFieldArray({ control, name: 'incomes' });
  
  const { fields: debtFields, append: appendDebt, remove: removeDebt } = 
    useFieldArray({ control, name: 'debts' });

  const watchedValues = watch();
  const { type, term, interestRate, downPayment, incomes, debts } = watchedValues;

  const calculateMonthlyIncome = (income: Income): number => {
    const amount = Number(income.amount) || 0;
    switch (income.frequency) {
      case 'weekly': return amount * 52 / 12;
      case 'biweekly': return amount * 26 / 12;
      case 'monthly': return amount;
      case 'annually': return amount / 12;
      default: return amount;
    }
  };

  const calculateMonthlyDebtPayments = (debt: DebtItem): number => {
    switch (debt.type) {
      case 'fixed-loan':
      case 'credit-card':
        return debt.minPayment;
      case 'revolving-credit':
        return debt.paymentType === 'interest-only' 
          ? (debt.balance * debt.interestRate / 100 / 12)
          : debt.minPayment;
      case 'mortgage':
        const payment = debt.paymentAmount;
        switch (debt.paymentFrequency) {
          case 'weekly': return payment * 52 / 12;
          case 'biweekly': return payment * 26 / 12;
          case 'accelerated-biweekly': return payment * 26 / 12;
          default: return payment;
        }
    }
  };

  const totalMonthlyIncome = incomes.reduce(
    (sum, income) => sum + calculateMonthlyIncome(income),
    0
  );

  const totalMonthlyDebtPayments = debts.reduce(
    (sum, debt) => sum + calculateMonthlyDebtPayments(debt),
    0
  );

  const calculateMaxLoan = () => {
    const maxMonthlyPayment = totalMonthlyIncome * 0.4 - totalMonthlyDebtPayments;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = term * 12;
    const maxLoan = maxMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numberOfPayments)) / monthlyRate);
    return Math.max(0, maxLoan);
  };

  const maxLoanAmount = calculateMaxLoan();

  const generateAmortizationSchedule = () => {
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = term * 12;
    const loanAmount = Math.min(maxLoanAmount, maxLoanAmount - (downPayment || 0));
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    let balance = loanAmount;
    const schedule = [];

    for (let month = 1; month <= numberOfPayments; month++) {
      const interest = balance * monthlyRate;
      const principal = monthlyPayment - interest;
      balance -= principal;

      if (month % 12 === 0) {
        schedule.push({
          year: month / 12,
          balance: Math.max(0, balance),
          totalPaid: monthlyPayment * month,
        });
      }
    }

    return schedule;
  };

  const amortizationSchedule = generateAmortizationSchedule();
  const tdsr = (totalMonthlyDebtPayments / totalMonthlyIncome) * 100;

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Loan Qualification Calculator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Income Section */}
            <div>
              <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
                Income Sources
              </h2>
              {incomeFields.map((field, index) => (
                <div key={field.id} className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    <input
                      {...register(`incomes.${index}.source`)}
                      placeholder="Income Source"
                      className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <input
                      type="number"
                      {...register(`incomes.${index}.amount`)}
                      placeholder="Amount"
                      className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <select
                      {...register(`incomes.${index}.frequency`)}
                      className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeIncome(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <MinusCircle size={24} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendIncome({ source: '', amount: 0, frequency: 'monthly' })}
                className="flex items-center text-emerald-600 hover:text-emerald-700"
              >
                <PlusCircle size={24} className="mr-2" />
                Add Income Source
              </button>
            </div>

            {/* Debt Section */}
            <div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                Existing Debts
              </h2>
              {debtFields.map((field, index) => (
                <div key={field.id} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center">
                      <select
                        {...register(`debts.${index}.type`)}
                        className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="fixed-loan">Fixed Term Loan</option>
                        <option value="credit-card">Credit Card</option>
                        <option value="revolving-credit">Revolving Credit</option>
                        <option value="mortgage">Mortgage</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeDebt(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MinusCircle size={24} />
                      </button>
                    </div>

                    <input
                      {...register(`debts.${index}.description`)}
                      placeholder="Description"
                      className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />

                    {watchedValues.debts[index]?.type === 'fixed-loan' && (
                      <>
                        <input
                          type="number"
                          {...register(`debts.${index}.remainingTerm`)}
                          placeholder="Remaining Term (months)"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          step="0.1"
                          {...register(`debts.${index}.interestRate`)}
                          placeholder="Interest Rate (%)"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.balance`)}
                          placeholder="Current Balance"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.paymentAmount`)}
                          placeholder="Payment Amount"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </>
                    )}

                    {watchedValues.debts[index]?.type === 'credit-card' && (
                      <>
                        <input
                          type="number"
                          {...register(`debts.${index}.creditLimit`)}
                          placeholder="Credit Limit"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.balance`)}
                          placeholder="Outstanding Balance"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.minPayment`)}
                          placeholder="Minimum Payment"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          step="0.1"
                          {...register(`debts.${index}.interestRate`)}
                          placeholder="Interest Rate (%)"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </>
                    )}

                    {watchedValues.debts[index]?.type === 'revolving-credit' && (
                      <>
                        <input
                          type="number"
                          {...register(`debts.${index}.creditLimit`)}
                          placeholder="Credit Limit"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.balance`)}
                          placeholder="Outstanding Balance"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.minPayment`)}
                          placeholder="Minimum Payment"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          step="0.1"
                          {...register(`debts.${index}.interestRate`)}
                          placeholder="Interest Rate (%)"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <select
                          {...register(`debts.${index}.paymentType`)}
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="interest-only">Interest Only</option>
                          <option value="interest-and-principal">Interest and Principal</option>
                        </select>
                      </>
                    )}

                    {watchedValues.debts[index]?.type === 'mortgage' && (
                      <>
                        <input
                          type="number"
                          {...register(`debts.${index}.remainingAmortization`)}
                          placeholder="Remaining Amortization (months)"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.remainingTerm`)}
                          placeholder="Remaining Term (months)"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          step="0.1"
                          {...register(`debts.${index}.interestRate`)}
                          placeholder="Interest Rate (%)"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.balance`)}
                          placeholder="Mortgage Balance"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <input
                          type="number"
                          {...register(`debts.${index}.paymentAmount`)}
                          placeholder="Payment Amount"
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                        <select
                          {...register(`debts.${index}.paymentFrequency`)}
                          className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="weekly">Weekly</option>
                          <option value="accelerated-biweekly">Accelerated Bi-weekly</option>
                        </select>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendDebt({
                  type: 'fixed-loan',
                  description: '',
                  remainingTerm: 0,
                  interestRate: 0,
                  balance: 0,
                  paymentAmount: 0,
                })}
                className="flex items-center text-red-600 hover:text-red-700"
              >
                <PlusCircle size={24} className="mr-2" />
                Add Debt
              </button>
            </div>

            {/* Loan Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                New Loan Details
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Type
                </label>
                <select
                  {...register('type')}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="personal">Personal Loan</option>
                  <option value="mortgage">Mortgage</option>
                  <option value="heloc">HELOC</option>
                </select>
              </div>

              {type === 'mortgage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Down Payment
                  </label>
                  <input
                    type="number"
                    {...register('downPayment')}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter down payment"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Loan Term (years)
                </label>
                <input
                  type="number"
                  {...register('term')}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter loan term"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register('interestRate')}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter interest rate"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Loan Qualification Summary
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Monthly Income
                  </h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${totalMonthlyIncome.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Total Monthly Debt Payments
                  </h3>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ${totalMonthlyDebtPayments.toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    TDSR Ratio
                  </h3>
                  <p className={`text-lg font-semibold ${tdsr <= 40 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tdsr.toFixed(1)}% {tdsr > 40 && '(Exceeds 40% maximum)'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Maximum Loan Amount
                  </h3>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${maxLoanAmount.toLocaleString()}
                  </p>
                </div>

                {type === 'mortgage' && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Required Down Payment
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${(maxLoanAmount * 0.05).toLocaleString()} (5% minimum)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="h-64">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Amortization Schedule
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={amortizationSchedule}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#10B981"
                    name="Remaining Balance"
                  />
                  <Line
                    type="monotone"
                    dataKey="totalPaid"
                    stroke="#6366F1"
                    name="Total Paid"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;