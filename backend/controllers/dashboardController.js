export async function getDashboardOverview(req, res) {
  const userId = req.user._id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    // Aggregated totals
    const incomeAgg = await incomeModel.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: now } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const expenseAgg = await expenseModel.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: now } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const monthlyIncome = incomeAgg[0]?.total || 0;
    const monthlyExpense = expenseAgg[0]?.total || 0;
    const savings = monthlyIncome - monthlyExpense;
    const savingsRate =
      monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

    // Recent transactions
    const recentIncome = await incomeModel
      .find({ userId, date: { $gte: startOfMonth, $lte: now } })
      .sort({ date: -1 })
      .limit(10)
      .lean();
    const recentExpense = await expenseModel
      .find({ userId, date: { $gte: startOfMonth, $lte: now } })
      .sort({ date: -1 })
      .limit(10)
      .lean();

    const recentTransactions = [
      ...recentIncome.map((i) => ({ ...i, type: "income" })),
      ...recentExpense.map((e) => ({ ...e, type: "expense" })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Expense by category
    const categoryAgg = await expenseModel.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: now } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);
    const expenseDistribution = categoryAgg.map(({ _id, total }) => ({
      category: _id || "Other",
      amount: total,
      percent:
        monthlyExpense === 0 ? 0 : Math.round((total / monthlyExpense) * 100),
    }));

    return res.status(200).json({
      success: true,
      data: {
        monthlyIncome,
        monthlyExpense,
        savings,
        savingsRate,
        recentTransactions,
        expenseDistribution,
      },
    });
  } catch (err) {
    console.error("GetDashboardOverview Error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Dashboard Fetch failed" });
  }
}
