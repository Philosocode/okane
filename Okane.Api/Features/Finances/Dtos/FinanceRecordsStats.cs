namespace Okane.Api.Features.Finances.Dtos;

public record FinanceRecordsStats
{
    public int ExpenseRecords { get; set; }
    public int RevenueRecords { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalRevenue { get; set; }
    public IList<decimal> ExpensesByDate { get; set; } = [];
    public IList<decimal> RevenuesByDate { get; set; } = [];
    public IList<DateTime> Dates { get; set; } = [];
}
