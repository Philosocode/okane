using System.Text.Json.Serialization;

namespace Okane.Api.Features.Finances.Entities;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum FinanceRecordType
{
    Expense,
    Revenue
}
