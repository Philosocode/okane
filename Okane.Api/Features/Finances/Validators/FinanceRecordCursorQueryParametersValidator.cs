using FluentValidation;
using Okane.Api.Features.Finances.Dtos;

namespace Okane.Api.Features.Finances.Validators;

public class FinanceRecordCursorQueryParametersValidator : AbstractValidator<FinanceRecordCursorQueryParameters>
{
    public const string CursorFieldError = "One of CursorAmount or CursorHappenedAt is required, but not both.";
    public const string MissingCursorIdError = "CursorId is required for pagination.";
    public const string CursorSortFieldError = "SortField should be empty when cursor is used.";

    public FinanceRecordCursorQueryParametersValidator()
    {
        RuleFor(p => p.CursorId)
            .NotEmpty()
            .When(p => p.CursorAmount.HasValue || p.CursorHappenedAt.HasValue)
            .WithMessage(MissingCursorIdError);

        RuleFor(p => p)
            .Must(p => p.CursorAmount is null)
            .When(p => p.CursorHappenedAt.HasValue)
            .OverridePropertyName("Cursor")
            .WithMessage(CursorFieldError);
    }
}
