using FluentValidation;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordsStatsQueryParametersValidator : AbstractValidator<FinanceRecordsStatsQueryParameters>
{
    public static readonly string InvalidIntervalError = $"Invalid time interval. Allowed options include: {
        string.Join(", ", FinanceRecordsStatsIntervals.AllOptions)
    }.";

    public FinanceRecordsStatsQueryParametersValidator()
    {
        RuleFor(p => p.TimeInterval)
            .Must(i => FinanceRecordsStatsIntervals.AllOptions.Contains(i))
            .WithMessage(InvalidIntervalError);
    }
}
