export interface Asset {
  type: string;
  value: number;
  description: string;
}

export interface Liability {
  type: string;
  value: number;
  description: string;
}

export interface Income {
  source: string;
  amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'annually';
}

export interface Expense {
  category: string;
  amount: number;
  type: 'fixed' | 'variable';
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'annually';
}

export interface FixedLoanDebt {
  type: 'fixed-loan';
  description: string;
  remainingTerm: number;
  interestRate: number;
  balance: number;
  paymentAmount: number;
}

export interface CreditCardDebt {
  type: 'credit-card';
  description: string;
  creditLimit: number;
  balance: number;
  minPayment: number;
  interestRate: number;
}

export interface RevolvingCreditDebt {
  type: 'revolving-credit';
  description: string;
  creditLimit: number;
  balance: number;
  minPayment: number;
  interestRate: number;
  paymentType: 'interest-only' | 'interest-and-principal';
}

export interface MortgageDebt {
  type: 'mortgage';
  description: string;
  remainingAmortization: number;
  remainingTerm: number;
  interestRate: number;
  balance: number;
  paymentAmount: number;
  paymentFrequency: 'weekly' | 'biweekly' | 'monthly' | 'accelerated-biweekly';
}

export type DebtItem = FixedLoanDebt | CreditCardDebt | RevolvingCreditDebt | MortgageDebt;

export interface LoanApplication {
  type: 'personal' | 'mortgage' | 'heloc';
  incomes: Income[];
  debts: DebtItem[];
  downPayment?: number;
  term: number;
  interestRate: number;
}