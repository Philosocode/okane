using FluentValidation;
using Okane.Api.Shared.Dtos.QueryParameters;

namespace Okane.Api.Shared.Validators;

public class PageQueryParametersValidator : AbstractValidator<PageQueryParameters>
{
    public static readonly string InvalidPageSizeError = $"PageSize must be >= {PageQueryParameters.MinPageSize}";

    public PageQueryParametersValidator()
    {
        RuleFor(p => p.PageSize)
            .GreaterThanOrEqualTo(PageQueryParameters.MinPageSize)
            .When(p => p.PageSize.HasValue)
            .WithMessage(InvalidPageSizeError);
    }
}
