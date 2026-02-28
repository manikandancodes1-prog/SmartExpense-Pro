import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutDashboard, ReceiptText, PieChart as PieChartIcon, LogOut, TrendingUp, TrendingDown, X, Trash2, Pencil, Filter, RefreshCcw, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 });
    const [transactions, setTransactions] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isLoading, setIsLoading] = useState(false);

    const [budget, setBudget] = useState(0); 
    const [newBudgetInput, setNewBudgetInput] = useState(""); 
    const budgetUsagePercent = budget > 0 ? Math.min((stats.totalExpense / budget) * 100, 100) : 0;

    const [formData, setFormData] = useState({ 
        description: '', 
        amount: '', 
        type: 'EXPENSE', 
        category: 'Food' 
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.reload();
    };

    const fetchUserBudget = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBudget(res.data.monthlyBudget || 0);
        } catch (err) {
            console.error("Failed to fetch budget", err);
        }
    };

    const handleUpdateBudget = async () => {
        if (!newBudgetInput || isNaN(newBudgetInput)) return toast.warn("Please enter a valid amount!");
        
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:8080/api/users/budget', 
                { budget: Number(newBudgetInput) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBudget(Number(newBudgetInput));
            setNewBudgetInput("");
            toast.success("Budget updated successfully! 🚀");
        } catch (err) {
            toast.error("Failed to update budget! ❌");
        }
    };

    const exportToCSV = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/transactions/paged?page=0&size=1000&keyword=${searchTerm}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const allData = res.data.content;
            if (allData.length === 0) return toast.info("No data available to export!");

            const headers = ["Description,Amount,Type,Category,Date\n"];
            const rows = allData.map(t => {
                return `${t.description},${t.amount},${t.type},${t.category},${t.date?.split('T')[0]}\n`;
            });

            const csvContent = headers.concat(rows).join("");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `Expenses_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success("CSV Downloaded Successfully!");
        } catch (error) {
            toast.error("Error downloading CSV!");
        }
    };

    const fetchPagedTransactions = async (page = 0, search = '') => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8080/api/transactions/paged?page=${page}&size=10&keyword=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data.content); 
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.number);
        } catch (error) {
            console.error("Error fetching paged data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            const [statsRes] = await Promise.all([
                axios.get('http://localhost:8080/api/transactions/stats', { headers })
            ]);
            setStats({
                totalIncome: statsRes.data.totalIncome || 0,
                totalExpense: statsRes.data.totalExpense || 0
            });
            setSearchTerm('');
            setStartDate('');
            setEndDate('');
            fetchPagedTransactions(0, '');
            fetchUserBudget();
        } catch (error) {
            toast.error("Error fetching dashboard data!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilter = async () => {
        if (!startDate || !endDate) return toast.warn("Please select a date range!");
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/transactions/filter?start=${startDate}&end=${endDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(response.data); 
            const filteredIncome = response.data.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
            const filteredExpense = response.data.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
            setStats({ totalIncome: filteredIncome, totalExpense: filteredExpense });
            setTotalPages(0);
        } catch (err) {
            toast.error("Error applying filters!");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:8080/api/transactions/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Transaction deleted successfully!");
                fetchDashboardData(); 
            } catch (err) {
                toast.error("Failed to delete transaction!");
            }
        }
    };

    const handleEdit = (transaction) => {
        setFormData({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category
        });
        setCurrentId(transaction.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.type === 'EXPENSE' && budget > 0 && (stats.totalExpense + Number(formData.amount) > budget)) {
            const confirmProceed = window.confirm("Adding this expense will exceed your monthly budget! Do you want to proceed?");
            if (!confirmProceed) return;
        }

        const token = localStorage.getItem('token');
        const dataToSend = { ...formData, amount: Number(formData.amount) };
        const url = isEditing ? `http://localhost:8080/api/transactions/${currentId}` : 'http://localhost:8080/api/transactions';
        const method = isEditing ? 'put' : 'post';

        try {
            await axios[method](url, dataToSend, { headers: { Authorization: `Bearer ${token}` } });
            setIsModalOpen(false);
            setIsEditing(false);
            setFormData({ description: '', amount: '', type: 'EXPENSE', category: 'Food' });
            toast.success(isEditing ? "Transaction updated!" : "Transaction saved successfully!");
            fetchDashboardData(); 
        } catch (err) {
            toast.error("Could not complete the request!");
        }
    };

    useEffect(() => { fetchDashboardData(); }, []);

    const totalBalance = stats.totalIncome - stats.totalExpense;

    return (
        <div className="flex h-screen bg-[#0f172a] text-white">
            <aside className="w-64 bg-[#1e293b] p-6 flex flex-col gap-6">
                <h2 className="text-2xl font-bold text-blue-500">SmartExpense</h2>
                <nav className="flex flex-col gap-4">
                    <button className="flex items-center gap-3 p-3 bg-blue-600 rounded-lg transition-all"><LayoutDashboard /> Dashboard</button>
                    <button className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-all"><ReceiptText /> Transactions</button>
                    <button className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg transition-all"><PieChartIcon /> Analytics</button>
                </nav>
                <button onClick={handleLogout} className="mt-auto flex items-center gap-3 p-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-all"><LogOut /> Logout</button>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold">Welcome Back!</h1>
                        <button
                            onClick={() => { setIsEditing(false); setFormData({ description: '', amount: '', type: 'EXPENSE', category: 'Food' }); setIsModalOpen(true); }}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20">
                            + Add Transaction
                        </button>
                        <button 
                            onClick={exportToCSV}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-500/20"
                        >
                            <Download size={18} /> CSV
                        </button>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-full px-6 border border-slate-700">Total Balance: ₹{totalBalance}</div>
                </header>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h3 className="text-xl font-bold">Monthly Budget Goal</h3>
                            <p className="text-slate-400 text-sm">Set your monthly spending limit here</p>
                        </div>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                placeholder="Set Budget (₹)" 
                                className="bg-slate-900 border border-slate-700 p-2 rounded-lg outline-none focus:border-blue-500 w-32"
                                value={newBudgetInput}
                                onChange={(e) => setNewBudgetInput(e.target.value)}
                            />
                            <button 
                                onClick={handleUpdateBudget}
                                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition-all"
                            >
                                Set
                            </button>
                        </div>
                    </div>

                    <div className="w-full bg-slate-700 rounded-full h-4">
                        <div 
                            className={`h-4 rounded-full transition-all duration-500 ${
                                (budget > 0 && (stats.totalExpense / budget) * 100 > 90) ? 'bg-red-500' : 'bg-blue-500'
                            }`} 
                            style={{ width: `${budgetUsagePercent}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between mt-2 text-sm">
                        <span className={(budget > 0 && stats.totalExpense > budget) ? 'text-red-400 font-bold' : 'text-slate-400'}>
                            Spent: ₹{stats.totalExpense}
                        </span>
                        <span className="text-slate-400">Limit: ₹{budget}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mb-8 bg-slate-800/50 p-4 rounded-xl border border-slate-700 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold uppercase">Start Date</label>
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-900 border border-slate-600 p-2 rounded-lg outline-none focus:border-blue-500 text-sm text-white"/>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-400 font-semibold uppercase">End Date</label>
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-900 border border-slate-600 p-2 rounded-lg outline-none focus:border-blue-500 text-sm text-white"/>
                    </div>
                    <button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm">
                        <Filter size={16} /> Filter
                    </button>
                    <button onClick={fetchDashboardData} className="bg-slate-700 hover:bg-slate-600 p-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm text-slate-300">
                        <RefreshCcw size={16} /> Clear
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-green-500 shadow-lg">
                        <p className="text-slate-400 text-sm font-medium">Total Income</p>
                        <h3 className="text-2xl font-bold flex items-center gap-2">₹{stats.totalIncome} <TrendingUp className="text-green-500" /></h3>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-red-500 shadow-lg">
                        <p className="text-slate-400 text-sm font-medium">Total Expense</p>
                        <h3 className="text-2xl font-bold flex items-center gap-2">₹{stats.totalExpense} <TrendingDown className="text-red-500" /></h3>
                    </div>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by description..." 
                        className="bg-slate-800 border border-slate-700 p-2.5 pl-10 rounded-lg w-full focus:border-blue-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            fetchPagedTransactions(0, e.target.value);
                        }}
                    />
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {transactions.length === 0 ? (
                                <p className="text-slate-400 text-center py-4">No records found.</p>
                            ) : (
                                transactions.map((t) => (
                                    <div key={t.id} className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-600 transition-all">
                                        <div>
                                            <p className="font-bold">{t.description}</p>
                                            <p className="text-xs text-slate-500">{t.category} • {t.date?.split('T')[0]}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={t.type === 'INCOME' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                                {t.type === 'INCOME' ? '+' : '-'} ₹{t.amount}
                                            </span>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(t)} className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><Pencil size={16} /></button>
                                                <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {!isLoading && totalPages > 0 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button 
                                disabled={currentPage === 0}
                                onClick={() => fetchPagedTransactions(currentPage - 1, searchTerm)}
                                className="p-2 bg-slate-700 rounded-lg disabled:opacity-30 hover:bg-slate-600 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-sm text-slate-400 font-medium">
                                Page <span className="text-white">{currentPage + 1}</span> of {totalPages}
                            </span>
                            <button 
                                disabled={currentPage + 1 >= totalPages}
                                onClick={() => fetchPagedTransactions(currentPage + 1, searchTerm)}
                                className="p-2 bg-slate-700 rounded-lg disabled:opacity-30 hover:bg-slate-600 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-[#1e293b] p-8 rounded-2xl w-full max-w-md relative border border-slate-700 shadow-2xl">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X /></button>
                            <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-400 uppercase font-bold px-1">Description</label>
                                    <input type="text" required value={formData.description} className="bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500 text-white" onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-400 uppercase font-bold px-1">Amount</label>
                                    <input type="number" required value={formData.amount} className="bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500 text-white" onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-400 uppercase font-bold px-1">Category</label>
                                    <input type="text" required value={formData.category} className="bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500 text-white" onChange={(e) => setFormData({...formData, category: e.target.value})} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-400 uppercase font-bold px-1">Type</label>
                                    <select className="bg-slate-900 border border-slate-700 p-3 rounded-lg outline-none focus:border-blue-500 text-white font-bold" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                        <option value="EXPENSE">Expense</option>
                                        <option value="INCOME">Income</option>
                                    </select>
                                </div>
                                <button type="submit" className="bg-blue-600 hover:bg-blue-500 p-3 rounded-lg font-bold mt-4 transition-all shadow-lg shadow-blue-500/20">
                                    {isEditing ? 'Update Transaction' : 'Save Transaction'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
            <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </div>
    );
};

export default Dashboard;