using FluentValidation;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordStatsQueryParametersValidator : AbstractValidator<FinanceRecordStatsQueryParameters>
{
    public static readonly string InvalidIntervalError = $"Invalid time interval. Allowed options include: {
        string.Join(", ", FinanceRecordStatsIntervals.AllOptions)
    }.";

    public FinanceRecordStatsQueryParametersValidator()
    {
        RuleFor(p => p.TimeInterval)
            .Must(i => FinanceRecordStatsIntervals.AllOptions.Contains(i))
            .WithMessage(InvalidIntervalError);
    }
}
