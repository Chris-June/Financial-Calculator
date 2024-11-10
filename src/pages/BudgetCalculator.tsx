import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, MinusCircle } from 'lucide-react';
import type { BudgetData, Income, Expense } from '../types/calculator';

const BudgetCalculator: React.FC = () => {
  const { register, control, watch } = useForm<BudgetData>({
    defaultValues: {
      income: [{ source: 'Salary', amount: 0, frequency: 'monthly' }],
      expenses: [{ category: 'Housing', amount: 0, type: 'fixed', frequency: 'monthly' }],
    },
  });

  const { fields: incomeFields, append: appendIncome, remove: removeIncome } = 
    useFieldArray({ control, name: 'income' });
  
  const { fields: expenseFields, append: appendExpense, remove: removeExpense } = 
    useFieldArray({ control, name: 'expenses' });

  const watchedIncome = watch('income');
  const watchedExpenses = watch('expenses');

  const calculateMonthlyAmount = (amount: number, frequency: string): number => {
    switch (frequency) {
      case 'weekly': return amount * 52 / 12;
      case 'biweekly': return amount * 26 / 12;
      case 'monthly': return amount;
      case 'annually': return amount / 12;
      default: return amount;
    }
  };

  const totalMonthlyIncome = watchedIncome.reduce(
    (sum, income) => sum + calculateMonthlyAmount(Number(income.amount) || 0, income.frequency),
    0
  );

  const totalMonthlyExpenses = watchedExpenses.reduce(
    (sum, expense) => sum + calculateMonthlyAmount(Number(expense.amount) || 0, expense.frequency),
    0
  );

  const monthlyBalance = totalMonthlyIncome - totalMonthlyExpenses;

  const expensesByCategory = watchedExpenses.reduce((acc: Record<string, number>, expense) => {
    const monthlyAmount = calculateMonthlyAmount(Number(expense.amount) || 0, expense.frequency);
    acc[expense.category] = (acc[expense.category] || 0) + monthlyAmount;
    return acc;
  }, {});

  const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / totalMonthlyExpenses) * 100,
  }));

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Budget Calculator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Income Section */}
          <div>
            <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
              Income Sources
            </h2>
            {incomeFields.map((field, index) => (
              <div key={field.id} className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    {...register(`income.${index}.source`)}
                    placeholder="Source"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    {...register(`income.${index}.amount`)}
                    placeholder="Amount"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    {...register(`income.${index}.frequency`)}
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
              className="flex items-center text-emerald-600 hover:text-emerald-700 mt-2"
            >
              <PlusCircle size={24} className="mr-2" />
              Add Income Source
            </button>
          </div>

          {/* Expenses Section */}
          <div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Expenses
            </h2>
            {expenseFields.map((field, index) => (
              <div key={field.id} className="mb-4 space-y-2">
                <div className="flex gap-2">
                  <input
                    {...register(`expenses.${index}.category`)}
                    placeholder="Category"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="number"
                    {...register(`expenses.${index}.amount`)}
                    placeholder="Amount"
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    {...register(`expenses.${index}.type`)}
                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="variable">Variable</option>
                  </select>
                  <select
                    {...register(`expenses.${index}.frequency`)}
                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="annually">Annually</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeExpense(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <MinusCircle size={24} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendExpense({ category: '', amount: 0, type: 'fixed', frequency: 'monthly' })}
              className="flex items-center text-red-600 hover:text-red-700 mt-2"
            >
              <PlusCircle size={24} className="mr-2" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Monthly Income</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${totalMonthlyIncome.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Monthly Expenses</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totalMonthlyExpenses.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Monthly Balance</h3>
              <p className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                ${monthlyBalance.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="amount" fill="#10B981" name="Monthly Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCalculator;