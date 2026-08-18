import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Receipt, User } from "lucide-react";

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  notes?: string;
  paidBy: string;
  splitWith: string;
  date: string;
  yourShare: number;
  theirShare: number;
}

interface ExpenseListProps {
  expenses: Expense[];
}

const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      groceries: "bg-green-100 text-green-800",
      utilities: "bg-blue-100 text-blue-800",
      rent: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
      transport: "bg-yellow-100 text-yellow-800",
      entertainment: "bg-pink-100 text-pink-800",
      cleaning: "bg-teal-100 text-teal-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors.other;
  };

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No expenses added yet. Start by adding your first shared expense!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recent Expenses</h3>
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{expense.description}</h4>
                  <Badge className={getCategoryColor(expense.category)}>
                    {expense.category}
                  </Badge>
                </div>
                
                {expense.notes && (
                  <p className="text-sm text-muted-foreground mb-2">{expense.notes}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(expense.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Paid by {expense.paidBy === "you" ? "You" : expense.paidBy}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold">₹{expense.amount.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  Your share: ₹{expense.yourShare.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {expense.splitWith}'s share: ₹{expense.theirShare.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExpenseList;