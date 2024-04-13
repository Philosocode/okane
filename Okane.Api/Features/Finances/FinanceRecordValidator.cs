using FluentValidation;
using Okane.Api.Features.Finances.Entities;
using Okane.Api.Infrastructure.Database.Constants;

namespace Okane.Api.Features.Finances;

public class FinanceRecordValidator : AbstractValidator<FinanceRecord>
{
    public FinanceRecordValidator()
    {
        RuleFor(r => r.Amount).GreaterThan(0);
        RuleFor(r => r.Description).NotEmpty().MaximumLength(DbConstants.MaxStringLength);
        RuleFor(r => r.HappenedAt).NotEmpty();
    }
}
