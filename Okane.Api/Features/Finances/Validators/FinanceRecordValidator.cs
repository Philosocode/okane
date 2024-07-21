using FluentValidation;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database.Constants;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordValidator : AbstractValidator<FinanceRecord>
{
    public FinanceRecordValidator()
    {
        RuleFor(r => r.Amount)
            .GreaterThan(0)
            .PrecisionScale(9, 2, false);

        RuleFor(r => r.Description).NotEmpty().MaximumLength(DbConstants.MaxStringLength);
        RuleFor(r => r.HappenedAt).NotEmpty();
        RuleFor(r => r.Type).IsInEnum();
    }
}
