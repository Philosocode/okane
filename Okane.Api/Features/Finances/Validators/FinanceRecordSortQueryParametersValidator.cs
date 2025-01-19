using FluentValidation;
using Okane.Api.Features.Finances.Constants;
using Okane.Api.Features.Finances.Dtos;
using Okane.Api.Shared.Constants;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordSortQueryParametersValidator : AbstractValidator<FinanceRecordSortQueryParameters>
{
    public static readonly string InvalidSortDirectionError = $"Invalid SortDirection. Allowed options include: {
        string.Join(", ", SortDirections.AllOptions)
    }.";

    public static readonly string InvalidSortFieldError = $"Invalid SortField. Allowed options include: {
        FinanceRecordSortFields.AllFields
    }.";

    public FinanceRecordSortQueryParametersValidator()
    {
        RuleFor(p => p.SortDirection)
            .Must(sd => sd is null
                        || SortDirections.AllOptions.Contains(sd, StringComparer.OrdinalIgnoreCase)
            )
            .WithMessage(InvalidSortDirectionError);

        RuleFor(p => p.SortField)
            .Must(sf =>
                sf is null
                || FinanceRecordSortFields.AllFields.Contains(sf, StringComparer.OrdinalIgnoreCase)
            )
            .WithMessage(InvalidSortFieldError);
    }
}
