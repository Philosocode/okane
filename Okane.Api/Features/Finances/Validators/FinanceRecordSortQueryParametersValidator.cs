using FluentValidation;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Shared.Constants;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordSortQueryParametersValidator : AbstractValidator<FinanceRecordSortQueryParameters>
{
    public FinanceRecordSortQueryParametersValidator()
    {
        RuleFor(p => p.SortField)
            .Must(sf => FinanceRecordSortFields.AllFields.Contains(sf, StringComparer.OrdinalIgnoreCase))
            .When(sf => sf is not null)
            .WithMessage(FinanceRecordSortFields.AllowedFieldsMessage);

        RuleFor(p => p.SortDirection)
            .Must(sd => SortDirections.AllOptions.Contains(sd, StringComparer.OrdinalIgnoreCase))
            .When(sd => sd is not null)
            .WithMessage(SortDirections.AllowedOptionsValidationMessage);
    }
}
