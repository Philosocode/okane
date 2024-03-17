using FluentValidation;
using Okane.Api.Features.Auth.Entities;

namespace Okane.Api.Features.Auth.Validators;

public class ApiUserValidator : AbstractValidator<ApiUser>
{
    public ApiUserValidator()
    {
        RuleFor(user => user.Email).NotEmpty().EmailAddress();
        RuleFor(user => user.Name).NotEmpty();
    }
}
