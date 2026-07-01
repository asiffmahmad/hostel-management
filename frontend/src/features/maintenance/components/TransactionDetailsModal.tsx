import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface BankTransaction {
  id: number;
  transactionDate: string;
  valueDate: string;
  utrNumber: string;
  referenceNumber: string;
  amount: number;
  transactionType: string;
  accountNumber: string;
  balance: number;
  description: string;
  month: string;
  year: string;
  sourceFile: string;
  importedAt: string;
  isMapped: boolean;
  mappedStudentId?: number;
  mappedPaymentId?: number;
  mappedBy?: string;
  mappedAt?: string;
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: BankTransaction | null;
}

export function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Transaction Date</p>
            <p className="text-base">{format(new Date(transaction.transactionDate), 'PPP')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Value Date</p>
            <p className="text-base">{transaction.valueDate ? format(new Date(transaction.valueDate), 'PPP') : 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-base font-bold">₹{transaction.amount.toLocaleString('en-IN')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Type</p>
            <Badge variant={transaction.transactionType === 'CREDIT' ? 'default' : 'destructive'} 
                   className={transaction.transactionType === 'CREDIT' ? 'bg-green-500 hover:bg-green-600' : ''}>
              {transaction.transactionType}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">UTR Number</p>
            <p className="text-base">{transaction.utrNumber || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Reference Number</p>
            <p className="text-base">{transaction.referenceNumber || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Account Number</p>
            <p className="text-base">{transaction.accountNumber}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Balance</p>
            <p className="text-base">₹{transaction.balance?.toLocaleString('en-IN') || 'N/A'}</p>
          </div>

          <div className="col-span-2 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base break-words bg-muted/30 p-2 rounded-md">{transaction.description}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Import File</p>
            <p className="text-base truncate" title={transaction.sourceFile}>{transaction.sourceFile}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Imported Date</p>
            <p className="text-base">{transaction.importedAt ? format(new Date(transaction.importedAt), 'PPP p') : 'N/A'}</p>
          </div>

          <div className="col-span-2 mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Mapping Information</h4>
            {transaction.isMapped ? (
              <div className="grid grid-cols-2 gap-4 bg-blue-500/10 p-4 rounded-lg border border-blue-500/20">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className="bg-blue-500">Mapped</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Mapped By</p>
                  <p className="text-sm">{transaction.mappedBy || 'System'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Student ID</p>
                  <p className="text-sm">{transaction.mappedStudentId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Payment ID</p>
                  <p className="text-sm">{transaction.mappedPaymentId}</p>
                </div>
              </div>
            ) : (
              <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20">
                <p className="text-sm text-orange-600 dark:text-orange-400">This transaction is not currently mapped to any student payment.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
