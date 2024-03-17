using FluentValidation;
using Okane.Api.Features.Auth.Exceptions;
using Okane.Api.Shared.Dtos.ApiResponse;

namespace Okane.Api.Shared.Mappings;

public static class ValidationMappings
{
    public static IEnumerable<ApiResponseError> MapToApiResponseErrors(this ValidationException exception)
    {
        return exception.Errors.Select(error => new ApiResponseError
        {
            Key = error.PropertyName,
            Message = error.ErrorMessage,
        });
    }

    public static IEnumerable<ApiResponseError> MapToApiResponseErrors(this IdentityException exception)
    {
        return exception.Errors.Select(error => new ApiResponseError
        {
            Key = error.Code,
            Message = error.Description,
        });
    }
}
