using FluentValidation;
using Okane.Api.Features.Auth.Exceptions;
using Okane.Api.Shared.Dtos.ApiResponse;

namespace Okane.Api.Shared.Mappings;

public static class ValidationMappings
{
    public static ApiValidationErrorsResponse MapToValidationErrorsResponse(this ValidationException exception)
    {
        return new ApiValidationErrorsResponse
        {
            Errors = exception.Errors.Select(error => new ValidationError
            {
                PropertyName = error.PropertyName,
                Message = error.ErrorMessage,
            })
        };
    }

    public static ApiValidationErrorsResponse MapToValidationErrorsResponse(this IdentityException exception)
    {
        return new ApiValidationErrorsResponse
        {
            Errors = exception.Errors.Select(error => new ValidationError
            {
                Message = error.Description,
                PropertyName = error.Code,
            })
        };
    }
}
