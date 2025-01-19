using FluentValidation;
using Okane.Api.Features.Finances.Dtos;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordFilterQueryParametersValidator : AbstractValidator<FinanceRecordFilterQueryParameters>
{
    public const string InvalidAmountsError = "MaxAmount must be greater than MinAmount.";
    public const string InvalidHappenedAtsError = "HappenedAfter must be before HappenedBefore.";
    public const string MaxAmountError = "MaxAmount must be greater than 0.";
    public const string MinAmountError = "MinAmount must be greater than 0.";

    public FinanceRecordFilterQueryParametersValidator()
    {
        RuleFor(p => p.MaxAmount)
            .GreaterThan(p => 0)
            .When(p => p.MaxAmount.HasValue)
            .WithMessage(MaxAmountError);

        RuleFor(p => p.MinAmount)
            .GreaterThan(p => 0)
            .When(p => p.MinAmount.HasValue)
            .WithMessage(MinAmountError);

        RuleFor(p => p.MaxAmount)
            .GreaterThan(p => p.MinAmount)
            .When(p => p.MaxAmount.HasValue && p.MinAmount.HasValue)
            .WithMessage(InvalidAmountsError);

        RuleFor(p => p.HappenedAfter)
            .LessThan(p => p.HappenedBefore)
            .When(p => p.HappenedBefore.HasValue && p.HappenedAfter.HasValue)
            .WithMessage(InvalidHappenedAtsError);
    }
}
