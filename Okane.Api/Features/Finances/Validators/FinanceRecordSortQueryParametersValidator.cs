using FluentValidation;
using Microsoft.IdentityModel.Tokens;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Shared.Constants;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordSortQueryParametersValidator : AbstractValidator<FinanceRecordSortQueryParameters>
{
    public FinanceRecordSortQueryParametersValidator()
    {
        RuleFor(p => p.SortField)
            .Must(sf =>
                sf.IsNullOrEmpty() || FinanceRecordSortFields.AllFields.Contains(sf, StringComparer.OrdinalIgnoreCase)
            )
            .WithMessage(FinanceRecordSortFields.AllowedFieldsMessage);

        RuleFor(p => p.SortDirection)
            .Must(sd =>
                sd.IsNullOrEmpty() || SortDirections.AllOptions.Contains(sd, StringComparer.OrdinalIgnoreCase)
            )
            .WithMessage(SortDirections.AllowedOptionsValidationMessage);
    }
}
