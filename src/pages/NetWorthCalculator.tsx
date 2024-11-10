import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PlusCircle, MinusCircle } from 'lucide-react';
import type { NetWorthData, Asset, Liability } from '../types/calculator';

const COLORS = ['#10B981', '#6366F1', '#F59E0B', '#EC4899'];

const NetWorthCalculator: React.FC = () => {
  const { register, control, watch, handleSubmit } = useForm<NetWorthData>({
    defaultValues: {
      assets: [{ type: 'Cash', value: 0, description: '' }],
      liabilities: [{ type: 'Credit Card', value: 0, description: '' }],
    },
  });

  const { fields: assetFields, append: appendAsset, remove: removeAsset } = 
    useFieldArray({ control, name: 'assets' });
  
  const { fields: liabilityFields, append: appendLiability, remove: removeLiability } = 
    useFieldArray({ control, name: 'liabilities' });

  const watchedAssets = watch('assets');
  const watchedLiabilities = watch('liabilities');

  const totalAssets = watchedAssets.reduce((sum, asset) => sum + (Number(asset.value) || 0), 0);
  const totalLiabilities = watchedLiabilities.reduce((sum, liability) => sum + (Number(liability.value) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  const chartData = [
    { name: 'Total Assets', value: totalAssets },
    { name: 'Total Liabilities', value: totalLiabilities },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Net Worth Calculator
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Assets Section */}
          <div>
            <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
              Assets
            </h2>
            {assetFields.map((field, index) => (
              <div key={field.id} className="mb-4 flex gap-2">
                <select
                  {...register(`assets.${index}.type`)}
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Investments">Investments</option>
                  <option value="Property">Property</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  {...register(`assets.${index}.value`)}
                  placeholder="Value"
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeAsset(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <MinusCircle size={24} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendAsset({ type: 'Cash', value: 0, description: '' })}
              className="flex items-center text-emerald-600 hover:text-emerald-700 mt-2"
            >
              <PlusCircle size={24} className="mr-2" />
              Add Asset
            </button>
          </div>

          {/* Liabilities Section */}
          <div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Liabilities
            </h2>
            {liabilityFields.map((field, index) => (
              <div key={field.id} className="mb-4 flex gap-2">
                <select
                  {...register(`liabilities.${index}.type`)}
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Mortgage">Mortgage</option>
                  <option value="Loan">Loan</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="number"
                  {...register(`liabilities.${index}.value`)}
                  placeholder="Value"
                  className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeLiability(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <MinusCircle size={24} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendLiability({ type: 'Credit Card', value: 0, description: '' })}
              className="flex items-center text-red-600 hover:text-red-700 mt-2"
            >
              <PlusCircle size={24} className="mr-2" />
              Add Liability
            </button>
          </div>
        </div>

        {/* Summary Section */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Total Assets</h3>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ${totalAssets.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Total Liabilities</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                ${totalLiabilities.toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Net Worth</h3>
              <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                ${netWorth.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-8 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCalculator;