import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import PaymentSection from "@/components/PaymentSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, CreditCard, Receipt, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

const Splits = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [matchedRoommate, setMatchedRoommate] = useState<{ _id: string, name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchMatchesAndExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

      // Fetch matches to identify roommate
      const mRes = await fetch(`${API_BASE}/auth/matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mData = await mRes.json();
      
      if (mData && mData.length > 0) {
        const roommate = mData[0]; // Take the first match
        setMatchedRoommate(roommate);

        // Fetch splits history
        const eRes = await fetch(`${API_BASE}/auth/splits?roommateId=` + roommate._id, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const eData = await eRes.json();
        
        const mapped = eData.map((e: any) => {
          const isPaidByMe = e.paidBy === currentUser._id;
          return {
            id: e._id,
            amount: e.amount,
            description: e.description,
            category: e.category,
            paidBy: isPaidByMe ? "you" : roommate.name,
            splitWith: isPaidByMe ? roommate.name : "you",
            date: new Date(e.date).toLocaleDateString(),
            yourShare: Math.round(e.amount / 2),
            theirShare: Math.round(e.amount / 2)
          };
        });
        setExpenses(mapped);
      } else if (sessionStorage.getItem("mockRoommateMatched") === "true") {
        try {
          const cRes = await fetch(`${API_BASE}/auth/candidates`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (cRes.ok) {
            const cData = await cRes.json();
            const anjali = cData.find((c: any) => c.anonymousId === "CleanFreak_551") || cData[0];
            if (anjali) {
              const mockRoommate = { _id: anjali._id, name: "Anjali Gupta" };
              setMatchedRoommate(mockRoommate);

              const eRes = await fetch(`${API_BASE}/auth/splits?roommateId=` + mockRoommate._id, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (eRes.ok) {
                const eData = await eRes.json();
                const mapped = eData.map((e: any) => {
                  const isPaidByMe = e.paidBy === currentUser._id;
                  return {
                    id: e._id,
                    amount: e.amount,
                    description: e.description,
                    category: e.category,
                    paidBy: isPaidByMe ? "you" : mockRoommate.name,
                    splitWith: isPaidByMe ? mockRoommate.name : "you",
                    date: new Date(e.date).toLocaleDateString(),
                    yourShare: Math.round(e.amount / 2),
                    theirShare: Math.round(e.amount / 2)
                  };
                });
                setExpenses(mapped);
              }
            }
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setMatchedRoommate(null);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchesAndExpenses();
  }, []);

  const handleAddExpense = async (expenseData: any) => {
    if (!matchedRoommate) return;
    try {
      const token = localStorage.getItem("token");
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
      const res = await fetch(`${API_BASE}/auth/splits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: expenseData.amount,
          description: expenseData.description,
          splitWith: matchedRoommate._id,
          category: expenseData.category
        })
      });
      const newExpense = await res.json();
      if (!res.ok) throw new Error(newExpense.msg || "Failed to add expense");

      toast({
        title: "Expense Added! 🧼",
        description: `Split ₹${expenseData.amount} for "${expenseData.description}".`
      });

      // Reload list
      fetchMatchesAndExpenses();
    } catch (err: any) {
      toast({
        title: "Error adding expense",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const totalBalance = useMemo(() => {
    return expenses.reduce((balance, expense) => {
      if (expense.paidBy === "you") {
        return balance + expense.theirShare;
      } else {
        return balance - expense.yourShare;
      }
    }, 0);
  }, [expenses]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {loading ? (
            <div className="text-center py-12">
              <p>Loading roommate financial ledgers...</p>
            </div>
          ) : !matchedRoommate ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-light-cream rounded-xl border border-soft-sand max-w-lg mx-auto mt-12">
              <AlertCircle className="w-16 h-16 text-warm-brown mb-4" />
              <h2 className="text-2xl font-bold text-warm-brown mb-2">No Roommate Matched Yet</h2>
              <p className="text-muted-text mb-6">
                Splitwise expense sharing is automatically activated once you find a roommate match. Confirmed roommate matches are linked automatically.
              </p>
              <Link to="/matches">
                <Button className="bg-warm-brown hover:bg-warm-brown-dark text-white font-semibold">
                  🔍 Find Roommate Vibes
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  Split Expenses with {matchedRoommate.name}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Easily track and split shared expenses. Keep your finances organized and maintain healthy roommate vibes.
                </p>
              </div>

              {/* Tabs for different sections */}
              <Tabs defaultValue="expenses" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="expenses" className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Expenses
                  </TabsTrigger>
                  <TabsTrigger value="split" className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Add Expense
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payments
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="expenses" className="space-y-6">
                  <ExpenseList expenses={expenses} />
                </TabsContent>

                <TabsContent value="split" className="space-y-6">
                  <ExpenseForm onAddExpense={handleAddExpense} />
                  {expenses.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
                      <ExpenseList expenses={expenses.slice(0, 3)} />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-6">
                  <PaymentSection balance={totalBalance} roommateId={matchedRoommate.name} />
                </TabsContent>
              </Tabs>
            </>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Splits;