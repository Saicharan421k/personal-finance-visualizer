// components/TransactionList.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

type Transaction = {
  _id: string;
  amount: number;
  date: string; 
  description: string;
  category: string;
};

export function TransactionList({ initialTransactions }: { initialTransactions: Transaction[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    const originalTransactions = transactions;
    setTransactions(prev => prev.filter(t => t._id !== id));
    
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete transaction");
      toast.success("Transaction deleted!");
      router.refresh(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete transaction. Reverting.");
      setTransactions(originalTransactions);
    }
  };

  return (
    <div className="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[40px]"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <AnimatePresence>
                    {transactions && transactions.length > 0 ? (
                        transactions.map((transaction) => (
                            <motion.tr
                                key={transaction._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                                className="hover:bg-muted/50"
                            >
                                <TableCell className="font-medium">{transaction.description}</TableCell>
                                <TableCell>
                                    <span className="text-xs font-semibold px-2 py-1 bg-muted text-muted-foreground rounded-full">
                                        {transaction.category}
                                    </span>
                                </TableCell>
                                <TableCell>{format(new Date(transaction.date), "PPP")}</TableCell>
                                <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem disabled>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50/50">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(transaction._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Yes, delete it
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </motion.tr>
                        ))
                    ) : ( null )}
                </AnimatePresence>
                
                {(!transactions || transactions.length === 0) && (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No transactions yet. Add one to get started!
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
  );
}